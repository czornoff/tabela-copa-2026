import Link from "next/link";
import { notFound } from "next/navigation";
import { SquadList } from "@/components/selecoes/SquadList";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { fetchTeamSquad } from "@/lib/data/squads";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeamById(id);
  if (!team) notFound();

  // Buscar squad dinamicamente da API-Football
  const dynamicSquad = await fetchTeamSquad(id);
  const squad = dynamicSquad && dynamicSquad.length > 0 ? dynamicSquad : team.squad;

  return (
    <>
      <Link
        href="/selecoes"
        className="mb-4 inline-flex text-sm text-emerald-600 dark:text-emerald-400"
      >
        ← Voltar
      </Link>
      <header className="mb-6 flex items-center gap-4">
        <FlagImg teamId={team.id} name={team.name} size="lg" className="!h-12 !w-16" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {team.name}
          </h1>
          <p className="text-sm text-slate-500">
            Grupo {team.groupId} · {team.federation}
          </p>
        </div>
      </header>
      <SquadList squad={squad} />
    </>
  );
}
