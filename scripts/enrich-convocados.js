#!/usr/bin/env node
/**
 * scripts/enrich-convocados.js
 *
 * Enriquece data/convocados.json com dados da API-Football:
 *   - photo    → URL da foto do jogador
 *   - height   → altura em cm (número inteiro)
 *   - weight   → peso em kg (número inteiro)
 *   - currentTeam → { name, logo } do clube atual
 *
 * ESTRATÉGIA (máximo 96 chamadas por execução):
 *   Fase 1: GET /players/squads?team=ID  × 48 times → IDs + fotos
 *   Fase 2: GET /players?team=ID&season=SEASON × 48 times → altura + peso
 *
 * USO:
 *   node scripts/enrich-convocados.js              # execução completa
 *   node scripts/enrich-convocados.js --dry-run    # não salva o JSON final
 *   node scripts/enrich-convocados.js --phase1     # só fase 1 (squads)
 *   node scripts/enrich-convocados.js --phase2     # só fase 2 (stats)
 *   node scripts/enrich-convocados.js --apply      # só aplica cache ao JSON (sem API)
 *
 * RETOMADA AUTOMÁTICA:
 *   O cache é salvo em data/.enrich-cache.json após cada time processado.
 *   Execute novamente com as mesmas flags para retomar de onde parou.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── Configuração ─────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* .env.local ausente, usar variáveis de ambiente */ }
}
loadEnv();

const API_KEY    = process.env.API_FOOTBALL_KEY;
const API_HOST   = 'v3.football.api-sports.io';
const SEASONS    = [2026, 2025, 2024]; // ordem de prioridade

const DRY_RUN    = process.argv.includes('--dry-run');
const ONLY_P1    = process.argv.includes('--phase1');
const ONLY_P2    = process.argv.includes('--phase2');
const ONLY_APPLY = process.argv.includes('--apply');

const DATA_FILE  = path.join(__dirname, '../data/convocados.json');
const CACHE_FILE = path.join(__dirname, '../data/.enrich-cache.json');

// ─── Mapeamento teamId local → API-Football nacional team ID ─────────────────
// Fonte: teamsMapping.ts (localIdToApiTeamId) + complementos pesquisados

const TEAM_ID_MAP = {
  alg: 1168,  arg: 26,    aus: 20,    aut: 775,
  bel: 1,     bih: 1113,  bra: 6,     can: 5529,
  civ: 1170,  cod: 1220,  col: 8,     cpv: 1533,
  cro: 44,    cuw: 1606,  czr: 770,   ecu: 1731,
  egy: 32,    eng: 10,    esp: 9,     fra: 2,
  ger: 25,    gha: 1182,  hai: 513,   irn: 22,
  irq: 1185,  jpn: 12,    jor: 1527,  kor: 17,
  mar: 1112,  mex: 16,    ned: 1118,  nor: 1176,
  nzl: 1174,  pan: 1187,  par: 2380,  por: 27,
  qat: 1569,  rsa: 1531,  sau: 23,    sco: 1108,
  sen: 1173,  sui: 15,    swe: 1178,  tun: 1169,
  tur: 777,   usa: 40,    uru: 7,     uzb: 1511,
};

// ─── Utilitários de nome ──────────────────────────────────────────────────────

