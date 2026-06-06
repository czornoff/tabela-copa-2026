"use client";

import Link from "next/link";
import type { Team } from "@/types";
import { FlagImg } from "@/components/ui/FlagImg";
import { BASE_PATH } from "@/lib/config";

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

export function TeamCard({ team }: { team: Team }) {
    const img = emblemFile[team.id] ?? team.id;
  return (
    <Link
      href={`/selecoes/${team.id}`}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-emerald-400 hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600"
    >
      <FlagImg teamId={team.id} name={team.name} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white truncate">
          {team.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Grupo {team.groupId} · {team.federation}
        </p>
      </div>
      <div className="flex justify-center w-16">
        <img src={`${BASE_PATH}/img/uniformes/${team.id}.webp`} alt="Uniformes" className="h-12"/>
      </div>
      <div className="flex justify-center w-16">
        <img src={`${BASE_PATH}/img/emblems/${img}.png`} alt="Emblema" className="h-12"/>
      </div>
      <span className="text-slate-300 dark:text-slate-600">›</span>
    </Link>
  );
}
