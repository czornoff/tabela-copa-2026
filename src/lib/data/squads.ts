import { fetchFromApi } from "./api";
import {
  fetchWorldCupTeams,
  type FootballDataTeam,
  type FootballDataPlayer,
} from "./footballData";
import { fdTeamIdToLocalId, localIdToApiTeamId } from "./teamsMapping";
import type { PlayerPosition } from "@/types";

export interface SquadPlayer {
  id: string;
  name: string;
  position: PlayerPosition;
  club: string;
  number: number;
  photo?: string;
  age?: number;
}

export interface CoachInfo {
  name: string;
  nationality?: string;
  age?: number;
  photo?: string;
}

interface ApiSquadPlayer {
  id: number;
  name: string;
  photo: string;
  position: string;
  number: number | null;
}

interface ApiSquadResponse {
  response: {
    team: { id: number; name: string };
    players: ApiSquadPlayer[];
  }[];
}

function mapPosition(fdPosition: string): PlayerPosition {
  const pos = fdPosition.toLowerCase();
  if (pos.includes("goalkeeper") || pos.includes("goalie")) return "GK";
  if (pos.includes("defence") || pos.includes("defender")) return "DEF";
  if (pos.includes("midfield")) return "MID";
  if (pos.includes("offence") || pos.includes("attacker") || pos.includes("forward")) return "FWD";
  return "MID";
}

function calculateAge(dateOfBirth?: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

const photoCache = new Map<number, Map<string, string>>();

async function fetchTeamPhotos(apiTeamId: number): Promise<Map<string, string>> {
  if (photoCache.has(apiTeamId)) return photoCache.get(apiTeamId)!;

  const map = new Map<string, string>();
  try {
    const data = (await fetchFromApi(
      `players/squads?team=${apiTeamId}`
    )) as ApiSquadResponse;
    for (const item of data?.response ?? []) {
      for (const p of item.players ?? []) {
        if (p.photo && p.name) {
          map.set(normalizeName(p.name), p.photo);
        }
      }
    }
  } catch {
    // ignore
  }

  photoCache.set(apiTeamId, map);
  return map;
}

function matchPhoto(name: string, photoMap: Map<string, string>): string | undefined {
  const n = normalizeName(name);

  // Exact match
  if (photoMap.has(n)) return photoMap.get(n);

  // Partial match
  for (const [key, url] of photoMap) {
    if (key.includes(n) || n.includes(key)) return url;
  }

  // Last name match
  const parts = n.split(" ");
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (last.length > 2) {
      for (const [key, url] of photoMap) {
        if (key.includes(last)) return url;
      }
    }
  }

  // First name match (for single-name players like "Pepe")
  if (parts.length === 1) {
    for (const [key, url] of photoMap) {
      if (key.startsWith(n) || n.startsWith(key)) return url;
    }
  }

  return undefined;
}

function mapFootballDataPlayer(p: FootballDataPlayer): SquadPlayer {
  return {
    id: String(p.id),
    name: p.name,
    position: mapPosition(p.position),
    club: "—",
    number: p.shirtNumber ?? 0,
    age: calculateAge(p.dateOfBirth),
  };
}

export async function fetchTeamSquad(
  localTeamId: string
): Promise<{ coach: CoachInfo | null; squad: SquadPlayer[] } | null> {
  const fdKey = process.env.FOOTBALL_DATA_KEY;
  if (!fdKey) return null;

  try {
    const teams = await fetchWorldCupTeams();

    // Find team by fdTeamId mapping or by name
    const fdTeam = teams.find((t) => {
      const mappedLocalId = fdTeamIdToLocalId[t.id];
      return mappedLocalId === localTeamId;
    });

    if (!fdTeam) return null;

    const squad = fdTeam.squad.map((p) => mapFootballDataPlayer(p));
    const coach = fdTeam.coach
      ? {
          name: fdTeam.coach.name,
          nationality: fdTeam.coach.nationality,
          age: calculateAge(fdTeam.coach.dateOfBirth),
        }
      : null;

    // Fetch photos from api-football.com
    const apiTeamId = localIdToApiTeamId[localTeamId];
    if (apiTeamId) {
      const photoMap = await fetchTeamPhotos(apiTeamId);
      for (const player of squad) {
        const photo = matchPhoto(player.name, photoMap);
        if (photo) player.photo = photo;
      }
    }

    return { coach, squad };
  } catch (err) {
    console.error(`Erro ao buscar elenco para ${localTeamId}:`, err);
    return null;
  }
}
