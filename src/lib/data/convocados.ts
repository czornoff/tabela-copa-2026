import type { PlayerPosition } from "@/types";
import convocadosJson from "../../../data/convocados.json";

export interface Convocado {
  name: string;
  position: PlayerPosition;
  dateOfBirth: string | null;
  nationality: string | null;
}

export interface ConvocadosTeam {
  teamId: string;
  teamName: string;
  coach: { name: string; nationality: string | null; dateOfBirth: string | null } | null;
  players: Convocado[];
}

export async function getConvocadosByTeam(localTeamId: string): Promise<ConvocadosTeam | null> {
  const data = convocadosJson as Record<string, ConvocadosTeam>;
  return data[localTeamId] ?? null;
}

export async function getAllConvocados(): Promise<Record<string, ConvocadosTeam>> {
  return convocadosJson as Record<string, ConvocadosTeam>;
}
