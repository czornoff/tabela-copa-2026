import { PageHeader } from "@/components/layout/PageHeader";
// import { CountdownBannerClient } from "@/components/tabela/CountdownBannerClient";
import { GroupTable } from "@/components/tabela/GroupTable";
import { TournamentScorers } from "@/components/tabela/TournamentScorers";
import { RefreshButton } from "@/components/tabela/RefreshButton";
import { fetchTournamentData } from "@/lib/data/groups";

export default async function ClassificacaoPage() {
  const { groups, updatedAt, topScorers } = await fetchTournamentData();

  return (
    <>
      {/* <CountdownBannerClient /> */}

      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Classificação"
          subtitle={`48 seleções · 12 grupos · Atualizado ${new Date(updatedAt).toLocaleString("pt-BR")}`}
        />
        <div className="mt-1 shrink-0">
          <RefreshButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <GroupTable key={g.id} group={g} />
        ))}
      </div>

      {topScorers && topScorers.length > 0 && (
        <div className="mt-6">
          <TournamentScorers scorers={topScorers} />
        </div>
      )}
    </>
  );
}
