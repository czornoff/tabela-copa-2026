import type { Group, GroupMatch, KnockoutMatch, TournamentScorer } from "@/types";
import { getTeamById } from "./teams";

interface ApiTeam {
  name: string;
  code?: string;
  logo: string;
}

interface ApiStandingRow {
  rank: number;
  team: ApiTeam;
  points: number;
  goalsDiff: number;
  group: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
    };
  };
  league: {
    round: string;
  };
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

import { fetchFromApi } from "./api";
import { mapTeamToLocalId, fdTeamIdToLocalId } from "./teamsMapping";
import {
  fetchWorldCupStandings,
  fetchWorldCupMatches,
  fetchWorldCupScorers,
} from "./footballData";

// ─── Conversão de fuso horário: horário local do venue → Brasília (UTC-3) ───
const venueUtcOffsets: Record<string, number> = {
  // México (horário padrão o ano todo após abolição do DST em 2022)
  "Mexico City": -6,
  "Guadalajara (Zapopan)": -6,
  "Monterrey (Guadalupe)": -6,
  // EUA - Leste (DST: UTC-4)
  "Atlanta": -4,
  "Boston (Foxborough)": -4,
  "Miami (Miami Gardens)": -4,
  "New York/New Jersey (East Rutherford)": -4,
  "Philadelphia": -4,
  // EUA - Central (DST: UTC-5)
  "Dallas (Arlington)": -5,
  "Houston": -5,
  "Kansas City": -5,
  // EUA - Pacífico (DST: UTC-7)
  "Los Angeles (Inglewood)": -7,
  "San Francisco Bay Area (Santa Clara)": -7,
  "Seattle": -7,
  // Canadá (DST em vigor)
  "Toronto": -4,
  "Vancouver": -7,
};

const BRASILIA_UTC_OFFSET = -3;

function convertToBrasilia(date: string, time: string, venue: string): { date: string; time: string } {
  const venueOffset = venueUtcOffsets[venue];
  if (venueOffset === undefined) return { date, time };

  const [day, month, year] = date.split("/").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const diffMinutes = (BRASILIA_UTC_OFFSET - venueOffset) * 60;
  let totalMinutes = hours * 60 + minutes + diffMinutes;

  let dayOffset = 0;
  if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    dayOffset = 1;
  } else if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    dayOffset = -1;
  }

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  let newDate = date;
  if (dayOffset !== 0) {
    const d = new Date(year, month - 1, day + dayOffset);
    newDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }

  return {
    date: newDate,
    time: `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`,
  };
}

function applyBrasiliaTimezone<T extends { date: string; time: string; venue: string }>(matches: T[]): T[] {
  return matches.map((match) => {
    const converted = convertToBrasilia(match.date, match.time, match.venue);
    return { ...match, date: converted.date, time: converted.time };
  });
}

function applyAutoFinishedStatus<T extends { date: string; time: string; status?: string }>(matches: T[]): T[] {
  const now = new Date();
  const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const brNowDate = `${String(brNow.getUTCDate()).padStart(2, "0")}/${String(brNow.getUTCMonth() + 1).padStart(2, "0")}/${brNow.getUTCFullYear()}`;
  const brNowTime = `${String(brNow.getUTCHours()).padStart(2, "0")}:${String(brNow.getUTCMinutes()).padStart(2, "0")}`;

  return matches.map((match) => {
    if (match.status) return match;

    const matchDateStr = match.date.split("/").reverse().join("-");
    const brNowDateStr = brNowDate.split("/").reverse().join("-");

    if (matchDateStr < brNowDateStr) {
      return { ...match, status: "FINISHED" };
    }
    if (matchDateStr === brNowDateStr && match.time < brNowTime) {
      return { ...match, status: "FINISHED" };
    }

    return match;
  });
}

// Mapeamento dos nomes de rounds da API-Football para o português
function mapRoundName(apiRound: string): string {
  const r = apiRound.toLowerCase();
  if (r.includes("round of 32") || r.includes("last_32")) return "16 avos";
  if (r.includes("round of 16") || r.includes("last_16")) return "Oitavas";
  if (r.includes("quarter-finals") || r.includes("quarter-final")) return "Quartas";
  if (r.includes("semi-finals") || r.includes("semi-final")) return "Semifinal";
  if (r.includes("final")) return "Final";
  return apiRound;
}

// Formatar data ISO da API para DD/MM/YYYY (Brasília UTC-3)
function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const brTime = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    const day = String(brTime.getUTCDate()).padStart(2, "0");
    const month = String(brTime.getUTCMonth() + 1).padStart(2, "0");
    const year = brTime.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}

