import { PageHeader } from "@/components/layout/PageHeader";
import { CountdownBanner } from "@/components/tabela/CountdownBanner";
import { GroupTable } from "@/components/tabela/GroupTable";
import { fetchTournamentData } from "@/lib/data/groups";

export default async function ClassificacaoPage() {
  const { groups, updatedAt } = await fetchTournamentData();

  return (
    <>
      <CountdownBanner />

      <PageHeader
        title="Classificação"
        subtitle={`48 seleções · 12 grupos · Atualizado ${new Date(updatedAt).toLocaleString("pt-BR")}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <GroupTable key={g.id} group={g} />
        ))}
      </div>
    </>
  );
}
