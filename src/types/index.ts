export type Federation =
  | "CONMEBOL"
  | "UEFA"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  club: string;
  number: number;
}

export interface Coach {
  name: string;
  nationality?: string;
  age?: number;
  photo?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  federation: Federation;
  groupId: string;
  squad: Player[];
  coach?: Coach;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  teams: string[];
  standings: GroupStanding[];
}

export interface KnockoutMatch {
  id: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  score?: string;
  game: string;
}

export interface GroupMatch {
  id: string;
  groupId: string;
  matchday: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  score?: string;
  game: string;
}

export interface Stadium {
  pais: string;
  cidade: string;
  estadio_nome_oficial_fifa: string;
  estadio_nome_comum: string;
  capacidade_fifa: number;
  imagem_estadio_url: string;
  logo_sede_url: string;
  curiosidades: string[];
}

export interface WorldCupEdition {
  ano: number;
  sede: string;
  logo_descricao: string;
  mascote: { nome: string; curiosidade: string } | null;
  curiosidades: string[];
  campeao?: string;
  vice?: string;
  destaque?: string;
  artilheiro?: { nome: string; pais: string; gols: number };
  final?: { placar: string };
  terceiro_lugar?: { placar: string; terceiro: string; quarto: string };    
}

export interface PodiumRanking {
  team: string;
  code: string;
  titles: number;
  finals: number;
  thirdPlaces: number;
  totalPodiums: number;
}

export interface TopScorer {
  name: string;
  country: string;
  code: string;
  goals: number;
  editions: string;
}
