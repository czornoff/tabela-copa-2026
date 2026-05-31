import type { TopScorer } from "@/types";
import { teamIdToFlagCode } from "@/components/ui/FlagImg";

// Mapeia o código da seleção (ex: "GER") para o teamId local (ex: "ger")
function codeToTeamId(code: string): string {
  const lower = code.toLowerCase();
  // Verifica se o código minúsculo existe como teamId no mapeamento de flags
  if (teamIdToFlagCode[lower]) return lower;
  // Mapeamentos especiais onde o código FIFA difere do teamId local
  const specialMap: Record<string, string> = {
    ksa: "sau",
  };
  return specialMap[lower] ?? lower;
}

export function TopScorersTable({ scorers }: { scorers: TopScorer[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-emerald-600 text-left text-xs font-bold uppercase text-white">
          <tr>
            <th className="px-2 py-2">Jogador</th>
            <th className="px-2 py-2 text-center">Gols</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => {
            const teamId = codeToTeamId(s.code);
            const flagCode = teamIdToFlagCode[teamId];
            return (
            <tr
              key={s.name}
              className="border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
            <td className="px-2 py-3">
                <div className="flex items-center gap-1">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden me-2">
                    {flagCode ? (
                      <img
                        src={`https://flagcdn.com/w80/${flagCode}.png`}
                        alt={`Bandeira ${s.country}`}
                        className="rounded-sm object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg">⚽</span>
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-500">{s.editions}</p>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
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
