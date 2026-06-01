import type { GroupMatch } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";

export function GroupMatchList({ matches }: { matches: GroupMatch[] }) {
  const sorted = [...matches].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  return (
    <ul className="space-y-2">
      {sorted.map((match) => {
        const home = getTeamById(match.homeTeam);
        const away = getTeamById(match.awayTeam);
        return (
          <li
            key={match.id}
            className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400">GRUPO {match.groupId} • {match.matchday}ª RODADA</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex-1 text-sm font-medium">
                <FlagImg teamId={match.homeTeam} name={home?.name} /> {home?.name}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {match.score ?? "vs"}
              </span>
              <span className="flex-1 text-right text-sm font-medium">
                {away?.name} <FlagImg teamId={match.awayTeam} name={away?.name} />
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {match.date} · {match.time} · {match.venue}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
