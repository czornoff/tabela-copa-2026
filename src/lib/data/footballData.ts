const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(endpoint: string): string {
  return `fd:${endpoint}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

export async function fetchFootballData<T>(
  endpoint: string
): Promise<T> {
  const cacheKey = getCacheKey(endpoint);
  const cached = getFromCache<T>(cacheKey);
  if (cached) return cached;

  const token = process.env.FOOTBALL_DATA_KEY;
  if (!token) {
    throw new Error("FOOTBALL_DATA_KEY não configurada no .env.local.");
  }

  const url = `${FOOTBALL_DATA_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Erro na football-data.org (${response.status}): ${response.statusText}`
    );
  }

  const data = (await response.json()) as T;
  setCache(cacheKey, data);
  return data;
}

export interface FootballDataTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  coach: {
    id: number;
    firstName?: string;
    lastName?: string;
    name: string;
    dateOfBirth?: string;
    nationality?: string;
    contract?: { start?: string; until?: string };
  } | null;
  squad: FootballDataPlayer[];
}

export interface FootballDataPlayer {
  id: number;
  firstName?: string;
  lastName?: string;
  name: string;
  position: string;
  shirtNumber?: number;
  dateOfBirth?: string;
  nationality?: string;
  marketValue?: number;
  contract?: { start?: string; until?: string };
}

export interface FootballDataCompetitionTeams {
  competition: { id: number; name: string; code: string };
  season: { id: number; startDate: string; endDate: string };
  teams: FootballDataTeam[];
}

export async function fetchWorldCupTeams(): Promise<FootballDataTeam[]> {
  const data = await fetchFootballData<FootballDataCompetitionTeams>(
    "/competitions/WC/teams"
  );
  return data.teams;
}

export async function fetchTeamById(
  teamId: number
): Promise<FootballDataTeam> {
  return fetchFootballData<FootballDataTeam>(`/teams/${teamId}`);
}

export function clearFootballDataCache(): void {
  cache.clear();
}

// ─── World Cup Standings ─────────────────────────────────────────────

interface FDStandingTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FDStandingRow {
  rank: number;
  team: FDStandingTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  group?: string;
}

interface FDStandingsResponse {
  competition: { id: number; name: string; code: string };
  season: { id: number; startDate: string; endDate: string };
  standings: FDStandingGroup[];
}

interface FDStandingGroup {
  stage: string;
  type: string;
  group: string;
  table: FDStandingRow[];
}

export async function fetchWorldCupStandings(): Promise<FDStandingGroup[]> {
  const data = await fetchFootballData<FDStandingsResponse>(
    "/competitions/WC/standings"
  );
  return data.standings;
}

// ─── World Cup Matches ───────────────────────────────────────────────

interface FDMatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FDMatchScore {
  winner: string | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: FDMatchTeam;
  awayTeam: FDMatchTeam;
  score: FDMatchScore;
  venue?: string;
}

interface FDMatchesResponse {
  competition: { id: number; name: string; code: string };
  season: { id: number; startDate: string; endDate: string };
  matches: FDMatch[];
}

export async function fetchWorldCupMatches(): Promise<FDMatch[]> {
  const data = await fetchFootballData<FDMatchesResponse>(
    "/competitions/WC/matches"
  );
  return data.matches;
}

// ─── World Cup Top Scorers ───────────────────────────────────────────

interface FDScorerPlayer {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  nationality?: string;
  position?: string;
  dateOfBirth?: string;
}

interface FDScorerTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FDScorer {
  player: FDScorerPlayer;
  team: FDScorerTeam;
  goals: number;
  assists: number;
  penalties: number;
}

interface FDScorersResponse {
  competition: { id: number; name: string; code: string };
  season: { id: number; startDate: string; endDate: string };
  scorers: FDScorer[];
}

export async function fetchWorldCupScorers(): Promise<FDScorer[]> {
  const data = await fetchFootballData<FDScorersResponse>(
    "/competitions/WC/scorers?limit=20"
  );
  return data.scorers;
}
