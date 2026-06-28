import type { Group, KnockoutMatch } from "@/types";

// ─── Group ranking helpers ────────────────────────────────────────

interface RankedTeam {
  teamId: string;
  position: number;
  points: number;
  goalsDiff: number;
  goalsFor: number;
}

export function isGroupFinished(group: Group): boolean {
  return group.standings.every((s) => s.played === 3);
}

export function rankGroup(group: Group): RankedTeam[] {
  const sorted = [...group.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });
  return sorted.map((s, i) => ({
    teamId: s.teamId,
    position: i + 1,
    points: s.points,
    goalsDiff: s.goalsFor - s.goalsAgainst,
    goalsFor: s.goalsFor,
  }));
}

// ─── Placeholder type detection ───────────────────────────────────

function isGroupPosition(s: string): boolean {
  return /^\d+[A-L]$/.test(s);
}

function isThirdPlace(s: string): boolean {
  return /^\d+[A-L](\/[A-L])+$/.test(s);
}

function isWinner(s: string): boolean {
  return /^W\d+$/.test(s);
}

function isLoser(s: string): boolean {
  return /^L\d+$/.test(s);
}

function isPlaceholder(s: string): boolean {
  return isGroupPosition(s) || isThirdPlace(s) || isWinner(s) || isLoser(s);
}

// ─── Main resolver ────────────────────────────────────────────────

export function resolveBracket(
  knockoutMatches: KnockoutMatch[],
  groups: Group[],
): KnockoutMatch[] {
  const resolved = new Map<string, string>();

  // Step 1: resolve 1st/2nd place from finished groups
  for (const g of groups) {
    if (!isGroupFinished(g)) continue;
    const ranked = rankGroup(g);
    if (ranked[0]) resolved.set(`1${g.id}`, ranked[0].teamId);
    if (ranked[1]) resolved.set(`2${g.id}`, ranked[1].teamId);
  }

  // Step 2: resolve 3rd-place qualifiers
  interface ThirdPlaceInfo {
    groupLetter: string;
    teamId: string;
    points: number;
    goalsDiff: number;
    goalsFor: number;
  }

  const allThirds: ThirdPlaceInfo[] = [];
  for (const g of groups) {
    if (!isGroupFinished(g)) continue;
    const ranked = rankGroup(g);
    if (ranked[2]) {
      allThirds.push({
        groupLetter: g.id,
        teamId: ranked[2].teamId,
        points: ranked[2].points,
        goalsDiff: ranked[2].goalsDiff,
        goalsFor: ranked[2].goalsFor,
      });
    }
  }
  allThirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Process 3rd-place slots: fewer possible groups = higher priority
  const usedThirdPlaceTeams = new Set<string>();

  const thirdPlaceSlots = knockoutMatches
    .filter((m) => isThirdPlace(m.homeTeam) || isThirdPlace(m.awayTeam))
    .sort((a, b) => {
      const aSlot = isThirdPlace(a.homeTeam) ? a.homeTeam : a.awayTeam;
      const bSlot = isThirdPlace(b.homeTeam) ? b.homeTeam : b.awayTeam;
      const aCount = aSlot.replace(/^\d+/, "").split("/").length;
      const bCount = bSlot.replace(/^\d+/, "").split("/").length;
      if (aCount !== bCount) return aCount - bCount;
      return a.game.localeCompare(b.game);
    });

  for (const match of thirdPlaceSlots) {
    const placeholder = isThirdPlace(match.homeTeam) ? match.homeTeam : match.awayTeam;
    const possibleGroups = placeholder.replace(/^\d+/, "").split("/");

    for (const t of allThirds) {
      if (usedThirdPlaceTeams.has(t.teamId)) continue;
      if (possibleGroups.includes(t.groupLetter)) {
        resolved.set(placeholder, t.teamId);
        usedThirdPlaceTeams.add(t.teamId);
        break;
      }
    }
  }

  // Step 3: iteratively resolve winner/loser placeholders
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;

    for (const match of knockoutMatches) {
      const gameNum = match.game;

      // If match is FINISHED, extract winner/loser from resolved team IDs
      if (match.status === "FINISHED" && match.scoreHome !== undefined && match.scoreAway !== undefined) {
        const hTeam = isPlaceholder(match.homeTeam) ? (resolved.get(match.homeTeam) ?? match.homeTeam) : match.homeTeam;
        const aTeam = isPlaceholder(match.awayTeam) ? (resolved.get(match.awayTeam) ?? match.awayTeam) : match.awayTeam;

        if (!isPlaceholder(hTeam) && !isPlaceholder(aTeam)) {
          const winnerTeam = match.scoreHome > match.scoreAway ? hTeam : aTeam;
          const loserTeam = match.scoreHome > match.scoreAway ? aTeam : hTeam;
          if (!resolved.has(gameNum)) {
            resolved.set(gameNum, winnerTeam);
            resolved.set(`L${gameNum}`, loserTeam);
            changed = true;
          }
        }
      }

      // Propagate resolved values to references
      for (const side of ["homeTeam", "awayTeam"] as const) {
        const val = match[side];
        if (isWinner(val)) {
          const refGame = val.slice(1);
          if (resolved.has(refGame)) {
            const key = `${gameNum}-${side}`;
            if (!resolved.has(key)) {
              resolved.set(key, resolved.get(refGame)!);
              changed = true;
            }
          }
        }
        if (isLoser(val)) {
          const refGame = val.slice(1);
          const loserKey = `L${refGame}`;
          if (resolved.has(loserKey)) {
            const key = `${gameNum}-${side}`;
            if (!resolved.has(key)) {
              resolved.set(key, resolved.get(loserKey)!);
              changed = true;
            }
          }
        }
      }
    }
  }

  // Step 4: apply resolved values to matches
  return knockoutMatches.map((match) => {
    const resolveSide = (val: string, side: "homeTeam" | "awayTeam"): string => {
      if (isGroupPosition(val) && resolved.has(val)) return resolved.get(val)!;
      if (isThirdPlace(val) && resolved.has(val)) return resolved.get(val)!;

      if (isWinner(val)) {
        const refGame = val.slice(1);
        const directKey = `${match.game}-${side}`;
        if (resolved.has(directKey)) return resolved.get(directKey)!;
        if (resolved.has(refGame)) return resolved.get(refGame)!;
      }
      if (isLoser(val)) {
        const refGame = val.slice(1);
        const directKey = `${match.game}-${side}`;
        if (resolved.has(directKey)) return resolved.get(directKey)!;
        const loserKey = `L${refGame}`;
        if (resolved.has(loserKey)) return resolved.get(loserKey)!;
      }
      return val;
    };

    return {
      ...match,
      homeTeam: resolveSide(match.homeTeam, "homeTeam"),
      awayTeam: resolveSide(match.awayTeam, "awayTeam"),
    };
  });
}

