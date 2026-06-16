import type { MatchEvent } from "@/types";

function goalMinute(ev: MatchEvent): string {
  const base = String(ev.minute);
  return ev.extra ? `${base}+${ev.extra}` : base;
}

export function MatchGoalScorers({
  events,
  homeTeam,
  awayTeam,
}: {
  events?: MatchEvent[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!events || events.length === 0) return null;

  const goals = events.filter(
    (ev) => ev.type === "goal" || ev.type === "penalty" || ev.type === "ownGoal"
  );
  if (goals.length === 0) return null;

  const homeGoals = goals.filter((ev) => ev.teamId === homeTeam);
  const awayGoals = goals.filter((ev) => ev.teamId === awayTeam);

  return (
    <div className="mt-1.5 flex items-start gap-3 text-[11px] leading-relaxed">
      <span className="flex flex-1 flex-wrap gap-x-1.5 gap-y-0.5 text-left text-slate-500 dark:text-slate-400">
        {homeGoals.map((ev, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">
            <span>⚽</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {ev.player}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {goalMinute(ev)}&apos;
            </span>
            {i < homeGoals.length - 1 && <span className="text-slate-300 dark:text-slate-600">·</span>}
          </span>
        ))}
      </span>

      <span className="flex flex-1 flex-wrap justify-end gap-x-1.5 gap-y-0.5 text-right text-slate-500 dark:text-slate-400">
        {awayGoals.map((ev, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">
            {i < awayGoals.length - 1 && <span className="text-slate-300 dark:text-slate-600">·</span>}
            <span className="font-mono text-[10px] text-slate-400">
              {goalMinute(ev)}&apos;
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {ev.player}
            </span>
            <span>⚽</span>
          </span>
        ))}
      </span>
    </div>
  );
}
