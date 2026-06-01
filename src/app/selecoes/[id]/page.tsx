import Link from "next/link";
import { notFound } from "next/navigation";
import { SquadList } from "@/components/selecoes/SquadList";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { getConvocadosByTeam } from "@/lib/data/convocados";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeamById(id);
  if (!team) notFound();

  const convocados = await getConvocadosByTeam(id);
  const players = convocados?.players ?? [];
  const coach = convocados?.coach ?? null;

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

      {coach && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            DT
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
              Técnico
            </p>
            <p className="font-medium text-slate-900 dark:text-white">
              {coach.name}
            </p>
            {coach.nationality && (
              <p className="text-xs text-slate-500">
                {coach.nationality}
                {coach.age ? ` · ${coach.age} anos` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <SquadList squad={players} />
    </>
  );
}
