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
    team: { name: string };
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

  try {
    const data = await fetchFromApi(
      `players?id=${playerId}&season=${season}&league=${league}`
    );

    const item = data?.response?.[0] as ApiPlayerResponse | undefined;
    if (!item?.player) return null;

    const stat =
      item.statistics?.find((s) => s.games?.appearences != null) ??
      item.statistics?.[0];

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
  } catch (err) {
    console.error(`Erro ao buscar jogador ${playerId}:`, err);
    return null;
  }
}