export const localBackupGroups: Group[] = [
  {
    id: "A",
    name: "Grupo A",
    teams: ["mex", "rsa", "kor", "czr"],
    standings: [
      { teamId: "mex", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "rsa", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "kor", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "czr", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "B",
    name: "Grupo B",
    teams: ["can", "qat", "sui", "bih"],
    standings: [
      { teamId: "can", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "qat", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "sui", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "bih", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "C",
    name: "Grupo C",
    teams: ["bra", "mar", "hai", "sco"],
    standings: [
      { teamId: "bra", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "mar", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "hai", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "sco", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "D",
    name: "Grupo D",
    teams: ["usa", "par", "aus", "tur"],
    standings: [
      { teamId: "usa", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "par", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "aus", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "tur", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "E",
    name: "Grupo E",
    teams: ["ger", "civ", "ecu", "cuw"],
    standings: [
      { teamId: "ger", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "civ", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "ecu", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "cuw", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "F",
    name: "Grupo F",
    teams: ["ned", "jpn", "swe", "tun"],
    standings: [
      { teamId: "ned", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "jpn", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "swe", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "tun", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "G",
    name: "Grupo G",
    teams: ["bel", "irn", "nzl", "egy"],
    standings: [
      { teamId: "bel", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "irn", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "nzl", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "egy", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "H",
    name: "Grupo H",
    teams: ["esp", "sau", "uru", "cpv"],
    standings: [
      { teamId: "esp", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "sau", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "uru", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "cpv", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "I",
    name: "Grupo I",
    teams: ["fra", "sen", "irq", "nor"],
    standings: [
      { teamId: "fra", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "sen", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "irq", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "nor", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "J",
    name: "Grupo J",
    teams: ["arg", "alg", "aut", "jor"],
    standings: [
      { teamId: "arg", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "alg", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "aut", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "jor", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "K",
    name: "Grupo K",
    teams: ["por", "cod", "uzb", "col"],
    standings: [
      { teamId: "por", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "cod", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "uzb", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "col", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
  {
    id: "L",
    name: "Grupo L",
    teams: ["eng", "cro", "gha", "pan"],
    standings: [
      { teamId: "eng", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "cro", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "gha", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { teamId: "pan", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ],
  },
];

const localBackupGroupMatchesRaw: GroupMatch[] = [
  // ─── Grupo A ──────────────────────────────────────────────
  { id: "ga-1", groupId: "A", matchday: 1, homeTeam: "mex", awayTeam: "rsa", date: "11/06/2026", time: "13:00", venue: "Mexico City", game: "1" },
  { id: "ga-2", groupId: "A", matchday: 1, homeTeam: "kor", awayTeam: "czr", date: "11/06/2026", time: "20:00", venue: "Guadalajara (Zapopan)", game: "2" },
  { id: "ga-3", groupId: "A", matchday: 2, homeTeam: "czr", awayTeam: "rsa", date: "18/06/2026", time: "12:00", venue: "Atlanta", game: "17" },
  { id: "ga-4", groupId: "A", matchday: 2, homeTeam: "mex", awayTeam: "kor", date: "18/06/2026", time: "19:00", venue: "Guadalajara (Zapopan)", game: "18" },
  { id: "ga-5", groupId: "A", matchday: 3, homeTeam: "czr", awayTeam: "mex", date: "24/06/2026", time: "19:00", venue: "Mexico City", game: "33" },
  { id: "ga-6", groupId: "A", matchday: 3, homeTeam: "rsa", awayTeam: "kor", date: "24/06/2026", time: "19:00", venue: "Monterrey (Guadalupe)", game: "34" },
  // ─── Grupo B ──────────────────────────────────────────────
  { id: "gb-1", groupId: "B", matchday: 1, homeTeam: "can", awayTeam: "bih", date: "12/06/2026", time: "15:00", venue: "Toronto", game: "3" },
  { id: "gb-2", groupId: "B", matchday: 1, homeTeam: "qat", awayTeam: "sui", date: "13/06/2026", time: "12:00", venue: "San Francisco Bay Area (Santa Clara)", game: "4" },
  { id: "gb-3", groupId: "B", matchday: 2, homeTeam: "sui", awayTeam: "bih", date: "18/06/2026", time: "12:00", venue: "Los Angeles (Inglewood)", game: "19" },
  { id: "gb-4", groupId: "B", matchday: 2, homeTeam: "can", awayTeam: "qat", date: "18/06/2026", time: "15:00", venue: "Vancouver", game: "20" },
  { id: "gb-5", groupId: "B", matchday: 3, homeTeam: "sui", awayTeam: "can", date: "24/06/2026", time: "12:00", venue: "Vancouver", game: "35" },
  { id: "gb-6", groupId: "B", matchday: 3, homeTeam: "bih", awayTeam: "qat", date: "24/06/2026", time: "12:00", venue: "Seattle", game: "36" },
  // ─── Grupo C ──────────────────────────────────────────────
  { id: "gc-1", groupId: "C", matchday: 1, homeTeam: "bra", awayTeam: "mar", date: "13/06/2026", time: "18:00", venue: "New York/New Jersey (East Rutherford)", game: "5" },
  { id: "gc-2", groupId: "C", matchday: 1, homeTeam: "hai", awayTeam: "sco", date: "13/06/2026", time: "21:00", venue: "Boston (Foxborough)", game: "6" },
  { id: "gc-3", groupId: "C", matchday: 2, homeTeam: "sco", awayTeam: "mar", date: "19/06/2026", time: "18:00", venue: "Boston (Foxborough)", game: "21" },
  { id: "gc-4", groupId: "C", matchday: 2, homeTeam: "bra", awayTeam: "hai", date: "19/06/2026", time: "20:30", venue: "Philadelphia", game: "22" },
  { id: "gc-5", groupId: "C", matchday: 3, homeTeam: "sco", awayTeam: "bra", date: "24/06/2026", time: "18:00", venue: "Miami (Miami Gardens)", game: "37" },
  { id: "gc-6", groupId: "C", matchday: 3, homeTeam: "mar", awayTeam: "hai", date: "24/06/2026", time: "18:00", venue: "Atlanta", game: "38" },
  // ─── Grupo D ──────────────────────────────────────────────
  { id: "gd-1", groupId: "D", matchday: 1, homeTeam: "usa", awayTeam: "par", date: "12/06/2026", time: "18:00", venue: "Los Angeles (Inglewood)", game: "7" },
  { id: "gd-2", groupId: "D", matchday: 1, homeTeam: "aus", awayTeam: "tur", date: "13/06/2026", time: "21:00", venue: "Vancouver", game: "8" },
  { id: "gd-3", groupId: "D", matchday: 2, homeTeam: "usa", awayTeam: "aus", date: "19/06/2026", time: "12:00", venue: "Seattle", game: "23" },
  { id: "gd-4", groupId: "D", matchday: 2, homeTeam: "tur", awayTeam: "par", date: "19/06/2026", time: "20:00", venue: "San Francisco Bay Area (Santa Clara)", game: "24" },
  { id: "gd-5", groupId: "D", matchday: 3, homeTeam: "tur", awayTeam: "usa", date: "25/06/2026", time: "19:00", venue: "Los Angeles (Inglewood)", game: "39" },
  { id: "gd-6", groupId: "D", matchday: 3, homeTeam: "par", awayTeam: "aus", date: "25/06/2026", time: "19:00", venue: "San Francisco Bay Area (Santa Clara)", game: "40" },
  // ─── Grupo E ──────────────────────────────────────────────
  { id: "ge-1", groupId: "E", matchday: 1, homeTeam: "ger", awayTeam: "cuw", date: "14/06/2026", time: "12:00", venue: "Houston", game: "9" },
  { id: "ge-2", groupId: "E", matchday: 1, homeTeam: "civ", awayTeam: "ecu", date: "14/06/2026", time: "19:00", venue: "Philadelphia", game: "10" },
  { id: "ge-3", groupId: "E", matchday: 2, homeTeam: "ger", awayTeam: "civ", date: "20/06/2026", time: "16:00", venue: "Toronto", game: "25" },
  { id: "ge-4", groupId: "E", matchday: 2, homeTeam: "ecu", awayTeam: "cuw", date: "20/06/2026", time: "19:00", venue: "Kansas City", game: "26" },
  { id: "ge-5", groupId: "E", matchday: 3, homeTeam: "cuw", awayTeam: "civ", date: "25/06/2026", time: "16:00", venue: "Philadelphia", game: "41" },
  { id: "ge-6", groupId: "E", matchday: 3, homeTeam: "ecu", awayTeam: "ger", date: "25/06/2026", time: "16:00", venue: "New York/New Jersey (East Rutherford)", game: "42" },
  // ─── Grupo F ──────────────────────────────────────────────
  { id: "gf-1", groupId: "F", matchday: 1, homeTeam: "ned", awayTeam: "jpn", date: "14/06/2026", time: "15:00", venue: "Dallas (Arlington)", game: "11" },
  { id: "gf-2", groupId: "F", matchday: 1, homeTeam: "swe", awayTeam: "tun", date: "14/06/2026", time: "20:00", venue: "Monterrey (Guadalupe)", game: "12" },
  { id: "gf-3", groupId: "F", matchday: 2, homeTeam: "ned", awayTeam: "swe", date: "20/06/2026", time: "12:00", venue: "Houston", game: "27" },
  { id: "gf-4", groupId: "F", matchday: 2, homeTeam: "tun", awayTeam: "jpn", date: "20/06/2026", time: "22:00", venue: "Monterrey (Guadalupe)", game: "28" },
  { id: "gf-5", groupId: "F", matchday: 3, homeTeam: "jpn", awayTeam: "swe", date: "25/06/2026", time: "18:00", venue: "Dallas (Arlington)", game: "43" },
  { id: "gf-6", groupId: "F", matchday: 3, homeTeam: "tun", awayTeam: "ned", date: "25/06/2026", time: "18:00", venue: "Kansas City", game: "44" },
  // ─── Grupo G ──────────────────────────────────────────────
  { id: "gg-1", groupId: "G", matchday: 1, homeTeam: "bel", awayTeam: "egy", date: "15/06/2026", time: "12:00", venue: "Seattle", game: "13" },
  { id: "gg-2", groupId: "G", matchday: 1, homeTeam: "irn", awayTeam: "nzl", date: "15/06/2026", time: "18:00", venue: "Los Angeles (Inglewood)", game: "14" },
  { id: "gg-3", groupId: "G", matchday: 2, homeTeam: "bel", awayTeam: "irn", date: "21/06/2026", time: "12:00", venue: "Los Angeles (Inglewood)", game: "29" },
  { id: "gg-4", groupId: "G", matchday: 2, homeTeam: "nzl", awayTeam: "egy", date: "21/06/2026", time: "18:00", venue: "Vancouver", game: "30" },
  { id: "gg-5", groupId: "G", matchday: 3, homeTeam: "egy", awayTeam: "irn", date: "26/06/2026", time: "20:00", venue: "Seattle", game: "45" },
  { id: "gg-6", groupId: "G", matchday: 3, homeTeam: "nzl", awayTeam: "bel", date: "26/06/2026", time: "20:00", venue: "Vancouver", game: "46" },
  // ─── Grupo H ──────────────────────────────────────────────
  { id: "gh-1", groupId: "H", matchday: 1, homeTeam: "esp", awayTeam: "cpv", date: "15/06/2026", time: "12:00", venue: "Atlanta", game: "15" },
  { id: "gh-2", groupId: "H", matchday: 1, homeTeam: "sau", awayTeam: "uru", date: "15/06/2026", time: "18:00", venue: "Miami (Miami Gardens)", game: "16" },
  { id: "gh-3", groupId: "H", matchday: 2, homeTeam: "esp", awayTeam: "sau", date: "21/06/2026", time: "12:00", venue: "Atlanta", game: "31" },
  { id: "gh-4", groupId: "H", matchday: 2, homeTeam: "uru", awayTeam: "cpv", date: "21/06/2026", time: "18:00", venue: "Miami (Miami Gardens)", game: "32" },
  { id: "gh-5", groupId: "H", matchday: 3, homeTeam: "cpv", awayTeam: "sau", date: "26/06/2026", time: "19:00", venue: "Houston", game: "47" },
  { id: "gh-6", groupId: "H", matchday: 3, homeTeam: "uru", awayTeam: "esp", date: "26/06/2026", time: "18:00", venue: "Guadalajara (Zapopan)", game: "48" },
  // ─── Grupo I ──────────────────────────────────────────────
  { id: "gi-1", groupId: "I", matchday: 1, homeTeam: "fra", awayTeam: "sen", date: "16/06/2026", time: "15:00", venue: "New York/New Jersey (East Rutherford)", game: "17" },
  { id: "gi-2", groupId: "I", matchday: 1, homeTeam: "irq", awayTeam: "nor", date: "16/06/2026", time: "18:00", venue: "Boston (Foxborough)", game: "18" },
  { id: "gi-3", groupId: "I", matchday: 2, homeTeam: "fra", awayTeam: "irq", date: "22/06/2026", time: "17:00", venue: "Philadelphia", game: "33" },
  { id: "gi-4", groupId: "I", matchday: 2, homeTeam: "nor", awayTeam: "sen", date: "22/06/2026", time: "20:00", venue: "New York/New Jersey (East Rutherford)", game: "34" },
  { id: "gi-5", groupId: "I", matchday: 3, homeTeam: "nor", awayTeam: "fra", date: "26/06/2026", time: "15:00", venue: "Boston (Foxborough)", game: "49" },
  { id: "gi-6", groupId: "I", matchday: 3, homeTeam: "sen", awayTeam: "irq", date: "26/06/2026", time: "15:00", venue: "Toronto", game: "50" },
  // ─── Grupo J ──────────────────────────────────────────────
  { id: "gj-1", groupId: "J", matchday: 1, homeTeam: "arg", awayTeam: "alg", date: "16/06/2026", time: "20:00", venue: "Kansas City", game: "19" },
  { id: "gj-2", groupId: "J", matchday: 1, homeTeam: "aut", awayTeam: "jor", date: "16/06/2026", time: "21:00", venue: "San Francisco Bay Area (Santa Clara)", game: "20" },
  { id: "gj-3", groupId: "J", matchday: 2, homeTeam: "arg", awayTeam: "aut", date: "22/06/2026", time: "12:00", venue: "Dallas (Arlington)", game: "37" },
  { id: "gj-4", groupId: "J", matchday: 2, homeTeam: "jor", awayTeam: "alg", date: "22/06/2026", time: "20:00", venue: "San Francisco Bay Area (Santa Clara)", game: "38" },
  { id: "gj-5", groupId: "J", matchday: 3, homeTeam: "alg", awayTeam: "aut", date: "27/06/2026", time: "21:00", venue: "Kansas City", game: "53" },
  { id: "gj-6", groupId: "J", matchday: 3, homeTeam: "jor", awayTeam: "arg", date: "27/06/2026", time: "21:00", venue: "Dallas (Arlington)", game: "54" },
  // ─── Grupo K ──────────────────────────────────────────────
  { id: "gk-1", groupId: "K", matchday: 1, homeTeam: "por", awayTeam: "cod", date: "17/06/2026", time: "12:00", venue: "Houston", game: "21" },
  { id: "gk-2", groupId: "K", matchday: 1, homeTeam: "uzb", awayTeam: "col", date: "17/06/2026", time: "20:00", venue: "Mexico City", game: "22" },
  { id: "gk-3", groupId: "K", matchday: 2, homeTeam: "por", awayTeam: "uzb", date: "23/06/2026", time: "12:00", venue: "Houston", game: "39" },
  { id: "gk-4", groupId: "K", matchday: 2, homeTeam: "col", awayTeam: "cod", date: "23/06/2026", time: "20:00", venue: "Guadalajara (Zapopan)", game: "40" },
  { id: "gk-5", groupId: "K", matchday: 3, homeTeam: "col", awayTeam: "por", date: "27/06/2026", time: "19:30", venue: "Miami (Miami Gardens)", game: "55" },
  { id: "gk-6", groupId: "K", matchday: 3, homeTeam: "cod", awayTeam: "uzb", date: "27/06/2026", time: "19:30", venue: "Atlanta", game: "56" },
  // ─── Grupo L ──────────────────────────────────────────────
  { id: "gl-1", groupId: "L", matchday: 1, homeTeam: "eng", awayTeam: "cro", date: "17/06/2026", time: "15:00", venue: "Dallas (Arlington)", game: "23" },
  { id: "gl-2", groupId: "L", matchday: 1, homeTeam: "gha", awayTeam: "pan", date: "17/06/2026", time: "19:00", venue: "Toronto", game: "24" },
  { id: "gl-3", groupId: "L", matchday: 2, homeTeam: "eng", awayTeam: "gha", date: "23/06/2026", time: "16:00", venue: "Boston (Foxborough)", game: "41" },
  { id: "gl-4", groupId: "L", matchday: 2, homeTeam: "pan", awayTeam: "cro", date: "23/06/2026", time: "19:00", venue: "Toronto", game: "42" },
  { id: "gl-5", groupId: "L", matchday: 3, homeTeam: "pan", awayTeam: "eng", date: "27/06/2026", time: "17:00", venue: "New York/New Jersey (East Rutherford)", game: "57" },
  { id: "gl-6", groupId: "L", matchday: 3, homeTeam: "cro", awayTeam: "gha", date: "27/06/2026", time: "17:00", venue: "Philadelphia", game: "58" },
];

export const localBackupGroupMatches: GroupMatch[] = applyAutoFinishedStatus(applyBrasiliaTimezone(localBackupGroupMatchesRaw));

export const localBackupKnockoutMatches: KnockoutMatch[] = applyAutoFinishedStatus(applyBrasiliaTimezone([
  // 16 avos (Round of 32)
  { id: "r32-1", round: "16 avos", homeTeam: "2A", awayTeam: "2B", date: "28/06/2026", time: "12:00", venue: "Los Angeles (Inglewood)", game: "73" },
  { id: "r32-2", round: "16 avos", homeTeam: "1E", awayTeam: "3A/B/C/D/F", date: "29/06/2026", time: "16:30", venue: "Boston (Foxborough)", game: "74" },
  { id: "r32-3", round: "16 avos", homeTeam: "1F", awayTeam: "2C", date: "29/06/2026", time: "19:00", venue: "Monterrey (Guadalupe)", game: "75" },
  { id: "r32-4", round: "16 avos", homeTeam: "1C", awayTeam: "2F", date: "29/06/2026", time: "12:00", venue: "Houston", game: "76" },
  { id: "r32-5", round: "16 avos", homeTeam: "1I", awayTeam: "3C/D/F/G/H", date: "30/06/2026", time: "17:00", venue: "New York/New Jersey (East Rutherford)", game: "77" },
  { id: "r32-6", round: "16 avos", homeTeam: "2E", awayTeam: "2I", date: "30/06/2026", time: "12:00", venue: "Dallas (Arlington)", game: "78" },
  { id: "r32-7", round: "16 avos", homeTeam: "1A", awayTeam: "3C/E/F/H/I", date: "30/06/2026", time: "19:00", venue: "Mexico City", game: "79" },
  { id: "r32-8", round: "16 avos", homeTeam: "1L", awayTeam: "3E/H/I/J/K", date: "01/07/2026", time: "12:00", venue: "Atlanta", game: "80" },
  { id: "r32-9", round: "16 avos", homeTeam: "1D", awayTeam: "3B/E/F/I/J", date: "01/07/2026", time: "17:00", venue: "San Francisco Bay Area (Santa Clara)", game: "81" },
  { id: "r32-10", round: "16 avos", homeTeam: "1G", awayTeam: "3A/E/H/I/J", date: "01/07/2026", time: "13:00", venue: "Seattle", game: "82" },
  { id: "r32-11", round: "16 avos", homeTeam: "2K", awayTeam: "2L", date: "02/07/2026", time: "19:00", venue: "Toronto", game: "83" },
  { id: "r32-12", round: "16 avos", homeTeam: "1H", awayTeam: "2J", date: "02/07/2026", time: "12:00", venue: "Los Angeles (Inglewood)", game: "84" },
  { id: "r32-13", round: "16 avos", homeTeam: "1B", awayTeam: "3E/F/G/I/J", date: "02/07/2026", time: "20:00", venue: "Vancouver", game: "85" },
  { id: "r32-14", round: "16 avos", homeTeam: "1J", awayTeam: "2H", date: "03/07/2026", time: "18:00", venue: "Miami (Miami Gardens)", game: "86" },
  { id: "r32-15", round: "16 avos", homeTeam: "1K", awayTeam: "3D/E/I/J/L", date: "03/07/2026", time: "20:30", venue: "Kansas City", game: "87" },
  { id: "r32-16", round: "16 avos", homeTeam: "2D", awayTeam: "2G", date: "03/07/2026", time: "13:00", venue: "Dallas (Arlington)", game: "88" },
  // Oitavas (Round of 16)
  { id: "r16-1", round: "Oitavas", homeTeam: "W74", awayTeam: "W77", date: "04/07/2026", time: "17:00", venue: "Philadelphia", game: "89" },
  { id: "r16-2", round: "Oitavas", homeTeam: "W73", awayTeam: "W75", date: "04/07/2026", time: "12:00", venue: "Houston", game: "90" },
  { id: "r16-3", round: "Oitavas", homeTeam: "W76", awayTeam: "W78", date: "05/07/2026", time: "16:00", venue: "New York/New Jersey (East Rutherford)", game: "91" },
  { id: "r16-4", round: "Oitavas", homeTeam: "W79", awayTeam: "W80", date: "05/07/2026", time: "18:00", venue: "Mexico City", game: "92" },
  { id: "r16-5", round: "Oitavas", homeTeam: "W83", awayTeam: "W84", date: "06/07/2026", time: "14:00", venue: "Dallas (Arlington)", game: "93" },
  { id: "r16-6", round: "Oitavas", homeTeam: "W81", awayTeam: "W82", date: "06/07/2026", time: "17:00", venue: "Seattle", game: "94" },
  { id: "r16-7", round: "Oitavas", homeTeam: "W86", awayTeam: "W88", date: "07/07/2026", time: "12:00", venue: "Atlanta", game: "95" },
  { id: "r16-8", round: "Oitavas", homeTeam: "W85", awayTeam: "W87", date: "07/07/2026", time: "13:00", venue: "Vancouver", game: "96" },
  // Quartas (Quarter-finals)
  { id: "qf-1", round: "Quartas", homeTeam: "W89", awayTeam: "W90", date: "09/07/2026", time: "16:00", venue: "Boston (Foxborough)", game: "97" },
  { id: "qf-2", round: "Quartas", homeTeam: "W93", awayTeam: "W94", date: "10/07/2026", time: "12:00", venue: "Los Angeles (Inglewood)", game: "98" },
  { id: "qf-3", round: "Quartas", homeTeam: "W91", awayTeam: "W92", date: "11/07/2026", time: "17:00", venue: "Miami (Miami Gardens)", game: "99" },
  { id: "qf-4", round: "Quartas", homeTeam: "W95", awayTeam: "W96", date: "11/07/2026", time: "20:00", venue: "Kansas City", game: "100" },
  // Semifinal (Semi-finals)
  { id: "sf-1", round: "Semifinal", homeTeam: "W97", awayTeam: "W98", date: "14/07/2026", time: "14:00", venue: "Dallas (Arlington)", game: "101" },
  { id: "sf-2", round: "Semifinal", homeTeam: "W99", awayTeam: "W100", date: "15/07/2026", time: "15:00", venue: "Atlanta", game: "102" },
  // Disputa pelo 3º lugar
  { id: "3rd", round: "Disputa pelo 3º lugar", homeTeam: "L101", awayTeam: "L102", date: "18/07/2026", time: "17:00", venue: "Miami (Miami Gardens)", game: "103" },
  // Final
  { id: "final", round: "Final", homeTeam: "W101", awayTeam: "W102", date: "19/07/2026", time: "15:00", venue: "New York/New Jersey (East Rutherford)", game: "104" },
]));

async function fetchFromFootballDataOrg(): Promise<{
  groups: Group[];
  groupMatches: GroupMatch[];
  knockoutMatches: KnockoutMatch[];
  topScorers: TournamentScorer[];
} | null> {
  try {
    const [standings, matches, scorers] = await Promise.all([
      fetchWorldCupStandings().catch(() => []),
      fetchWorldCupMatches().catch(() => []),
      fetchWorldCupScorers().catch(() => []),
    ]);

    if (!standings || standings.length === 0) return null;

    // Map standings to Group[]
    // football-data.org returns: standings[] -> { group, table[] }
    const groupMap = new Map<string, { teams: string[]; standings: Group["standings"] }>();
    for (const groupEntry of standings) {
      const groupLetter = (groupEntry.group || "").replace(/group\s+/i, "").trim().toUpperCase().slice(-1) || "A";
      if (!groupMap.has(groupLetter)) {
        groupMap.set(groupLetter, { teams: [], standings: [] });
      }
      const group = groupMap.get(groupLetter)!;

      for (const row of groupEntry.table || []) {
        if (!row?.team) continue;
        const teamId = fdTeamIdToLocalId[row.team.id] || row.team.tla?.toLowerCase() || "unk";
        group.teams.push(teamId);
        group.standings.push({
          teamId,
          played: row.playedGames ?? 0,
          won: row.won ?? 0,
          drawn: row.draw ?? 0,
          lost: row.lost ?? 0,
          goalsFor: row.goalsFor ?? 0,
          goalsAgainst: row.goalsAgainst ?? 0,
          points: row.points ?? 0,
        });
      }
    }

    const groups: Group[] = [];
    for (const [id, data] of groupMap) {
      groups.push({
        id,
        name: `Grupo ${id}`,
        teams: data.teams,
        standings: data.standings,
      });
    }
    groups.sort((a, b) => a.id.localeCompare(b.id));

    // Map matches to GroupMatch[] + KnockoutMatch[]
    const groupMatches: GroupMatch[] = [];
    const knockoutMatches: KnockoutMatch[] = [];

    if (matches && matches.length > 0) {
      for (const m of matches) {
        if (!m?.homeTeam || !m?.awayTeam) continue;
        const homeId = fdTeamIdToLocalId[m.homeTeam.id] || m.homeTeam.tla?.toLowerCase() || "unk";
        const awayId = fdTeamIdToLocalId[m.awayTeam.id] || m.awayTeam.tla?.toLowerCase() || "unk";

        const dt = new Date(m.utcDate);
        // Converter UTC para Brasília (UTC-3)
        const brTime = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
        const date = `${String(brTime.getUTCDate()).padStart(2, "0")}/${String(brTime.getUTCMonth() + 1).padStart(2, "0")}/${brTime.getUTCFullYear()}`;
        const time = `${String(brTime.getUTCHours()).padStart(2, "0")}:${String(brTime.getUTCMinutes()).padStart(2, "0")}`;

        const scoreHome = m.score?.fullTime?.home;
        const scoreAway = m.score?.fullTime?.away;
        const score =
          scoreHome !== null && scoreHome !== undefined && scoreAway !== null && scoreAway !== undefined
            ? `${scoreHome} - ${scoreAway}`
            : undefined;

        const venue = m.venue || "—";

        if (m.group) {
          const groupLetter = m.group.replace(/group\s+/i, "").trim().toUpperCase().slice(-1) || "A";
          groupMatches.push({
            id: String(m.id),
            groupId: groupLetter,
            matchday: m.matchday || 0,
            homeTeam: homeId,
            awayTeam: awayId,
            date,
            time,
            venue,
            score,
            scoreHome: scoreHome ?? undefined,
            scoreAway: scoreAway ?? undefined,
            status: m.status,
            game: String(m.matchday || m.id),
          });
        } else {
          const round = mapRoundNameFData(m.stage || "");
          knockoutMatches.push({
            id: String(m.id),
            round,
            homeTeam: homeId,
            awayTeam: awayId,
            date,
            time,
            venue,
            score,
            scoreHome: scoreHome ?? undefined,
            scoreAway: scoreAway ?? undefined,
            status: m.status,
            game: String(m.id),
          });
        }
      }
    }

    // Map scorers
    const topScorers: TournamentScorer[] = (scorers || [])
      .filter((s) => s?.player && s?.team)
      .map((s) => {
        const teamId = fdTeamIdToLocalId[s.team.id] || s.team.tla?.toLowerCase() || "unk";
        const localTeam = getTeamById(teamId);
        return {
          name: s.player.name,
          team: localTeam?.name || s.team.name,
          teamId,
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          penalties: s.penalties ?? 0,
        };
      });

    return { groups, groupMatches, knockoutMatches, topScorers };
  } catch (error) {
    console.error("Erro ao buscar dados da football-data.org:", error);
    return null;
  }
}

function mapRoundNameFData(stage: string): string {
  const s = stage.toLowerCase();
  if (s.includes("round_of_32") || s.includes("round of 32") || s.includes("last_32")) return "16 avos";
  if (s.includes("round_of_16") || s.includes("round of 16") || s.includes("last_16")) return "Oitavas";
  if (s.includes("quarter")) return "Quartas";
  if (s.includes("semi")) return "Semifinal";
  if (s.includes("third")) return "Disputa pelo 3º lugar";
  if (s.includes("final")) return "Final";
  return stage;
}

async function fetchFromApiFootball(): Promise<{
  groups: Group[];
  knockoutMatches: KnockoutMatch[];
} | null> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return null;

  const league = process.env.API_FOOTBALL_LEAGUE || "1";
  const season = process.env.API_FOOTBALL_SEASON || "2022";

  try {
    const standingsData = await fetchFromApi(`standings?league=${league}&season=${season}`);
    const apiStandings = standingsData.response?.[0]?.league?.standings;
    let groupsList: Group[] = [];

    if (apiStandings && Array.isArray(apiStandings)) {
      groupsList = apiStandings.map((groupStandingsList: ApiStandingRow[]) => {
        const firstTeam = groupStandingsList?.[0];
        const rawGroup = firstTeam?.group || "Group";
        const groupId = rawGroup
          .replace(/group\s+/i, "")
          .replace(/grupo\s+/i, "")
          .trim()
          .toUpperCase()
          .slice(-1);

        const standings = groupStandingsList.map((teamStanding: ApiStandingRow) => {
          const teamId = mapTeamToLocalId(teamStanding.team?.name, teamStanding.team?.code);
          return {
            teamId,
            played: teamStanding.all?.played ?? 0,
            won: teamStanding.all?.win ?? 0,
            drawn: teamStanding.all?.draw ?? 0,
            lost: teamStanding.all?.lose ?? 0,
            goalsFor: teamStanding.all?.goals?.for ?? 0,
            goalsAgainst: teamStanding.all?.goals?.against ?? 0,
            points: teamStanding.points ?? 0,
          };
        });

        const teams = standings.map((s: { teamId: string }) => s.teamId);

        return {
          id: groupId,
          name: `Grupo ${groupId}`,
          teams,
          standings,
        };
      });
    }

    const fixturesData = await fetchFromApi(`fixtures?league=${league}&season=${season}`);
    const apiFixtures = fixturesData.response;
    let knockoutMatchesList: KnockoutMatch[] = [];

    if (apiFixtures && Array.isArray(apiFixtures)) {
      const knockoutRounds = ["round of 32", "round of 16", "quarter-finals", "quarter-final", "semi-finals", "semi-final", "final"];
      const filteredFixtures = apiFixtures.filter((fix: ApiFixture) => {
        const round = fix.league?.round?.toLowerCase() || "";
        return knockoutRounds.some((r) => round.includes(r));
      });

      knockoutMatchesList = filteredFixtures.map((fix: ApiFixture) => {
        const homeTeamId = mapTeamToLocalId(fix.teams?.home?.name, fix.teams?.home?.code);
        const awayTeamId = mapTeamToLocalId(fix.teams?.away?.name, fix.teams?.away?.code);
        let score = "—";
        if (fix.goals?.home !== null && fix.goals?.away !== null) {
          score = `${fix.goals.home} - ${fix.goals.away}`;
        }
        const mappedRound = mapRoundName(fix.league?.round || "Knockout");
        return {
          id: String(fix.fixture?.id ?? Math.random()),
          round: mappedRound,
          homeTeam: homeTeamId,
          awayTeam: awayTeamId,
          date: formatDate(fix.fixture?.date),
          time: fix.fixture?.date ? (() => {
            const d = new Date(fix.fixture.date);
            const brTime = new Date(d.getTime() - 3 * 60 * 60 * 1000);
            return `${String(brTime.getUTCHours()).padStart(2, "0")}:${String(brTime.getUTCMinutes()).padStart(2, "0")}`;
          })() : "—",
          venue: fix.fixture?.venue?.name || "—",
          score,
          game: String(fix.fixture?.id ?? ""),
        };
      });

      const roundOrder: Record<string, number> = {
        "16 avos": 1, "Oitavas": 2, "Quartas": 3, "Semifinal": 4, "Final": 5,
      };
      knockoutMatchesList.sort((a, b) => {
        const orderA = roundOrder[a.round] || 99;
        const orderB = roundOrder[b.round] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.date.localeCompare(b.date);
      });
    }

    if (groupsList.length === 0 && knockoutMatchesList.length === 0) return null;
    return { groups: groupsList, knockoutMatches: knockoutMatchesList };
  } catch (error) {
    console.error("Erro ao buscar dados da API-Football:", error);
    return null;
  }
}

function mergeKnockoutWithApi(
  localMatches: KnockoutMatch[],
  apiMatches: KnockoutMatch[]
): KnockoutMatch[] {
  if (!apiMatches || apiMatches.length === 0) return localMatches;

  return localMatches.map((local) => {
    const localDate = local.date.split("/").reverse().join("-");
    const apiMatch = apiMatches.find((api) => {
      const apiDate = api.date.split("/").reverse().join("-");
      return api.round === local.round && apiDate === localDate;
    });

    if (!apiMatch) return local;

    const homeIsReal = apiMatch.homeTeam && getTeamById(apiMatch.homeTeam);
    const awayIsReal = apiMatch.awayTeam && getTeamById(apiMatch.awayTeam);

    return {
      ...local,
      score: apiMatch.score ?? local.score,
      scoreHome: apiMatch.scoreHome ?? local.scoreHome,
      scoreAway: apiMatch.scoreAway ?? local.scoreAway,
      status: apiMatch.status ?? local.status,
      events: apiMatch.events ?? local.events,
      homeTeam: homeIsReal ? apiMatch.homeTeam : local.homeTeam,
      awayTeam: awayIsReal ? apiMatch.awayTeam : local.awayTeam,
      venue: apiMatch.venue && apiMatch.venue !== "—" ? apiMatch.venue : local.venue,
    };
  });
}

function mergeGroupMatchesWithApi(
  localMatches: GroupMatch[],
  apiMatches: GroupMatch[]
): GroupMatch[] {
  if (!apiMatches || apiMatches.length === 0) return localMatches;

  return localMatches.map((local) => {
    let apiMatch = apiMatches.find(
      (api) =>
        api.groupId === local.groupId &&
        api.matchday === local.matchday &&
        api.homeTeam === local.homeTeam &&
        api.awayTeam === local.awayTeam
    );

    if (!apiMatch) {
      apiMatch = apiMatches.find(
        (api) =>
          api.groupId === local.groupId &&
          api.homeTeam === local.homeTeam &&
          api.awayTeam === local.awayTeam
      );
    }

    if (!apiMatch) {
      apiMatch = apiMatches.find(
        (api) =>
          api.groupId === local.groupId &&
          api.matchday === local.matchday
      );
    }

    if (!apiMatch) return local;

    return {
      ...local,
      score: apiMatch.score ?? local.score,
      scoreHome: apiMatch.scoreHome ?? local.scoreHome,
      scoreAway: apiMatch.scoreAway ?? local.scoreAway,
      status: apiMatch.status ?? local.status,
      events: apiMatch.events && apiMatch.events.length > 0 ? apiMatch.events : local.events,
    };
  });
}

export async function fetchTournamentData() {
  // 1. Tentar football-data.org
  const fdData = await fetchFromFootballDataOrg();
  if (fdData && fdData.groups.length > 0) {
    console.log("Dados obtidos via football-data.org");
    return {
      groups: fdData.groups,
      groupMatches: mergeGroupMatchesWithApi(localBackupGroupMatches, fdData.groupMatches),
      knockoutMatches: mergeKnockoutWithApi(localBackupKnockoutMatches, fdData.knockoutMatches),
      topScorers: fdData.topScorers,
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Tentar API-Football
  const apiData = await fetchFromApiFootball();
  if (apiData) {
    console.log("Dados obtidos via API-Football");
    return {
      groups: apiData.groups,
      groupMatches: localBackupGroupMatches,
      knockoutMatches: mergeKnockoutWithApi(localBackupKnockoutMatches, apiData.knockoutMatches),
      topScorers: [] as TournamentScorer[],
      updatedAt: new Date().toISOString(),
    };
  }

  // 3. Fallback local
  console.log("Usando dados locais de backup");
  return {
    groups: localBackupGroups,
    groupMatches: localBackupGroupMatches,
    knockoutMatches: localBackupKnockoutMatches,
    topScorers: [] as TournamentScorer[],
    updatedAt: new Date().toISOString(),
  };
}

