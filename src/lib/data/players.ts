import { fetchFromApi } from "./api";

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

interface ApiPlayerResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number | null;
    nationality: string;
    height: string | null;
    weight: string | null;
    photo: string | null;
    birth: { date: string; place: string | null; country: string | null };
  };
  statistics: Array<{
    team: { id: number; name: string };
    league: { id: number; name: string };
    games: {
      number: number | null;
      position: string | null;
      appearences: number | null;
      minutes: number | null;
      rating: string | null;
    };
    goals: {
      total: number | null;
      assists: number | null;
    };
    cards: {
      yellow: number | null;
      red: number | null;
    };
  }>;
}

function mapPositionLabel(pos: string | null | undefined): string {
  if (!pos) return "—";
  const map: Record<string, string> = {
    Goalkeeper: "Goleiro",
    Defender: "Defensor",
    Midfielder: "Meio-campista",
    Attacker: "Atacante",
  };
  return map[pos] ?? pos;
}

export async function fetchPlayerDetail(
  playerId: string
): Promise<PlayerDetail | null> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return null;

  const season = process.env.API_FOOTBALL_SEASON || "2022";
  const league = process.env.API_FOOTBALL_LEAGUE || "1";

  const attempts = [
    `players?id=${playerId}&season=${season}&league=${league}`,
    `players?id=${playerId}&season=${season}`,
    `players?id=${playerId}&season=2024`,
    `players?id=${playerId}&season=2023`,
    `players?id=${playerId}`,
  ];

  let data = null;
  for (const endpoint of attempts) {
    try {
      data = await fetchFromApi(endpoint);
      if (data?.response?.length > 0) break;
    } catch {
      continue;
    }
  }

  const item = data?.response?.[0] as ApiPlayerResponse | undefined;
  if (!item?.player) return null;

  const stats = item.statistics ?? [];

  const NATIONAL_LEAGUE_IDS = new Set([
    1, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    531, 556, 1168,
  ]);

  const teamIds = [...new Set(stats.map((s) => s.team.id))];
  let nationalTeamId: number | null = null;

  for (const tid of teamIds) {
    const teamLeagues = stats
      .filter((s) => s.team.id === tid)
      .map((s) => s.league.id);
    const allNational = teamLeagues.every((lid) => NATIONAL_LEAGUE_IDS.has(lid));
    if (allNational && teamLeagues.length > 0) {
      nationalTeamId = tid;
      break;
    }
  }

  const clubEntry = stats.find(
    (s) => s.team.id !== nationalTeamId && s.games?.appearences != null
  );

  const wcEntry = stats.find((s) => s.league.id === 1);

  const stat = wcEntry ?? clubEntry ?? stats[0];

  const games = stat?.games;
  const goals = stat?.goals;
  const cards = stat?.cards;

  return {
    id: String(item.player.id),
    name: item.player.name,
    firstname: item.player.firstname,
    lastname: item.player.lastname,
    age: item.player.age,
    nationality: item.player.nationality,
    height: item.player.height,
    weight: item.player.weight,
    photo: item.player.photo,
    birth: item.player.birth?.date
      ? {
          date: item.player.birth.date,
          place: item.player.birth.place ?? "—",
          country: item.player.birth.country ?? "—",
        }
      : null,
    position: mapPositionLabel(games?.position),
    club: stat?.team?.name ?? "—",
    currentClub: clubEntry?.team?.name ?? stat?.team?.name ?? "—",
    number: games?.number ?? null,
    seasonStats: stat
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
