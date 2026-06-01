import { PageHeader } from "@/components/layout/PageHeader";

export default function SobrePage() {
  return (
    <>
      <PageHeader
        title="Sobre"
        subtitle="Informações sobre o aplicativo e a empresa"
      />

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Copa do Mundo 2026
          </h2>
          <p className="mt-1 text-xs text-slate-400">Versão 1.0.0</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Aplicativo completo sobre a Copa do Mundo FIFA 2026. Acompanhe em
            tempo real a classificação dos grupos, a tabela de jogos com todos os
            confrontos, os elencos convocados de cada seleção, as sedes nos três
            países-sede e a rica história do torneio desde 1930.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              Classificação atualizada dos 12 grupos
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              Tabela completa com datas, horários e estádios
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              Elencos das 48 seleções com fichas dos jogadores
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              16 sedes nos EUA, México e Canadá
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              História de todas as Copas desde o Uruguai 1930
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Zornoff Consultoria
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            A Zornoff Consultoria é uma empresa especializada em desenvolvimento
            de soluções digitais sob medida. Com foco em inovação e experiência
            do usuário, oferecemos serviços de consultoria, desenvolvimento de
            aplicações web e mobile, e transformação digital para empresas de
            todos os portes.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Este aplicativo foi desenvolvido como demonstração de nossa
            capacidade técnica e compromisso com a qualidade, utilizando
            tecnologias modernas como Next.js, React e Tailwind CSS.
          </p>
        </div>
      </section>
    </>
  );
}
