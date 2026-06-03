"use client";

import { useState } from "react";
import type { PlayerPosition } from "@/types";
import type { Convocado } from "@/lib/data/convocados";
import { PlayerDetailSheet } from "./PlayerDetailSheet";

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
  const [selectedPlayer, setSelectedPlayer] = useState<Convocado | null>(null);

  return (
    <>
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
                      onClick={() => setSelectedPlayer(p)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-800"
                    >
                      <div className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg">⚽</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{p.name}</span>
                        {(age || p.nationality) && (
                          <span className="block text-xs font-normal text-slate-500 truncate">
                            {age ? `${age} anos` : ""}
                            {age && p.nationality ? " · " : ""}
                            {p.nationality || ""}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <PlayerDetailSheet
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </>
  );
}