function normalizeName(name = '') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos/diacríticos
    .toLowerCase()
    .replace(/\bj[uú]nior\b/gi, '')    // remove "junior" / "júnior"
    .replace(/\bjr\.?\b/gi, '')        // remove "Jr" / "Jr."
    .replace(/[''`]/g, '')             // apóstrofos
    .replace(/[-]/g, ' ')              // hífens → espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula similaridade entre dois nomes (0.0 - 1.0)
 */
function nameSimilarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);

  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.9;

  const partsA = na.split(' ').filter(p => p.length > 1);
  const partsB = nb.split(' ').filter(p => p.length > 1);
  const setB   = new Set(partsB);
  const hits   = partsA.filter(p => setB.has(p)).length;
  const total  = Math.max(partsA.length, partsB.length);

  return total > 0 ? hits / total : 0;
}

const MATCH_THRESHOLD = 0.5;

/**
 * Encontra o melhor match de `name` dentro de `candidates = [{name, ...}]`
 */
function findBestMatch(name, candidates) {
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = nameSimilarity(name, c.name);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore >= MATCH_THRESHOLD ? { item: best, score: bestScore } : null;
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

function apiGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        hostname: API_HOST,
        path: urlPath,
        headers: {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': API_KEY,
        },
      },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            const json      = JSON.parse(raw);
            const remaining = parseInt(res.headers['x-ratelimit-requests-remaining'] ?? '-1');
            resolve({ json, remaining });
          } catch (e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Fase 1: Squads (foto + IDs) ─────────────────────────────────────────────

async function phase1(teams, convocados, cache) {
  console.log('\n━━━ FASE 1: Squads (foto + IDs) ━━━━━━━━━━━━━━━━━━━━━━━━\n');
  let calls = 0;

  for (const teamId of teams) {
    const apiId = TEAM_ID_MAP[teamId];
    if (!apiId) {
      console.log(`⚠️  ${teamId}: sem mapeamento API-Football — pulando`);
      continue;
    }
    if (cache[teamId]?.squadDone) {
      console.log(`⏭️  ${teamId}: squad já em cache`);
      continue;
    }

    process.stdout.write(`📡 ${teamId} (ID ${apiId}) squad... `);
    try {
      const { json, remaining } = await apiGet(`/players/squads?team=${apiId}`);
      calls++;

      if (!json.response?.length) {
        console.log(`❌ sem dados | erros: ${JSON.stringify(json.errors)}`);
      } else {
        const squad = json.response[0];
        if (!cache[teamId]) cache[teamId] = {};
        cache[teamId].apiTeamId   = apiId;
        cache[teamId].apiTeamName = squad.team.name;
        cache[teamId].squadPlayers = squad.players; // [{id,name,age,number,position,photo}]
        cache[teamId].squadDone   = true;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`✅ ${squad.team.name} | ${squad.players.length} jogadores | restam ${remaining} req`);

        if (remaining >= 0 && remaining <= 3) {
          console.log('\n🛑 Limite de requisições quase esgotado. Encerrando fase 1.');
          break;
        }
      }
    } catch (e) {
      console.log(`❌ erro: ${e.message}`);
    }
    await sleep(6500);
  }

  return calls;
}

// ─── Fase 2: Players stats (altura + peso) ────────────────────────────────────

async function phase2(teams, cache) {
  console.log('\n━━━ FASE 2: Altura e Peso ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  let calls = 0;

  for (const teamId of teams) {
    const apiId = TEAM_ID_MAP[teamId];
    if (!apiId || !cache[teamId]?.squadDone) continue;
    if (cache[teamId]?.playersDone) {
      console.log(`⏭️  ${teamId}: stats já em cache`);
      continue;
    }

    let found = false;
    for (const season of SEASONS) {
      process.stdout.write(`📡 ${teamId} /players?team=${apiId}&season=${season}... `);
      try {
        const { json, remaining } = await apiGet(`/players?team=${apiId}&season=${season}`);
        calls++;

        if (!json.response?.length) {
          console.log(`⚠️  sem dados (season ${season})`);
          await sleep(6500);
          continue;
        }

        // Coletar todas as páginas se necessário
        let allPlayers = [...json.response];
        const totalPages = json.paging?.total ?? 1;
        for (let page = 2; page <= totalPages; page++) {
          const { json: jp } = await apiGet(`/players?team=${apiId}&season=${season}&page=${page}`);
          calls++;
          allPlayers = allPlayers.concat(jp.response ?? []);
          await sleep(6500);
        }

        cache[teamId].playersData  = allPlayers;
        cache[teamId].playersDone  = true;
        cache[teamId].playerSeason = season;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`✅ ${allPlayers.length} jogadores (season ${season}) | restam ${remaining} req`);

        if (remaining >= 0 && remaining <= 3) {
          console.log('\n🛑 Limite de requisições quase esgotado. Encerrando fase 2.');
          return calls;
        }

        found = true;
        break;
      } catch (e) {
        console.log(`❌ erro: ${e.message}`);
      }
      await sleep(6500);
    }
    if (!found) console.log(`   ❌ ${teamId}: sem dados em nenhuma season`);
  }

  return calls;
}

// ─── Aplicar cache ao JSON ─────────────────────────────────────────────────────

function applyCache(convocados, cache) {
  console.log('\n━━━ APLICANDO CACHE AO JSON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const stats = { total: 0, photo: 0, height: 0, weight: 0, club: 0, noMatch: 0 };

  for (const [teamId, team] of Object.entries(convocados)) {
    const tc = cache[teamId];
    if (!tc) { console.log(`⚠️  ${teamId}: sem cache`); continue; }

    const squadPlayers = tc.squadPlayers  ?? [];
    const playersData  = tc.playersData   ?? [];

    // Mapa: nome normalizado → objeto
    const squadByNorm  = new Map(squadPlayers.map(p => [normalizeName(p.name), p]));
    const statsByNorm  = new Map(playersData.map(pd => [normalizeName(pd.player.name), pd]));
    const statsById    = new Map(playersData.map(pd => [pd.player.id, pd]));

    let teamMatched = 0;

    for (const player of team.players) {
      stats.total++;
      const norm = normalizeName(player.name);

      // ─ Match na squad (foto + apiId) ─
      let squadHit = squadByNorm.get(norm);
      if (!squadHit) {
        const res = findBestMatch(player.name, squadPlayers);
        if (res) squadHit = res.item;
      }

      if (squadHit) {
        player.photo = squadHit.photo;
        player.apiId = squadHit.id;
        stats.photo++;
        teamMatched++;
      }

      // ─ Match nas stats (altura + peso) ─
      // Prioridade: pelo apiId já encontrado na squad, depois por nome
      let statsHit = player.apiId ? statsById.get(player.apiId) : undefined;
      if (!statsHit) {
        statsHit = statsByNorm.get(norm);
        if (!statsHit) {
          const res = findBestMatch(player.name, playersData.map(pd => ({ name: pd.player.name, _pd: pd })));
          if (res) statsHit = res.item._pd;
        }
      }

      if (statsHit) {
        const { height, weight } = statsHit.player;
        if (height && !isNaN(parseInt(height))) player.height = parseInt(height);
        if (weight && !isNaN(parseInt(weight))) player.weight = parseInt(weight);
        if (player.height) stats.height++;
        if (player.weight) stats.weight++;

        // Time atual: primeiro stat cujo team.id ≠ seleção
        const clubStat = statsHit.statistics?.find(s => s.team?.id !== tc.apiTeamId);
        if (clubStat?.team) {
          player.currentTeam = {
            name: clubStat.team.name,
            logo: clubStat.team.logo,
          };
          stats.club++;
        }
      }

      if (!squadHit && !statsHit) stats.noMatch++;
    }

    const pct = ((teamMatched / team.players.length) * 100).toFixed(0);
    console.log(`  ${teamId.padEnd(4)} ${tc.apiTeamName?.padEnd(30) ?? '???'.padEnd(30)} ${teamMatched}/${team.players.length} (${pct}%)`);
  }

  return stats;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏆 Enriquecimento de convocados.json via API-Football\n');

  if (!API_KEY && !ONLY_APPLY) {
    console.error('❌  API_FOOTBALL_KEY não encontrada em .env.local');
    process.exit(1);
  }

  const convocados = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const teams      = Object.keys(convocados);
  console.log(`📋 Times carregados: ${teams.length} | Jogadores: ${teams.reduce((n, t) => n + convocados[t].players.length, 0)}`);

  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const done = Object.keys(cache).length;
    console.log(`📦 Cache carregado: ${done} times já processados (${CACHE_FILE})`);
  }

  let totalCalls = 0;

  if (!ONLY_APPLY) {
    if (!ONLY_P2) totalCalls += await phase1(teams, convocados, cache);
    if (!ONLY_P1) totalCalls += await phase2(teams, cache);
    console.log(`\n📞 Total de chamadas nesta execução: ${totalCalls}`);
  }

  // Aplicar cache ao JSON
  const stats = applyCache(convocados, cache);

  const pct = (n) => ((n / stats.total) * 100).toFixed(1);
  console.log('\n📊 Resumo:');
  console.log(`   Jogadores:    ${stats.total}`);
  console.log(`   Com foto:     ${stats.photo} (${pct(stats.photo)}%)`);
  console.log(`   Com altura:   ${stats.height} (${pct(stats.height)}%)`);
  console.log(`   Com peso:     ${stats.weight} (${pct(stats.weight)}%)`);
  console.log(`   Com clube:    ${stats.club} (${pct(stats.club)}%)`);
  console.log(`   Sem match:    ${stats.noMatch} (${pct(stats.noMatch)}%)`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — arquivo não foi salvo.');
    return;
  }

  // Backup automático antes de salvar
  const bckFile = DATA_FILE.replace('.json', '_bck.json');
  if (!fs.existsSync(bckFile)) {
    fs.copyFileSync(DATA_FILE, bckFile);
    console.log(`\n💾 Backup criado: ${bckFile}`);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(convocados, null, 2));
  console.log(`💾 Arquivo salvo: ${DATA_FILE}`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err);
  process.exit(1);
});
