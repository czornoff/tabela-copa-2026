import { PageHeader } from "@/components/layout/PageHeader";
import { StadiumCard } from "@/components/sedes/StadiumCard";
import { hostCountries } from "@/lib/data/stadiums";
import { FlagImg } from "@/components/ui/FlagImg";
import copa2026Data from "../../../data/copa2026.json";

const stadiums = copa2026Data.copa_do_mundo_2026.sedes;

export default function SedesPage() {
  return (
    <>
      <PageHeader
        title="Sedes & Estádios"
        subtitle="EUA, México e Canadá — 16 estádios"
      />

      <div className="grid grid-cols-3 gap-1">
        {hostCountries.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="items-center"><FlagImg teamId={c.id} name={c.name} size="lg" /></div>
            <div className="font-semibold text-sm">{c.name}</div>
            <div className="text-xs text-slate-500">{c.cities} cidades</div>
          </div>
        ))}
      </div>

      <ul className="space-y-4">
        {stadiums.map((s, idx) => (
          <li key={idx}>
            <StadiumCard stadium={s} />
          </li>
        ))}
      </ul>
    </>
  );
}
