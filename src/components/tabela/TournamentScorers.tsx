import type { TournamentScorer } from "@/types";
import { FlagImg } from "@/components/ui/FlagImg";

export function TournamentScorers({ scorers }: { scorers: TournamentScorer[] }) {
  if (scorers.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-emerald-600 px-4 py-2 text-sm font-bold text-white dark:bg-emerald-700">
          Artilheiros
        </div>
        <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Nenhum dado de artilharia disponível ainda.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-emerald-600 px-4 py-2 text-sm font-bold text-white dark:bg-emerald-700">
        Artilheiros
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <th className="px-3 py-2">#</th>
            <th className="px-1 py-2">Jogador</th>
            <th className="px-1 py-2">Seleção</th>
            <th className="px-1 py-2 text-center">Gols</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => {
            return (
              <tr
                key={`${s.name}-${s.teamId}`}
                className="border-b border-slate-50 last:border-0 dark:border-slate-800/80"
              >
                <td className="px-3 py-2 font-medium text-slate-400">
                  {i + 1}
                </td>
                <td className="px-1 py-2.5">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {s.name}
                  </span>
                  {s.penalties !== undefined && s.penalties > 0 && (
                    <span className="ml-1 text-xs text-slate-400">
                      ({s.penalties} pên.)
                    </span>
                  )}
                </td>
                <td className="px-1 py-2.5">
                  <span className="mr-1.5 inline-flex items-center">
                    <FlagImg teamId={s.teamId} />
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {s.team}
                  </span>
                </td>
                <td className="px-1 py-2.5 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {s.goals}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
