import { NextRequest, NextResponse } from "next/server";

const BEARER_TOKEN = "fd_5e259f80b635a4e81d40475b4758a5c8887858550d29e8b6";
const API_BASE = "https://footballdata.io/api/v1";

const localIdToFootballdataName: Record<string, string> = {
  bra: "Brazil",
  arg: "Argentina",
  usa: "USMNT",
  mex: "Mexico",
  can: "Canada",
  eng: "England",
  fra: "France",
  ger: "Germany",
  esp: "Spain",
  por: "Portugal",
  ned: "Netherlands",
  bel: "Belgium",
  cro: "Croatia",
  mar: "Morocco",
  jpn: "Japan",
  kor: "South Korea",
  aus: "Australia",
  irn: "Iran",
  sau: "Saudi Arabia",
  tur: "Turkey",
  sui: "Switzerland",
  aut: "Austria",
  uru: "Uruguay",
  col: "Colombia",
  ecu: "Ecuador",
  sen: "Senegal",
  gha: "Ghana",
  civ: "Ivory Coast",
  tun: "Tunisia",
  alg: "Algeria",
  egy: "Egypt",
  rsa: "South Africa",
  cpv: "Cape Verde Islands",
  pan: "Panama",
  nzl: "New Zealand",
  par: "Paraguay",
  czr: "Czech Republic",
  sco: "Scotland",
  qat: "Qatar",
  nor: "Norway",
  swe: "Sweden",
  bih: "Bosnia and Herzegovina",
  cuw: "Curaçao",
  irq: "Iraq",
  jor: "Jordan",
  cod: "Congo DR",
  uzb: "Uzbekistan",
  hai: "Haiti",
};

let matchesCache: { data: unknown[]; ts: number } | null = null;
const MATCHES_CACHE_TTL = 60 * 60 * 1000;

async function getSeasonMatches() {
  if (matchesCache && Date.now() - matchesCache.ts < MATCHES_CACHE_TTL) {
    return matchesCache.data;
  }

  const res = await fetch(`${API_BASE}/seasons/618/matches`, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });

  if (!res.ok) throw new Error(`Season API returned ${res.status}`);
  const json = await res.json();
  const matches = json?.data?.matches ?? [];
  matchesCache = { data: matches, ts: Date.now() };
  return matches;
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const { searchParams } = new URL(req.url);
  const homeLocalId = searchParams.get("home") ?? "";
  const awayLocalId = searchParams.get("away") ?? "";
  const matchDate = searchParams.get("date") ?? "";

  try {
    const homeName = localIdToFootballdataName[homeLocalId] ?? "";
    const awayName = localIdToFootballdataName[awayLocalId] ?? "";

    if (!homeName || !awayName) {
      return NextResponse.json(
        { error: `Unknown team: ${homeLocalId} or ${awayLocalId}` },
        { status: 400 }
      );
    }

    const allMatches = await getSeasonMatches();

    function shiftDate(dateStr: string, days: number): string {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d + days);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    }

    const possibleDates = [matchDate, shiftDate(matchDate, 1), shiftDate(matchDate, -1)];

    const target = allMatches.find((m: Record<string, unknown>) => {
      const ht = (m.home_team as Record<string, string>)?.team_name ?? "";
      const at = (m.away_team as Record<string, string>)?.team_name ?? "";
      const md = (m.match_date as string)?.slice(0, 10) ?? "";

      const homeMatch = normalize(ht) === normalize(homeName);
      const awayMatch = normalize(at) === normalize(awayName);
      const dateMatch = possibleDates.includes(md);

      return homeMatch && awayMatch && dateMatch;
    });

    if (!target) {
      return NextResponse.json({ match: null, events: [] });
    }

    const apiMatchId = (target as Record<string, unknown>).match_id;

    const res = await fetch(`${API_BASE}/matches/${apiMatchId}/events`, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Events API returned ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const events = json?.data?.events ?? [];
    const match = json?.data?.match;

    interface RawEv {
      minute: number | null;
      extra_minute?: number | null;
      team_side: string;
      event_type: string;
      player?: { player_name?: string };
      player_in?: { player_name?: string };
      player_out?: { player_name?: string };
      assist?: { player_name?: string };
      detail?: string;
      raw?: { player_out_time?: string; event_time?: string; time?: string };
    }

    function parseMinute(ev: RawEv): { minute: number; extraMinute: number | null } {
      if (ev.event_type === "substitution" && ev.raw?.player_out_time) {
        const timeStr = ev.raw.player_out_time.replace(/[^0-9+]/g, "");
        const parts = timeStr.split("+");
        return {
          minute: parseInt(parts[0], 10) || 0,
          extraMinute: parts[1] ? parseInt(parts[1], 10) || null : null,
        };
      }
      if (ev.minute === null || ev.minute === undefined) {
        const rawTime = ev.raw?.event_time ?? ev.raw?.time ?? "0";
        const cleaned = rawTime.replace(/[^0-9+]/g, "");
        const parts = cleaned.split("+");
        return {
          minute: parseInt(parts[0], 10) || 0,
          extraMinute: parts[1] ? parseInt(parts[1], 10) || null : ev.extra_minute ?? null,
        };
      }
      return { minute: ev.minute, extraMinute: ev.extra_minute ?? null };
    }

    const filtered = events.filter((ev: RawEv) => {
      if (ev.event_type === "substitution") {
        const piName = ev.player_in?.player_name;
        const poName = ev.player_out?.player_name;
        return piName && piName !== null && poName && poName !== null;
      }
      return true;
    });

    const normalized: {
      minute: number;
      extraMinute: number | null;
      teamSide: string;
      type: string;
      player: string;
      playerIn: string;
      playerOut: string;
      assist: string | null;
      detail: string | null;
    }[] = [];

    let i = 0;
    while (i < filtered.length) {
      const ev = filtered[i];
      const { minute, extraMinute } = parseMinute(ev);
      const playerName = ev.player?.player_name ?? "";

      if (ev.event_type === "goal" && i + 1 < filtered.length) {
        const next = filtered[i + 1];
        const nextName = next.player?.player_name ?? "";
        const nextParsed = parseMinute(next);

        if (
          next.event_type === "goal" &&
          nextName === playerName &&
          nextParsed.minute === minute &&
          nextParsed.extraMinute === extraMinute
        ) {
          const withAssist = ev.assist?.player_name ? ev : next.assist?.player_name ? next : ev;
          normalized.push({
            minute,
            extraMinute,
            teamSide: withAssist.team_side,
            type: withAssist.event_type,
            player: playerName,
            playerIn: "",
            playerOut: "",
            assist: withAssist.assist?.player_name ?? null,
            detail: withAssist.detail ?? null,
          });
          i += 2;
          continue;
        }
      }

      normalized.push({
        minute,
        extraMinute,
        teamSide: ev.team_side,
        type: ev.event_type,
        player: playerName,
        playerIn: ev.player_in?.player_name ?? "",
        playerOut: ev.player_out?.player_name ?? "",
        assist: ev.assist?.player_name ?? null,
        detail: ev.detail ?? null,
      });
      i++;
    }

    return NextResponse.json({
      match: match
        ? {
            homeTeam: match.home_team?.team_name ?? "",
            awayTeam: match.away_team?.team_name ?? "",
            score: match.score,
          }
        : null,
      events: normalized,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
