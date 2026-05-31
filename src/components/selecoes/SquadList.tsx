"use client";

import { useState } from "react";
import type { Player, PlayerPosition } from "@/types";
import type { SquadPlayer } from "@/lib/data/squads";
import { PlayerDetailSheet } from "./PlayerDetailSheet";

const positionLabels: Record<PlayerPosition, string> = {
  GK: "Goleiros",
  DEF: "Defensores",
  MID: "Meio-campistas",
  FWD: "Atacantes",
};

const positionOrder: PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];

type SquadItem = Player | SquadPlayer;

function isApiPlayer(p: SquadItem): boolean {
  return /^\d+$/.test(p.id);
}

type Props = {
  squad: SquadItem[];
};

export function SquadList({ squad }: Props) {
  const [selected, setSelected] = useState<SquadItem | null>(null);

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
              <ul className="space-y-2">
                {players
                  .sort((a, b) => a.number - b.number)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className="flex w-full items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-emerald-50 active:scale-[0.99] dark:bg-slate-800/80 dark:hover:bg-emerald-900/20"
                      >
                        {"photo" in p && p.photo ? (
                          <img
                            src={p.photo}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover bg-slate-200"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                            {p.number || "—"}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-white">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {p.club !== "—" ? p.club : "Ver ficha completa"}
                            {"age" in p && p.age ? ` · ${p.age} anos` : ""}
                          </p>
                        </div>
                        <span className="text-slate-400">›</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          );
        })}
      </div>

      <PlayerDetailSheet
        playerId={selected && isApiPlayer(selected) ? selected.id : null}
        localPlayer={
          selected && !isApiPlayer(selected)
            ? {
                name: selected.name,
                number: selected.number,
                club: selected.club,
                position: positionLabels[selected.position],
              }
            : undefined
        }
        onClose={() => setSelected(null)}
      />
    </>
  );
}
