"use client";

import Link from "next/link";
import type { Team } from "@/types";
import { FlagImg } from "@/components/ui/FlagImg";

export function TeamCard({ team }: { team: Team }) {
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
      <span className="text-slate-300 dark:text-slate-600">›</span>
    </Link>
  );
}
