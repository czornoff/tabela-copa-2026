import { PageHeader } from "@/components/layout/PageHeader";
import { TeamCard } from "@/components/selecoes/TeamCard";
import { getTeamsByFederation } from "@/lib/data/teams";
import { BASE_PATH } from "@/lib/config";
import { localIdToEnglishName } from "@/lib/data/teamsMapping";

export default function SelecoesPage() {
  const federations = getTeamsByFederation();

  return (
    <>
      <PageHeader
        title="Seleções"
        subtitle="48 seleções classificadas — toque para ver escalação"
      />
      <div className="space-y-8">
        {federations.map(([fed, teamList]) => (
          <section key={fed}>
            <h2 className="mb-3 text-sm font-bold uppercase text-emerald-600 dark:text-emerald-400">
              {fed}
            </h2>
            <ul className="space-y-2">
              {teamList
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((team) => (
                  <li key={team.id}>
                    <TeamCard team={team} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
