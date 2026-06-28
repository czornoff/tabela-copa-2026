import type { Group, KnockoutMatch } from "@/types";
import { getTeamById, resolveTeamDisplayName } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { MatchEventsButton } from "./MatchEventsModal";
import { MatchGoalScorers } from "./MatchGoalScorers";
import { isGroupFinished, rankGroup, getQualifiedThirdPlaceTeamIds } from "@/lib/data/bracketResolver";

function isFinished(status?: string) {
  return status === "FINISHED";
}

function isLive(status?: string) {
  return status === "IN_PLAY" || status === "PAUSED";
}

function QualificationSummary({ groups }: { groups: Group[] }) {
  const finishedGroups = groups.filter(isGroupFinished);
  if (finishedGroups.length === 0) return null;

  const qualifiedThirdIds = getQualifiedThirdPlaceTeamIds(groups);

  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        Seleções classificadas
      </h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {finishedGroups.map((g) => {
          const ranked = rankGroup(g);
          const thirdPlace = ranked[2];
          const isThirdQualified = thirdPlace && qualifiedThirdIds.has(thirdPlace.teamId);
          return (
            <div key={g.id} className="rounded-lg bg-white p-2 dark:bg-slate-900">
              <span className="text-[10px] font-bold uppercase text-slate-500">Grupo {g.id}</span>
              {ranked.slice(0, 2).map((r, i) => {
                const team = getTeamById(r.teamId);
                return (
                  <div key={r.teamId} className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-600">{i + 1}º</span>
                    <FlagImg teamId={r.teamId} name={team?.name} size="sm" />
                    <span className="text-xs font-medium truncate">{team?.name ?? r.teamId}</span>
                  </div>
                );
              })}
              {isThirdQualified && thirdPlace && (() => {
                const team = getTeamById(thirdPlace.teamId);
                return (
                  <div key={thirdPlace.teamId} className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-amber-600">3º</span>
                    <FlagImg teamId={thirdPlace.teamId} name={team?.name} size="sm" />
                    <span className="text-xs font-medium truncate">{team?.name ?? thirdPlace.teamId}</span>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamSlot({ teamId, side }: { teamId: string; side: "home" | "away" }) {
  const display = resolveTeamDisplayName(teamId);
  const team = !display.isPlaceholder ? getTeamById(teamId) : null;
  const isReal = !display.isPlaceholder && !!team;

  return (
    <span className={`flex flex-1 items-center gap-2 text-sm font-medium ${side === "away" ? "justify-end" : ""}`}>
      {side === "away" && <span className="truncate text-right">{display.name}</span>}
      {isReal && <FlagImg teamId={teamId} name={team.name} size="md" />}
      {!isReal && (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {display.name}
        </span>
      )}
      {side === "home" && <span className="truncate">{display.name}</span>}
    </span>
  );
}

export function KnockoutBracket({ matches, groups }: { matches: KnockoutMatch[]; groups: Group[] }) {
  const rounds = [...new Set(matches.map((m) => m.round))];

  return (
    <div className="space-y-6">
      <QualificationSummary groups={groups} />

      {rounds.map((round) => (
        <section key={round}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {round}
          </h3>
          <ul className="space-y-2">
            {matches
              .filter((m) => m.round === round)
              .map((match) => {
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
                          : "border-slate-200 bg-white opacity-60 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
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
                      <TeamSlot teamId={match.homeTeam} side="home" />

                      <span className={`shrink-0 text-base font-bold ${
                        finished || live ? "text-slate-900 dark:text-white" : "text-slate-400"
                      }`}>
                        {match.score ?? "vs"}
                      </span>

                      <TeamSlot teamId={match.awayTeam} side="away" />
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
