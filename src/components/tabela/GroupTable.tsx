import type { Group } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";

function goalDiff(gf: number, ga: number) {
  const d = gf - ga;
  return d > 0 ? `+${d}` : `${d}`;
}

export function GroupTable({ group }: { group: Group }) {
  const sorted = [...group.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    return diffB - diffA;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-emerald-600 px-4 py-2 text-sm font-bold text-white dark:bg-emerald-700">
        {group.name}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <th className="px-3 py-1">#</th>
            <th className="px-1 py-2">Seleção</th>
            <th className="px-1 py-2 text-center">J</th>
            <th className="px-1 py-2 text-center">Pts</th>
            <th className="px-1 py-2 text-center">SG</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const team = getTeamById(row.teamId);
            return (
              <tr
                key={row.teamId}
                className="border-b border-slate-50 last:border-0 dark:border-slate-800/80"
              >
                <td className="px-3 py-1 font-medium text-slate-400">
                  {idx + 1}
                </td>
                <td className="px-1 py-2.5">
                  <span className="mr-1.5 inline-flex items-center"><FlagImg teamId={row.teamId} name={team?.name} /></span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {team?.name ?? row.teamId}
                  </span>
                </td>
                <td className="px-1 py-2.5 text-center text-slate-600 dark:text-slate-400">
                  {row.played}
                </td>
                <td className="px-1 py-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  {row.points}
                </td>
                <td className="px-1 py-2.5 text-center text-slate-600 dark:text-slate-400">
                  {goalDiff(row.goalsFor, row.goalsAgainst)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
