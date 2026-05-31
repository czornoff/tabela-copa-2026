import { teams as localTeams } from "./teams";

// Dicionário de mapeamento para normalizar nomes de seleções da API-Football para IDs locais
export const apiTeamNameToId: Record<string, string> = {
  "brazil": "bra",
  "argentina": "arg",
  "mexico": "mex",
  "south africa": "rsa",
  "korea republic": "kor",
  "south korea": "kor",
  "czech republic": "czr",
  "canada": "can",
  "japan": "jpn",
  "switzerland": "sui",
  "bosnia & herzegovina": "bih",
  "bosnia and herzegovina": "bih",
  "morocco": "mar",
  "haiti": "hai",
  "scotland": "sco",
  "usa": "usa",
  "united states": "usa",
  "paraguay": "par",
  "australia": "aus",
  "turkey": "tur",
  "germany": "ger",
  "ivory coast": "civ",
  "curaçao": "cuw",
  "curacao": "cuw",
  "netherlands": "ned",
  "sweden": "swe",
  "tunisia": "tun",
  "belgium": "bel",
  "iran": "irn",
  "new zealand": "nzl",
  "egypt": "egy",
  "spain": "esp",
  "saudi arabia": "sau",
  "uruguay": "uru",
  "cape verde": "cpv",
  "france": "fra",
  "senegal": "sen",
  "iraq": "irq",
  "norway": "nor",
  "algeria": "alg",
  "austria": "aut",
  "jordan": "jor",
  "portugal": "por",
  "dr congo": "cod",
  "congo": "cod",
  "democratic republic of congo": "cod",
  "uzbekistan": "uzb",
  "colombia": "col",
  "england": "eng",
  "croatia": "cro",
  "ghana": "gha",
  "panama": "pan",
};

// Função para mapear o time retornado pela API para o ID local de 3 letras
export function mapTeamToLocalId(teamName: string, teamCode?: string): string {
  if (teamCode) {
    const codeLower = teamCode.toLowerCase();
    if (codeLower === "ksa") return "sau"; // Mapeamento específico da Arábia Saudita
    const localTeam = localTeams.find((t) => t.code.toLowerCase() === codeLower);
    if (localTeam) return localTeam.id;
  }

  const nameNorm = teamName.toLowerCase().trim();
  if (apiTeamNameToId[nameNorm]) {
    return apiTeamNameToId[nameNorm];
  }

  const matchByName = localTeams.find(
    (t) => t.name.toLowerCase() === nameNorm || t.id === nameNorm
  );
  if (matchByName) return matchByName.id;

  return nameNorm.slice(0, 3);
}
