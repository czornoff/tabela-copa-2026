import { fetchFromApi } from "./api";
import { mapTeamToLocalId } from "./teamsMapping";
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

interface ApiPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

function mapPosition(apiPos: string): PlayerPosition {
  switch (apiPos.toLowerCase()) {
    case "goalkeeper":
      return "GK";
    case "defender":
      return "DEF";
    case "midfielder":
      return "MID";
    case "attacker":
      return "FWD";
    default:
      return "MID";
  }
}

export async function fetchTeamSquad(
  localTeamId: string
): Promise<SquadPlayer[] | null> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return null;

  const league = process.env.API_FOOTBALL_LEAGUE || "1";
  const season = process.env.API_FOOTBALL_SEASON || "2022";

  try {
    const teamsData = await fetchFromApi(`teams?league=${league}&season=${season}`);
    if (!teamsData?.response) return null;

    let apiTeamId: number | null = null;
    for (const item of teamsData.response) {
      const mappedId = mapTeamToLocalId(item.team.name, item.team.code);
      if (mappedId === localTeamId) {
        apiTeamId = item.team.id;
        break;
      }
    }

    if (!apiTeamId) return null;

    const squadData = await fetchFromApi(`players/squads?team=${apiTeamId}`);
    if (!squadData?.response || squadData.response.length === 0) return null;

    const players: ApiPlayer[] = squadData.response[0].players;
    if (!players || players.length === 0) return null;

    return players.map((p) => ({
      id: String(p.id),
      name: p.name,
      position: mapPosition(p.position),
      club: "—",
      number: p.number ?? 0,
      photo: p.photo || undefined,
      age: p.age,
    }));
  } catch (err) {
    console.error(`Erro ao buscar elenco para ${localTeamId}:`, err);
    return null;
  }
}
