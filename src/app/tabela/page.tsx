import { PageHeader } from "@/components/layout/PageHeader";
import { GroupMatchList } from "@/components/tabela/GroupMatchList";
import { KnockoutBracket } from "@/components/tabela/KnockoutBracket";
import { fetchTournamentData } from "@/lib/data/groups";

export default async function TabelaPage() {
  const { groupMatches, knockoutMatches, updatedAt } = await fetchTournamentData();

  return (
    <>
      <PageHeader
        title="Tabela Copa 2026"
        subtitle={`72 jogos da fase de grupos · 32 jogos do mata-mata · Atualizado ${new Date(updatedAt).toLocaleString("pt-BR")}`}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Jogos da fase de grupos
        </h2>
        <GroupMatchList matches={groupMatches} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Mata-mata
        </h2>
        <KnockoutBracket matches={knockoutMatches} />
      </section>
    </>
  );
}
