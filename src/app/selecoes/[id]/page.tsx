import Link from "next/link";
import { BASE_PATH } from "@/lib/config";
import { notFound } from "next/navigation";
import { SquadList } from "@/components/selecoes/SquadList";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { getConvocadosByTeam } from "@/lib/data/convocados";
import { localIdToEnglishName } from "@/lib/data/teamsMapping";

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

  const emblemFile: Record<string, string> = {
    bra: "brazil", arg: "argentina", usa: "united_states", mex: "mexico",
    can: "canada", eng: "england", fra: "france", ger: "germany",
    esp: "spain", por: "portugal", ita: "italy", ned: "netherlands",
    bel: "belgium", cro: "croatia", mar: "morocco", jpn: "japan",
    kor: "south_korea", aus: "australia", irn: "iran", sau: "saudi_arabia",
    tur: "turkiye", sui: "switzerland", aut: "austria", uru: "uruguay",
    col: "colombia", ecu: "ecuador", sen: "senegal", gha: "ghana",
    civ: "ivory_coast", cam: "cameroon", nga: "nigeria", tun: "tunisia",
    alg: "algeria", egy: "egypt", rsa: "south_africa", cpv: "cape_verde",
    pan: "panama", crc: "costa_rica", hon: "honduras", jam: "jamaica",
    nzl: "new_zealand", par: "paraguay", chi: "chile", per: "peru",
    bol: "bolivia", czr: "czechia", sco: "scotland", qat: "qatar",
    nor: "norway", swe: "sweden", bih: "bosnia_herzegovina", cuw: "curacao",
    irq: "iraq", jor: "jordan", cod: "dr_congo", uzb: "uzbekistan",
    hai: "haiti",
  };

  const img = emblemFile[team.id] ?? team.id;

  return (
    <>
      <Link
        href="/selecoes"
        className="mb-4 inline-flex text-sm text-emerald-600 dark:text-emerald-400"
      >
        ← Voltar
      </Link>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <FlagImg teamId={team.id} name={team.name} size="lg" className=" !w-16 border border-slate-400 dark:border-slate-800" />
        </div>
        <div className="flex justify-center">
          <img src={`${BASE_PATH}/img/emblems/${img}.png`} alt="Emblema" className="h-24"/>
        </div>
        <div className="flex justify-center">
          <img src={`${BASE_PATH}/img/uniformes/${team.id}.webp`} alt="Uniformes" className="h-32"/>
        </div>
      </header>

      {coach && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700/80">
          <div className="min-w-0 flex-1 me-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {team.name}
              </h1>
              <p className="text-sm text-slate-500">
                Grupo {team.groupId} · {team.federation}
              </p>
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
                {coach.dateOfBirth ? ` · ${new Date(coach.dateOfBirth).getFullYear()}` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <SquadList squad={players} />
    </>
  );
}
