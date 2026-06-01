import { fetchFromApi } from "./api";
import { fetchFootballData, type FootballDataTeam } from "./footballData";
import { fdTeamIdToLocalId, localIdToApiTeamId } from "./teamsMapping";
import type { PlayerPosition } from "@/types";

export interface Convocado {
  fdId: number;
  apiId: number | null;
  name: string;
  position: PlayerPosition;
  number: number;
  photo: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  birthCountry: string | null;
  nationality: string;
  currentClub: string;
}

export interface ConvocadosTeam {
  teamId: string;
  teamName: string;
  crest: string;
  coach: { name: string; nationality?: string; age?: number | null } | null;
  players: Convocado[];
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let cache: { data: Map<string, ConvocadosTeam>; expiresAt: number } | null = null;

function calculateAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function mapPosition(pos: string): PlayerPosition {
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("defence") || p.includes("defender")) return "DEF";
  if (p.includes("midfield")) return "MID";
  if (p.includes("offence") || p.includes("attacker") || p.includes("forward")) return "FWD";
  return "MID";
}

function normalizeName(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
}

interface ApiSquadResponse {
  response: {
    team: { id: number; name: string };
    players: { id: number; name: string; photo: string; position: string; number: number | null }[];
  }[];
}

interface ApiPlayerByIdResponse {
  response: {
    player: {
      id: number; name: string; height: string | null; weight: string | null;
      birth: { date: string; place: string | null; country: string | null };
    };
  }[];
}

async function fetchApiSquadPhotos(apiTeamId: number): Promise<Map<string, { apiId: number; photo: string }>> {
  const map = new Map<string, { apiId: number; photo: string }>();
  try {
    const data = (await fetchFromApi(`players/squads?team=${apiTeamId}`)) as ApiSquadResponse;
    for (const item of data?.response ?? []) {
      for (const p of item.players ?? []) {
        if (p.name && p.photo) {
          map.set(normalizeName(p.name), { apiId: p.id, photo: p.photo });
        }
      }
    }
  } catch {
    // rate limited or error — continue without photos
  }
  return map;
}

async function fetchApiPlayerDetails(apiId: number): Promise<{ height: string | null; weight: string | null; birthPlace: string | null; birthCountry: string | null } | null> {
  try {
    const data = (await fetchFromApi(`players?id=${apiId}`)) as ApiPlayerByIdResponse;
    const p = data?.response?.[0]?.player;
    if (!p) return null;
    return {
      height: p.height ?? null,
      weight: p.weight ?? null,
      birthPlace: p.birth?.place ?? null,
      birthCountry: p.birth?.country ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchAllConvocados(): Promise<Map<string, ConvocadosTeam>> {
  if (cache && Date.now() < cache.expiresAt) return cache.data;

  const fdTeams = await fetchFootballData<{ teams: FootballDataTeam[] }>(
    "/competitions/WC/teams?season=2026"
  );

  const result = new Map<string, ConvocadosTeam>();

  for (const fdTeam of fdTeams.teams) {
    const localId = fdTeamIdToLocalId[fdTeam.id];
    if (!localId) continue;

    const apiTeamId = localIdToApiTeamId[localId] ?? null;
    const coach = fdTeam.coach
      ? {
          name: fdTeam.coach.name,
          nationality: fdTeam.coach.nationality,
          age: calculateAge(fdTeam.coach.dateOfBirth),
        }
      : null;

    // Fetch photos + apiIds from api-football.com
    let photoMap = new Map<string, { apiId: number; photo: string }>();
    if (apiTeamId) {
      photoMap = await fetchApiSquadPhotos(apiTeamId);
    }

    const players: Convocado[] = fdTeam.squad.map((fdPlayer) => {
      const norm = normalizeName(fdPlayer.name);
      const apiMatch = photoMap.get(norm)
        ?? [...photoMap.entries()].find(([k]) => k.includes(norm) || norm.includes(k))?.[1]
        ?? (() => {
            const lastName = norm.split(" ").pop() ?? "";
            return lastName.length > 2
              ? [...photoMap.entries()].find(([k]) => k.includes(lastName))?.[1]
              : undefined;
          })();

      return {
        fdId: fdPlayer.id,
        apiId: apiMatch?.apiId ?? null,
        name: fdPlayer.name,
        position: mapPosition(fdPlayer.position),
        number: fdPlayer.shirtNumber ?? 0,
        photo: apiMatch?.photo ?? null,
        age: calculateAge(fdPlayer.dateOfBirth),
        height: null,
        weight: null,
        birthDate: fdPlayer.dateOfBirth ?? null,
        birthPlace: null,
        birthCountry: null,
        nationality: fdPlayer.nationality ?? "—",
        currentClub: fdTeam.name,
      };
    });

    // Fetch detailed info (height, weight, birthPlace) from api-football for players we matched
    const playersWithApi = players.filter((p) => p.apiId);
    // Fetch in batches of 5 to avoid rate limits
    for (let i = 0; i < playersWithApi.length; i += 5) {
      const batch = playersWithApi.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((p) => fetchApiPlayerDetails(p.apiId!))
      );
      results.forEach((r, idx) => {
        if (r.status === "fulfilled" && r.value) {
          const player = batch[idx];
          player.height = r.value.height;
          player.weight = r.value.weight;
          player.birthPlace = r.value.birthPlace;
          player.birthCountry = r.value.birthCountry;
        }
      });
    }

    result.set(localId, {
      teamId: localId,
      teamName: fdTeam.name,
      crest: fdTeam.crest,
      coach,
      players,
    });
  }

  cache = { data: result, expiresAt: Date.now() + CACHE_TTL };
  return result;
}

export async function getConvocadosByTeam(localTeamId: string): Promise<ConvocadosTeam | null> {
  const all = await fetchAllConvocados();
  return all.get(localTeamId) ?? null;
}

export async function getAllConvocados(): Promise<Map<string, ConvocadosTeam>> {
  return fetchAllConvocados();
}