// ─── Third-place qualification ────────────────────────────────────

const THIRD_PLACE_SLOTS = [
  "3A/B/C/D/F",
  "3C/D/F/G/H",
  "3C/E/F/H/I",
  "3E/H/I/J/K",
  "3B/E/F/I/J",
  "3A/E/H/I/J",
  "3E/F/G/I/J",
  "3D/E/I/J/L",
];

export function getQualifiedThirdPlaceTeamIds(groups: Group[]): Set<string> {
  const allThirds: { teamId: string; groupLetter: string; points: number; goalsDiff: number; goalsFor: number }[] = [];
  for (const g of groups) {
    if (!isGroupFinished(g)) continue;
    const ranked = rankGroup(g);
    if (ranked[2]) {
      allThirds.push({
        teamId: ranked[2].teamId,
        groupLetter: g.id,
        points: ranked[2].points,
        goalsDiff: ranked[2].goalsDiff,
        goalsFor: ranked[2].goalsFor,
      });
    }
  }
  allThirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
    return b.goalsFor - a.goalsFor;
  });

  const qualified = new Set<string>();
  const usedTeams = new Set<string>();

  const slots = THIRD_PLACE_SLOTS.map((s) => ({
    placeholder: s,
    possibleGroups: s.replace(/^\d+/, "").split("/"),
  })).sort((a, b) => a.possibleGroups.length - b.possibleGroups.length);

  for (const slot of slots) {
    for (const t of allThirds) {
      if (usedTeams.has(t.teamId)) continue;
      if (slot.possibleGroups.includes(t.groupLetter)) {
        qualified.add(t.teamId);
        usedTeams.add(t.teamId);
        break;
      }
    }
  }

  return qualified;
}

// ─── Qualification status ─────────────────────────────────────────

export interface QualificationInfo {
  teamId: string;
  groupLetter: string;
  position: number;
  status: "confirmed" | "eliminated" | "inContention";
}

export function getQualificationStatus(groups: Group[]): QualificationInfo[] {
  const result: QualificationInfo[] = [];

  for (const group of groups) {
    const finished = isGroupFinished(group);

    if (finished) {
      const ranked = rankGroup(group);
      for (const r of ranked) {
        result.push({
          teamId: r.teamId,
          groupLetter: group.id,
          position: r.position,
          status: r.position <= 2 ? "confirmed" : "eliminated",
        });
      }
    } else {
      for (const standing of group.standings) {
        const others = group.standings.filter((s) => s.teamId !== standing.teamId);
        const maxOtherPoints = others.map((o) => o.points + (3 - o.played) * 3);
        const maxPossibleWithoutMe = Math.max(...maxOtherPoints);

        if (standing.points > maxPossibleWithoutMe) {
          // Already guaranteed 1st
          result.push({
            teamId: standing.teamId,
            groupLetter: group.id,
            position: 1,
            status: "confirmed",
          });
        } else if (standing.points + (3 - standing.played) * 3 >= maxPossibleWithoutMe) {
          result.push({
            teamId: standing.teamId,
            groupLetter: group.id,
            position: 0,
            status: "inContention",
          });
        } else {
          result.push({
            teamId: standing.teamId,
            groupLetter: group.id,
            position: 0,
            status: "eliminated",
          });
        }
      }
    }
  }

  return result;
}
