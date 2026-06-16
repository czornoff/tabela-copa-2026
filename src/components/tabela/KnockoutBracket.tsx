import type { KnockoutMatch } from "@/types";
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

export function KnockoutBracket({ matches }: { matches: KnockoutMatch[] }) {
  const rounds = [...new Set(matches.map((m) => m.round))];

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <section key={round}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {round}
          </h3>
          <ul className="space-y-2">
            {matches
              .filter((m) => m.round === round)
              .map((match) => {
                const homeDisplay = resolveTeamDisplayName(match.homeTeam);
                const awayDisplay = resolveTeamDisplayName(match.awayTeam);
                const finished = isFinished(match.status);
                const live = isLive(match.status);

                return (
                  <li
                    key={match.id}
                    id={`match-${match.id}`}
                    className={`rounded-xl border p-3 transition ${
                      live
                        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : finished
                          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          : "border-slate-200 bg-white opacity-50 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
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
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Jogo {match.game}
                      </span>
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
        </section>
      ))}
    </div>
  );
}
