import type { MatchEvent } from "@/types";

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup/master/2026--usa/cup.txt";

const nameToLocalId: Record<string, string> = {
  mexico: "mex",
  "south africa": "rsa",
  "south korea": "kor",
  "czech republic": "czr",
  canada: "can",
  "bosnia & herzegovina": "bih",
  "bosnia and herzegovina": "bih",
  qatar: "qat",
  switzerland: "sui",
  brazil: "bra",
  morocco: "mar",
  haiti: "hai",
  scotland: "sco",
  usa: "usa",
  "united states": "usa",
  paraguay: "par",
  australia: "aus",
  turkey: "tur",
  germany: "ger",
  "curaçao": "cuw",
  curacao: "cuw",
  "ivory coast": "civ",
  ecuador: "ecu",
  netherlands: "ned",
  japan: "jpn",
  sweden: "swe",
  tunisia: "tun",
  belgium: "bel",
  egypt: "egy",
  iran: "irn",
  "new zealand": "nzl",
  spain: "esp",
  "cape verde": "cpv",
  "saudi arabia": "sau",
  uruguay: "uru",
  france: "fra",
  senegal: "sen",
  iraq: "irq",
  norway: "nor",
  argentina: "arg",
  algeria: "alg",
  austria: "aut",
  jordan: "jor",
  portugal: "por",
  "dr congo": "cod",
  "congo dr": "cod",
  uzbekistan: "uzb",
  colombia: "col",
  england: "eng",
  croatia: "cro",
  ghana: "gha",
  panama: "pan",
};

function findTeamId(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (nameToLocalId[normalized]) return nameToLocalId[normalized];
  for (const [key, id] of Object.entries(nameToLocalId)) {
    if (normalized.includes(key) || key.includes(normalized)) return id;
  }
  return normalized.slice(0, 3);
}

function parseGoalString(goalsStr: string, teamId: string): MatchEvent[] {
  const events: MatchEvent[] = [];
  if (!goalsStr?.trim()) return events;

  const regex = /(.+?)\s+(\d{1,3})'?\s*(p|og)?(?:\s+|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(goalsStr)) !== null) {
    const minute = parseInt(m[2], 10);
    const detail = m[3]?.toLowerCase();
    let type: MatchEvent["type"] = "goal";
    if (detail === "og") type = "ownGoal";
    if (detail === "p") type = "penalty";
    events.push({
      minute,
      type,
      detail: detail === "p" ? "pênalti" : detail === "og" ? "gol contra" : undefined,
      player: m[1].trim(),
      teamId,
    });
  }
  return events;
}

export async function fetchOpenFootballData(): Promise<Map<string, MatchEvent[]>> {
  const eventsByMatch = new Map<string, MatchEvent[]>();

  try {
    const res = await fetch(OPENFOOTBALL_URL, { cache: "no-store" });
    if (!res.ok) return eventsByMatch;
    const text = await res.text();

    const lines = text.split("\n");
    let currentHome = "";
    let currentAway = "";
    let collectingGoals = false;
    let goalBuffer = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Match line: "  13:00 UTC-6     Mexico  2-0 (1-0)  South Africa        @ Mexico City"
      const matchResult = trimmed.match(
        /^\d{1,2}:\d{2}\s+UTC[+-]\d+\s+(.+?)\s+(\d{1,2}-\d{1,2})\s+\(\d{1,2}-\d{1,2}\)\s+(.+?)\s+@/
      );
      if (matchResult) {
        // If we were collecting goals for a previous match, finish it
        if (collectingGoals && goalBuffer) {
          finishGoals();
        }

        currentHome = matchResult[1].trim();
        currentAway = matchResult[3].trim();
        collectingGoals = true;
        goalBuffer = "";
        continue;
      }

      // While collecting goals, accumulate lines until we see closing ")"
      if (collectingGoals) {
        if (trimmed.startsWith("(")) {
          // Opening paren - start of goals, strip it
          goalBuffer += trimmed.slice(1);
        } else if (trimmed.endsWith(")")) {
          // Closing paren - end of goals
          goalBuffer += " " + trimmed.slice(0, -1);
          finishGoals();
          collectingGoals = false;
          goalBuffer = "";
        } else if (trimmed.startsWith(";")) {
          // Semicolon separator between home/away goals
          goalBuffer += trimmed;
        } else if (goalBuffer) {
          // Continuation line (e.g. away goals on next line)
          goalBuffer += " " + trimmed;
        }
        continue;
      }

      // If we have a pending goal buffer without proper closing, try to finish
      if (collectingGoals && goalBuffer && trimmed) {
        // Check if next line is a new match or group header
        if (!trimmed.startsWith("(") && !trimmed.endsWith(")")) {
          finishGoals();
          collectingGoals = false;
          goalBuffer = "";
        }
      }
    }

    // Finish any remaining goals
    if (collectingGoals && goalBuffer) {
      finishGoals();
    }

    function finishGoals() {
      const cleanBuffer = goalBuffer.replace(/\)/g, "").trim();
      if (!cleanBuffer) return;

      const homeId = findTeamId(currentHome);
      const awayId = findTeamId(currentAway);
      const matchKey = `${homeId}-${awayId}`;

      const [homeGoalsStr, awayGoalsStr] = cleanBuffer.split(";").map((s) => s.trim());

      const events: MatchEvent[] = [
        ...parseGoalString(homeGoalsStr, homeId),
        ...parseGoalString(awayGoalsStr, awayId),
      ];

      if (events.length > 0) {
        eventsByMatch.set(matchKey, events);
      }
    }
  } catch (error) {
    console.error("Erro ao buscar dados da openfootball:", error);
  }

  return eventsByMatch;
}
