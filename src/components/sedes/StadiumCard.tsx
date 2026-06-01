import type { Stadium } from "@/types";

export function StadiumCard({ stadium }: { stadium: Stadium }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row">
      <div className="w-full sm:w-1/3 shrink-0">
        <img
          src={stadium.imagem_estadio_url}
          alt={`Estádio ${stadium.estadio_nome_comum}`}
          className="h-48 sm:h-full w-full object-cover"
        />
      </div>
      <div className="p-5 flex-1">
        <div className="grid grid-cols-3 gap-1 justify-between mb-4">
          <div className="col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {stadium.estadio_nome_comum}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Oficial: {stadium.estadio_nome_oficial_fifa}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {stadium.cidade} · {stadium.pais}
            </p>
          </div>
          <div className="cols-span-1 flex items-center gap-2">
            <span className="shrink-0 rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 float-right">
                Público:<br/>{stadium.capacidade_fifa.toLocaleString("pt-BR")}
            </span>
            <img
                src={`./img/sedes/${stadium.logo_sede_url}`}
                alt={`Sede ${stadium.cidade}`}
                className="ms-4 h-16 sm:h-32 object-cover mb-1"
            />
          </div>
        </div>
        
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Curiosidades</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {stadium.curiosidades.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
