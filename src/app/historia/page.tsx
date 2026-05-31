import { PageHeader } from "@/components/layout/PageHeader";
import { HistoryTimeline } from "@/components/historia/HistoryTimeline";
import { TopScorersTable } from "@/components/historia/TopScorersTable";
import { FlagImg } from "@/components/ui/FlagImg";
import {
  podiumRanking,
  topScorers,
} from "@/lib/data/history";
import copasData from "../../../data/copas.json";

const worldCupHistory = copasData.copas_do_mundo;

export default function HistoriaPage() {
  return (
    <>
      <PageHeader
        title="História da Copa"
        subtitle="Desde 1930 — acesso público e offline"
      />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Linha do tempo
        </h2>
        <HistoryTimeline editions={worldCupHistory} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Maiores campeões (pódio)
        </h2>
        <ol className="space-y-2">
          {podiumRanking.map((r, i) => (
            <li
              key={r.code}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="grid grid-cols-9 items-center gap-1 w-full">
                <div className="col-span-2 text-center">
                    <FlagImg teamId={r.code} name={r.team} size="lg" />
                </div> 
                <div className="col-span-4">
                    <p className="font-semibold">{r.team}</p>
                    <p className="text-xs text-slate-500">
                      {r.titles} títulos · {r.totalPodiums} pódios totais
                    </p>
                </div>
                <div className="col-span-3 text-right text-xs text-slate-500">
                    <p>{r.finals} finais</p>
                    <p>{r.thirdPlaces}× 3º lugar</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Artilheiros históricos
        </h2>
        <TopScorersTable scorers={topScorers} />
      </section>
    </>
  );
}
