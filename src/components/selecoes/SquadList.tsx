"use client";

import type { PlayerPosition } from "@/types";
import type { Convocado } from "@/lib/data/convocados";

const positionLabels: Record<PlayerPosition, string> = {
  GK: "Goleiros",
  DEF: "Defensores",
  MID: "Meio-campistas",
  FWD: "Atacantes",
};

const positionOrder: PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

type Props = {
  squad: Convocado[];
};

export function SquadList({ squad }: Props) {
  return (
    <div className="space-y-6">
      {positionOrder.map((pos) => {
        const players = squad.filter((p) => p.position === pos);
        if (!players.length) return null;

        return (
          <section key={pos}>
            <h3 className="mb-2 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
              {positionLabels[pos]}
            </h3>
            <ul className="space-y-1">
              {players.map((p, i) => {
                const age = calcAge(p.dateOfBirth);
                return (
                  <li
                    key={i}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 dark:bg-slate-800/80 dark:text-white"
                  >
                    <span>{p.name}</span><br/>
                    {(age || p.nationality) && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {age ? `${age} anos` : ""}
                        {age && p.nationality ? " · " : ""}
                        {p.nationality || ""}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
