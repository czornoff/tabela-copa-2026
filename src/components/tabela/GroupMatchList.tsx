import type { GroupMatch } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";

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
                const home = getTeamById(match.homeTeam);
                const away = getTeamById(match.awayTeam);
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
                          ? "border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900"
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
                          ENCERRADO
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
                        <FlagImg teamId={match.homeTeam} name={home?.name} size="md" />
                        <span className="truncate">{home?.name ?? match.homeTeam}</span>
                      </span>

                      <span className={`shrink-0 text-base font-bold ${
                        finished || live ? "text-slate-900 dark:text-white" : "text-slate-400"
                      }`}>
                        {match.score ?? "vs"}
                      </span>

                      <span className="flex flex-1 items-center justify-end gap-2 text-sm font-medium">
                        <span className="truncate text-right">{away?.name ?? match.awayTeam}</span>
                        <FlagImg teamId={match.awayTeam} name={away?.name} size="md" />
                      </span>
                    </div>

                    {match.events && match.events.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <div className="space-y-0.5">
                          {match.events
                            .filter((ev) => ev.teamId === match.homeTeam)
                            .sort((a, b) => a.minute - b.minute)
                            .map((ev, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-mono text-[10px] text-slate-400 w-7">
                                  {ev.minute}&apos;
                                </span>
                                {ev.type === "goal" && <span>⚽</span>}
                                {ev.type === "penalty" && <span>⚽</span>}
                                {ev.type === "ownGoal" && <span>⚽</span>}
                                {ev.type === "yellowCard" && <span>🟨</span>}
                                {ev.type === "redCard" && <span>🟥</span>}
                                <span className="truncate font-medium">{ev.player}</span>
                                {ev.detail && <span className="text-slate-400">({ev.detail})</span>}
                              </div>
                            ))}
                          {match.events.filter((ev) => ev.teamId === match.homeTeam).length === 0 && (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {match.events
                            .filter((ev) => ev.teamId === match.awayTeam)
                            .sort((a, b) => a.minute - b.minute)
                            .map((ev, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-right text-xs text-slate-600 dark:text-slate-400">
                                <span className="truncate font-medium">{ev.player}</span>
                                {ev.detail && <span className="text-slate-400">({ev.detail})</span>}
                                {ev.type === "goal" && <span>⚽</span>}
                                {ev.type === "penalty" && <span>⚽</span>}
                                {ev.type === "ownGoal" && <span>⚽</span>}
                                {ev.type === "yellowCard" && <span>🟨</span>}
                                {ev.type === "redCard" && <span>🟥</span>}
                                <span className="font-mono text-[10px] text-slate-400 w-7 text-right">
                                  {ev.minute}&apos;
                                </span>
                              </div>
                            ))}
                          {match.events.filter((ev) => ev.teamId === match.awayTeam).length === 0 && (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </div>
                      </div>
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
