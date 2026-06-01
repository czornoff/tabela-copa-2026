import { fetchFromApi } from "./api";
import { fetchFootballData } from "./footballData";
import { fdTeamIdToLocalId, localIdToApiTeamId } from "./teamsMapping";

export interface PlayerDetail {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  nationality: string;
  height: string | null;
  weight: string | null;
  photo: string | null;
  birth: {
    date: string;
    place: string;
    country: string;
  } | null;
  position: string;
  club: string;
  currentClub: string;
  number: number | null;
  seasonStats: {
    appearances: number;
    minutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    rating: string | null;
  } | null;
}

interface FDPerson {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  position?: string;
  shirtNumber?: number;
  currentTeam?: { id: number; name: string };
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

interface ApiPlayerFull {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height: string | null;
    weight: string | null;
    photo: string;
    birth: { date: string; place: string | null; country: string | null };
  };
  statistics: Array<{
    team: { id: number; name: string };
    league: { id: number; name: string };
    games: {
      appearences: number | null;
      minutes: number | null;
      number: number | null;
      position: string | null;
      rating: string | null;
    };
    goals: { total: number | null; assists: number | null };
    cards: { yellow: number | null; red: number | null };
  }>;
}

interface ApiPlayerByIdResponse {
  response: ApiPlayerFull[];
}

const squadNameToIdCache = new Map<string, Map<string, { apiId: number; photo: string }>>();
const playerDetailCache = new Map<string, ApiPlayerFull>();

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

async function fetchSquadNameMap(
  apiTeamId: number
): Promise<Map<string, { apiId: number; photo: string }>> {
  const cacheKey = String(apiTeamId);
  if (squadNameToIdCache.has(cacheKey)) {
    return squadNameToIdCache.get(cacheKey)!;
  }

  const map = new Map<string, { apiId: number; photo: string }>();

  try {
    const data = (await fetchFromApi(
      `players/squads?team=${apiTeamId}`
    )) as ApiSquadResponse;

    if (data?.response) {
      for (const item of data.response) {
        for (const p of item.players) {
          map.set(normalizeName(p.name), {
            apiId: p.id,
            photo: p.photo,
          });
        }
      }
    }
  } catch {
    // ignore
  }

  squadNameToIdCache.set(cacheKey, map);
  return map;
}

async function fetchPlayerByApiId(
  apiId: number
): Promise<ApiPlayerFull | null> {
  const cacheKey = String(apiId);
  if (playerDetailCache.has(cacheKey)) {
    return playerDetailCache.get(cacheKey)!;
  }

  try {
    const data = (await fetchFromApi(
      `players?id=${apiId}&season=2024`
    )) as ApiPlayerByIdResponse;

    if (data?.response && data.response.length > 0) {
      const player = data.response[0];
      playerDetailCache.set(cacheKey, player);
      return player;
    }
  } catch {
    // ignore
  }

  return null;
}

function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function mapPositionLabel(pos?: string): string {
  if (!pos) return "—";
  const map: Record<string, string> = {
    Goalkeeper: "Goleiro",
    Defender: "Defensor",
    Midfielder: "Meio-campista",
    Attacker: "Atacante",
    "Central Midfield": "Meio-campista",
    "Defensive Midfield": "Volante",
    "Right-Back": "Lateral Direito",
    "Left-Back": "Lateral Esquerdo",
    "Centre-Back": "Zagueiro",
    "Right Winger": "Ponta Direita",
    "Left Winger": "Ponta Esquerda",
  };
  return map[pos] ?? pos;
}

