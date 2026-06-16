import type { GroupMatch } from "@/types";
import { resolveTeamDisplayName } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { MatchEventsButton } from "./MatchEventsModal";
import { MatchGoalScorers } from "./MatchGoalScorers";

function isFinished(status?: string) {
  return status === "FINISHED";
}

function isLive(status?: string) {
  return status === "IN_PLAY" || status === "PAUSED";
}

export function GroupMatchList({ matches }: { matches: GroupMatch[] }) {
  const today = new Date().toISOString().slice(0, 10);

  const sorted = [...matches].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  const grouped: Record<string, GroupMatch[]> = {};
  for (const m of sorted) {
    const key = `${m.groupId}-${m.matchday}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([key, groupMatches]) => {
        const first = groupMatches[0];
        return (
          <div key={key}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Grupo {first.groupId} · {first.matchday}ª Rodada
            </h3>
            <ul className="space-y-2">
              {groupMatches.map((match) => {
                const homeDisplay = resolveTeamDisplayName(match.homeTeam);
                const awayDisplay = resolveTeamDisplayName(match.awayTeam);
                const finished = isFinished(match.status);
                const live = isLive(match.status);
                const matchDate = (() => {
                  try {
                    const [d, m, y] = match.date.split("/");
                    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                  } catch {
                    return "";
                  }
                })();
                const isToday = matchDate === today;

                return (
                  <li
                    key={match.id}
                    id={`match-${match.id}`}
                    className={`rounded-xl border p-3 transition ${
                      live
                        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : finished
                          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          : isToday
                            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                            : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {live && (
                        <span className="text-[10px] font-bold uppercase text-red-500">
                          ● AO VIVO
                        </span>
                      )}
                      {finished && (
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          ENCERRADO · {match.date} · {match.time}
                        </span>
                      )}
                      {!live && !finished && (
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {match.date} · {match.time}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {match.venue}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex flex-1 items-center gap-2 text-sm font-medium">
                        {!homeDisplay.isPlaceholder && <FlagImg teamId={match.homeTeam} name={homeDisplay.name} size="md" />}
                        <span className="truncate">{homeDisplay.name}</span>
                      </span>

                      <span className={`shrink-0 text-base font-bold ${
                        finished || live ? "text-slate-900 dark:text-white" : "text-slate-400"
                      }`}>
                        {match.score ?? "vs"}
                      </span>

                      <span className="flex flex-1 items-center justify-end gap-2 text-sm font-medium">
                        <span className="truncate text-right">{awayDisplay.name}</span>
                        {!awayDisplay.isPlaceholder && <FlagImg teamId={match.awayTeam} name={awayDisplay.name} size="md" />}
                      </span>
                    </div>

                    {finished && (
                      <MatchGoalScorers
                        events={match.events}
                        homeTeam={match.homeTeam}
                        awayTeam={match.awayTeam}
                      />
                    )}

                    {finished && (
                      <MatchEventsButton
                        matchId={match.id}
                        homeTeam={match.homeTeam}
                        awayTeam={match.awayTeam}
                        homeScore={match.scoreHome}
                        awayScore={match.scoreAway}
                        date={match.date}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
