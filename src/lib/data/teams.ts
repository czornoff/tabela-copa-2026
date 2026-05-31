import type { Team } from "@/types";

function squad(
  team: string,
  players: [string, "GK" | "DEF" | "MID" | "FWD", string, number][]
) {
  return players.map(([name, position, club, number], i) => ({
    id: `${team}-${i}`,
    name,
    position,
    club,
    number,
  }));
}

export const teams: Team[] = [
  {
    id: "bra",
    name: "Brasil",
    code: "BRA",
    flag: "🇧🇷",
    federation: "CONMEBOL",
    groupId: "C",
    squad: squad("bra", [
      ["Alisson", "GK", "Liverpool", 1],
      ["Ederson", "GK", "Manchester City", 12],
      ["Marquinhos", "DEF", "PSG", 4],
      ["Gabriel", "DEF", "Arsenal", 3],
      ["Danilo", "DEF", "Juventus", 2],
      ["Casemiro", "MID", "Manchester United", 5],
      ["Bruno Guimarães", "MID", "Newcastle", 8],
      ["Rodrygo", "FWD", "Real Madrid", 11],
      ["Vinícius Jr.", "FWD", "Real Madrid", 7],
      ["Richarlison", "FWD", "Tottenham", 9],
      ["Endrick", "FWD", "Real Madrid", 19],
    ]),
  },
  {
    id: "arg",
    name: "Argentina",
    code: "ARG",
    flag: "🇦🇷",
    federation: "CONMEBOL",
    groupId: "J",
    squad: squad("arg", [
      ["Emiliano Martínez", "GK", "Aston Villa", 1],
      ["Cristian Romero", "DEF", "Tottenham", 13],
      ["Lisandro Martínez", "DEF", "Manchester United", 19],
      ["Enzo Fernández", "MID", "Chelsea", 24],
      ["Alexis Mac Allister", "MID", "Liverpool", 20],
      ["Lionel Messi", "FWD", "Inter Miami", 10],
      ["Lautaro Martínez", "FWD", "Inter", 22],
      ["Julián Álvarez", "FWD", "Atlético Madrid", 9],
    ]),
  },
  {
    id: "mex",
    name: "México",
    code: "MEX",
    flag: "🇲🇽",
    federation: "CONCACAF",
    groupId: "A",
    squad: squad("mex", [
      ["Guillermo Ochoa", "GK", "Salernitana", 13],
      ["Edson Álvarez", "DEF", "West Ham", 4],
      ["Hirving Lozano", "FWD", "PSV", 22],
      ["Santiago Giménez", "FWD", "Feyenoord", 11],
    ]),
  },
  {
    id: "rsa",
    name: "África do Sul",
    code: "RSA",
    flag: "🇿🇦",
    federation: "CAF",
    groupId: "A",
    squad: squad("rsa", [
      ["Ronwen Williams", "GK", "Mamelodi Sundowns", 1],
      ["Percy Tau", "FWD", "Al Ahly", 11],
    ]),
  },
  {
    id: "kor",
    name: "Coreia do Sul",
    code: "KOR",
    flag: "🇰🇷",
    federation: "AFC",
    groupId: "A",
    squad: squad("kor", [
      ["Kim Seung-gyu", "GK", "Al Shabab", 1],
      ["Son Heung-min", "FWD", "Tottenham", 7],
    ]),
  },
  {
    id: "czr",
    name: "Tchéquia",
    code: "CZE",
    flag: "🇨🇿",
    federation: "UEFA",
    groupId: "A",
    squad: squad("czr", [
      ["Tomáš Vaclík", "GK", "Norwich", 1],
      ["Patrik Schick", "FWD", "Leverkusen", 10],
    ]),
  },
  {
    id: "mar",
    name: "Marrocos",
    code: "MAR",
    flag: "🇲🇦",
    federation: "CAF",
    groupId: "C",
    squad: squad("mar", [
      ["Yassine Bounou", "GK", "Al Hilal", 1],
      ["Achraf Hakimi", "DEF", "PSG", 2],
      ["Sofiane Boufal", "FWD", "Urawa Reds", 17],
    ]),
  },
  {
    id: "hai",
    name: "Haiti",
    code: "HAI",
    flag: "🇭🇹",
    federation: "CONCACAF",
    groupId: "C",
    squad: squad("hai", [
      ["Johny Placide", "GK", "Valenciennes", 1],
      ["Duckens Nazon", "FWD", "Dunkerque", 9],
    ]),
  },
  {
    id: "sco",
    name: "Escócia",
    code: "SCO",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    federation: "UEFA",
    groupId: "C",
    squad: squad("sco", [
      ["Angus Gunn", "GK", "Norwich", 1],
      ["Andy Robertson", "DEF", "Liverpool", 3],
    ]),
  },
  {
    id: "usa",
    name: "Estados Unidos",
    code: "USA",
    flag: "🇺🇸",
    federation: "CONCACAF",
    groupId: "D",
    squad: squad("usa", [
      ["Matt Turner", "GK", "Nottingham Forest", 1],
      ["Christian Pulisic", "FWD", "AC Milan", 10],
    ]),
  },
  {
    id: "par",
    name: "Paraguai",
    code: "PAR",
    flag: "🇵🇾",
    federation: "CONMEBOL",
    groupId: "D",
    squad: squad("par", [
      ["Antony Silva", "GK", "Olimpia", 1],
      ["Miguel Almirón", "MID", "Newcastle", 10],
    ]),
  },
  {
    id: "aus",
    name: "Austrália",
    code: "AUS",
    flag: "🇦🇺",
    federation: "AFC",
    groupId: "D",
    squad: squad("aus", [
      ["Mathew Ryan", "GK", "Roma", 1],
      ["Harry Souttar", "DEF", "Leicester", 4],
    ]),
  },
  {
    id: "tur",
    name: "Turquia",
    code: "TUR",
    flag: "🇹🇷",
    federation: "UEFA",
    groupId: "D",
    squad: squad("tur", [
      ["Uğurcan Çakır", "GK", "Trabzonspor", 1],
      ["Hakan Çalhanoğlu", "MID", "Inter", 10],
    ]),
  },
  {
    id: "fra",
    name: "França",
    code: "FRA",
    flag: "🇫🇷",
    federation: "UEFA",
    groupId: "I",
    squad: squad("fra", [
      ["Mike Maignan", "GK", "AC Milan", 1],
      ["Kylian Mbappé", "FWD", "Real Madrid", 10],
    ]),
  },
  {
    id: "ger",
    name: "Alemanha",
    code: "GER",
    flag: "🇩🇪",
    federation: "UEFA",
    groupId: "E",
    squad: squad("ger", [
      ["Manuel Neuer", "GK", "Bayern", 1],
      ["Jamal Musiala", "MID", "Bayern", 10],
    ]),
  },
  {
    id: "esp",
    name: "Espanha",
    code: "ESP",
    flag: "🇪🇸",
    federation: "UEFA",
    groupId: "H",
    squad: squad("esp", [
      ["Unai Simón", "GK", "Athletic", 1],
      ["Lamine Yamal", "FWD", "Barcelona", 19],
    ]),
  },
  {
    id: "eng",
    name: "Inglaterra",
    code: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    federation: "UEFA",
    groupId: "L",
    squad: squad("eng", [
      ["Jordan Pickford", "GK", "Everton", 1],
      ["Harry Kane", "FWD", "Bayern", 9],
    ]),
  },
  {
    id: "civ",
    name: "Costa do Marfim",
    code: "CIV",
    flag: "🇨🇮",
    federation: "CAF",
    groupId: "E",
    squad: squad("civ", [
      ["Sébastien Haller", "FWD", "Borussia Dortmund", 9],
    ]),
  },
  {
    id: "por",
    name: "Portugal",
    code: "POR",
    flag: "🇵🇹",
    federation: "UEFA",
    groupId: "K",
    squad: squad("por", [
      ["Diogo Costa", "GK", "Porto", 1],
      ["Cristiano Ronaldo", "FWD", "Al Nassr", 7],
    ]),
  },
  {
    id: "ned",
    name: "Holanda",
    code: "NED",
    flag: "🇳🇱",
    federation: "UEFA",
    groupId: "F",
    squad: squad("ned", [
      ["Virgil van Dijk", "DEF", "Liverpool", 4],
      ["Memphis Depay", "FWD", "Corinthians", 10],
    ]),
  },
  {
    id: "jpn",
    name: "Japão",
    code: "JPN",
    flag: "🇯🇵",
    federation: "AFC",
    groupId: "F",
    squad: squad("jpn", [
      ["Takefusa Kubo", "FWD", "Real Sociedad", 10],
    ]),
  },
  {
    id: "can",
    name: "Canadá",
    code: "CAN",
    flag: "🇨🇦",
    federation: "CONCACAF",
    groupId: "B",
    squad: squad("can", [
      ["Alphonso Davies", "DEF", "Bayern", 19],
      ["Jonathan David", "FWD", "Lille", 20],
    ]),
  },
  {
    id: "bih",
    name: "Bósnia e Herzegovina",
    code: "BIH",
    flag: "🇧🇦",
    federation: "UEFA",
    groupId: "B",
    squad: squad("bih", [
      ["Asmir Begović", "GK", "Queens Park Rangers", 1],
      ["Edin Džeko", "FWD", "Fenerbahçe", 9],
    ]),
  },
  {
    id: "sui",
    name: "Suíça",
    code: "SUI",
    flag: "🇨🇭",
    federation: "UEFA",
    groupId: "B",
    squad: squad("sui", [
      ["Granit Xhaka", "MID", "Leverkusen", 10],
    ]),
  },
  {
    id: "uru",
    name: "Uruguai",
    code: "URU",
    flag: "🇺🇾",
    federation: "CONMEBOL",
    groupId: "H",
    squad: squad("uru", [
      ["Darwin Núñez", "FWD", "Liverpool", 9],
    ]),
  },
  {
    id: "col",
    name: "Colômbia",
    code: "COL",
    flag: "🇨🇴",
    federation: "CONMEBOL",
    groupId: "K",
    squad: squad("col", [
      ["Luis Díaz", "FWD", "Liverpool", 7],
    ]),
  },
  {
    id: "sen",
    name: "Senegal",
    code: "SEN",
    flag: "🇸🇳",
    federation: "CAF",
    groupId: "I",
    squad: squad("sen", [
      ["Sadio Mané", "FWD", "Al Nassr", 10],
    ]),
  },
  {
    id: "nzl",
    name: "Nova Zelândia",
    code: "NZL",
    flag: "🇳🇿",
    federation: "OFC",
    groupId: "G",
    squad: squad("nzl", [
      ["Chris Wood", "FWD", "Nottingham Forest", 9],
    ]),
  },
  {
    id: "ecu",
    name: "Equador",
    code: "ECU",
    flag: "🇪🇨",
    federation: "CONMEBOL",
    groupId: "E",
    squad: squad("ecu", [
      ["Enner Valencia", "FWD", "Internacional", 13],
    ]),
  },
  {
    id: "qat",
    name: "Catar",
    code: "QAT",
    flag: "🇶🇦",
    federation: "AFC",
    groupId: "F",
    squad: squad("qat", [
      ["Akram Afif", "FWD", "Al Sadd", 11],
    ]),
  },
  {
    id: "bel",
    name: "Bélgica",
    code: "BEL",
    flag: "🇧🇪",
    federation: "UEFA",
    groupId: "G",
    squad: squad("bel", [
      ["Kevin De Bruyne", "MID", "Manchester City", 7],
    ]),
  },
  {
    id: "egy",
    name: "Egito",
    code: "EGY",
    flag: "🇪🇬",
    federation: "CAF",
    groupId: "G",
    squad: squad("egy", [
      ["Mohamed Salah", "FWD", "Liverpool", 10],
    ]),
  },
  {
    id: "irn",
    name: "Irã",
    code: "IRN",
    flag: "🇮🇷",
    federation: "AFC",
    groupId: "G",
    squad: squad("irn", [
      ["Mehdi Taremi", "FWD", "Porto", 9],
    ]),
  },
  {
    id: "cro",
    name: "Croácia",
    code: "CRO",
    flag: "🇭🇷",
    federation: "UEFA",
    groupId: "L",
    squad: squad("cro", [
      ["Luka Modrić", "MID", "Real Madrid", 10],
    ]),
  },
  {
    id: "gha",
    name: "Gana",
    code: "GHA",
    flag: "🇬🇭",
    federation: "CAF",
    groupId: "H",
    squad: squad("gha", [
      ["Mohammed Kudus", "MID", "West Ham", 20],
    ]),
  },
  {
    id: "cpv",
    name: "Cabo Verde",
    code: "CPV",
    flag: "🇨🇻",
    federation: "CAF",
    groupId: "H",
    squad: squad("cpv", [
      ["Ryan Mendes", "FWD", "Al-Nasr", 10],
    ]),
  },
  {
    id: "irq",
    name: "Iraque",
    code: "IRQ",
    flag: "🇮🇶",
    federation: "AFC",
    groupId: "I",
    squad: squad("irq", [
      ["Ali Al-Hamadi", "FWD", "Ipswich Town", 9],
    ]),
  },
  {
    id: "sau",
    name: "Arábia Saudita",
    code: "KSA",
    flag: "🇸🇦",
    federation: "AFC",
    groupId: "H",
    squad: squad("sau", [
      ["Salem Al-Dawsari", "MID", "Al Hilal", 10],
    ]),
  },
  {
    id: "nor",
    name: "Noruega",
    code: "NOR",
    flag: "🇳🇴",
    federation: "UEFA",
    groupId: "I",
    squad: squad("nor", [
      ["Erling Haaland", "FWD", "Manchester City", 9],
    ]),
  },
  {
    id: "cuw",
    name: "Curaçao",
    code: "CUW",
    flag: "🇨🇼",
    federation: "CONCACAF",
    groupId: "E",
    squad: squad("cuw", [
      ["Leandro Bacuna", "MID", "Cardiff City", 10],
    ]),
  },
  {
    id: "tun",
    name: "Tunísia",
    code: "TUN",
    flag: "🇹🇳",
    federation: "CAF",
    groupId: "F",
    squad: squad("tun", [
      ["Youssef Msakni", "FWD", "Al Arabi", 7],
    ]),
  },
  {
    id: "jor",
    name: "Jordânia",
    code: "JOR",
    flag: "🇯🇴",
    federation: "AFC",
    groupId: "J",
    squad: squad("jor", [
      ["Mousa Al-Taamari", "FWD", "Montpellier", 10],
    ]),
  },
  {
    id: "cod",
    name: "RD Congo",
    code: "COD",
    flag: "🇨🇩",
    federation: "CAF",
    groupId: "K",
    squad: squad("cod", [
      ["Cédric Bakambu", "FWD", "Al-Nassr", 9],
    ]),
  },
  {
    id: "alg",
    name: "Argélia",
    code: "ALG",
    flag: "🇩🇿",
    federation: "CAF",
    groupId: "J",
    squad: squad("alg", [
      ["Riyad Mahrez", "FWD", "Al Ahli", 7],
    ]),
  },
  {
    id: "swe",
    name: "Suécia",
    code: "SWE",
    flag: "🇸🇪",
    federation: "UEFA",
    groupId: "F",
    squad: squad("swe", [
      ["Alexander Isak", "FWD", "Newcastle", 9],
    ]),
  },
  {
    id: "aut",
    name: "Áustria",
    code: "AUT",
    flag: "🇦🇹",
    federation: "UEFA",
    groupId: "L",
    squad: squad("aut", [
      ["David Alaba", "DEF", "Real Madrid", 4],
    ]),
  },
  {
    id: "uzb",
    name: "Uzbequistão",
    code: "UZB",
    flag: "🇺🇿",
    federation: "AFC",
    groupId: "K",
    squad: squad("uzb", [
      ["Eldor Shomurodov", "FWD", "Roma", 9],
    ]),
  },
  {
    id: "pan",
    name: "Panamá",
    code: "PAN",
    flag: "🇵🇦",
    federation: "CONCACAF",
    groupId: "L",
    squad: squad("pan", [
      ["Aníbal Godoy", "MID", "Nashville", 6],
    ]),
  },
];

export function getTeamById(id: string) {
  return teams.find((t) => t.id === id);
}

export function getTeamsByFederation() {
  const map = new Map<string, Team[]>();
  teams.forEach((t) => {
    const list = map.get(t.federation) ?? [];
    list.push(t);
    map.set(t.federation, list);
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
