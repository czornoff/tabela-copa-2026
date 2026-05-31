import type { KnockoutMatch } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";

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
                const home = getTeamById(match.homeTeam);
                const away = getTeamById(match.awayTeam);
                return (
                  <li
                    key={match.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400">{match.game}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex-1 text-sm font-medium">
                        {match.homeTeam}
                        <FlagImg teamId={match.homeTeam} name={home?.name} /> {home?.name}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {match.score ?? "vs"}
                      </span>
                      <span className="flex-1 text-right text-sm font-medium">
                        {away?.name} <FlagImg teamId={match.awayTeam} name={away?.name} /> {match.awayTeam}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {match.date} · {match.time} · {match.venue}
                    </p>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