export async function fetchPlayerDetail(
  playerId: string
): Promise<PlayerDetail | null> {
  // Step 1: Get person info from football-data.org
  let fdPerson: FDPerson | null = null;

  try {
    fdPerson = await fetchFootballData<FDPerson>(`/persons/${playerId}`);
  } catch {
    // continue
  }

  if (!fdPerson?.name) return null;

  // Step 2: Find api-team ID
  let apiTeamId: number | null = null;
  if (fdPerson.currentTeam?.id) {
    const localId = fdTeamIdToLocalId[fdPerson.currentTeam.id];
    if (localId && localIdToApiTeamId[localId]) {
      apiTeamId = localIdToApiTeamId[localId];
    }
  }

  // Step 3: Try to find api-football player ID from squad list
  let apiFootballId: number | null = null;
  let squadPhoto: string | null = null;

  if (apiTeamId) {
    const nameMap = await fetchSquadNameMap(apiTeamId);
    const normalized = normalizeName(fdPerson.name);

    // Exact match
    const exact = nameMap.get(normalized);
    if (exact) {
      apiFootballId = exact.apiId;
      squadPhoto = exact.photo;
    } else {
      // Partial match
      for (const [key, val] of nameMap) {
        if (key.includes(normalized) || normalized.includes(key)) {
          apiFootballId = val.apiId;
          squadPhoto = val.photo;
          break;
        }
      }
      // Last name match
      if (!apiFootballId) {
        const lastName = normalized.split(" ").pop() ?? "";
        for (const [key, val] of nameMap) {
          if (key.includes(lastName) && lastName.length > 2) {
            apiFootballId = val.apiId;
            squadPhoto = val.photo;
            break;
          }
        }
      }
    }
  }

  // Step 4: Try to get full player data by api-football.com ID
  let apiFull: ApiPlayerFull | null = null;
  if (apiFootballId) {
    apiFull = await fetchPlayerByApiId(apiFootballId);
  }

  // Always return data — use whatever we have from football-data.org + api-football.com

  const apiPlayer = apiFull?.player;
  const allStats = apiFull?.statistics ?? [];

  // Find the club-level stat with most appearances (not the national team)
  const nationalTeamId = fdPerson.currentTeam?.id;
  const clubStats = allStats
    .filter(
      (s) =>
        s.team.id !== nationalTeamId &&
        s.games?.appearences &&
        s.games.appearences > 0
    )
    .sort((a, b) => (b.games?.appearences ?? 0) - (a.games?.appearences ?? 0));

  const bestClubStat = clubStats[0] ?? null;

  // Also find the most relevant overall stat for seasonStats
  const allWithApps = allStats
    .filter((s) => s.games?.appearences && s.games.appearences > 0)
    .sort((a, b) => (b.games?.appearences ?? 0) - (a.games?.appearences ?? 0));

  const bestOverallStat = allWithApps[0] ?? allStats[0] ?? null;
  const games = bestOverallStat?.games;
  const goals = bestOverallStat?.goals;
  const cards = bestOverallStat?.cards;

  return {
    id: String(fdPerson.id),
    name: fdPerson.name,
    firstname: apiPlayer?.firstname ?? fdPerson.firstName ?? "",
    lastname: apiPlayer?.lastname ?? fdPerson.lastName ?? "",
    age: calculateAge(fdPerson.dateOfBirth) ?? apiPlayer?.age ?? null,
    nationality: fdPerson.nationality ?? apiPlayer?.nationality ?? "—",
    height: apiPlayer?.height ?? null,
    weight: apiPlayer?.weight ?? null,
    photo: apiPlayer?.photo ?? squadPhoto ?? null,
    birth: fdPerson.dateOfBirth
      ? {
          date: fdPerson.dateOfBirth,
          place: apiPlayer?.birth?.place ?? "—",
          country: apiPlayer?.birth?.country ?? fdPerson.nationality ?? "—",
        }
      : apiPlayer?.birth?.date
        ? { date: apiPlayer.birth.date, place: apiPlayer.birth.place ?? "—", country: apiPlayer.birth.country ?? "—" }
        : null,
    position: mapPositionLabel(games?.position ?? fdPerson.position ?? undefined),
    club: fdPerson.currentTeam?.name ?? "—",
    currentClub: bestClubStat?.team?.name ?? bestOverallStat?.team?.name ?? "—",
    number: fdPerson.shirtNumber ?? games?.number ?? null,
    seasonStats: bestOverallStat
      ? {
          appearances: games?.appearences ?? 0,
          minutes: games?.minutes ?? 0,
          goals: goals?.total ?? 0,
          assists: goals?.assists ?? 0,
          yellowCards: cards?.yellow ?? 0,
          redCards: cards?.red ?? 0,
          rating: games?.rating ?? null,
        }
      : null,
  };
}
