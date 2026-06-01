"use client";

import { X } from "lucide-react";
import type { Convocado } from "@/lib/data/convocados";

type Props = {
  player: Convocado | null;
  onClose: () => void;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export function PlayerDetailSheet({ player, onClose }: Props) {
  if (!player) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do jogador"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ficha do jogador
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-4">
            {player.photo ? (
              <img
                src={player.photo}
                alt=""
                className="h-24 w-24 rounded-xl object-cover bg-slate-100"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-emerald-100 text-3xl dark:bg-emerald-900/40">
                ⚽
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {player.name}
              </p>
              <p className="text-sm text-slate-500">
                {player.position === "GK" ? "Goleiro" : player.position === "DEF" ? "Defensor" : player.position === "MID" ? "Meio-campista" : "Atacante"}
                {player.number ? ` · #${player.number}` : ""}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {player.currentClub}
              </p>
              {player.age != null && (
                <p className="mt-1 text-xs text-slate-500">
                  {player.age} anos · {player.nationality}
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {player.height && (
              <>
                <dt className="text-slate-500">Altura</dt>
                <dd className="font-medium">{player.height}</dd>
              </>
            )}
            {player.weight && (
              <>
                <dt className="text-slate-500">Peso</dt>
                <dd className="font-medium">{player.weight}</dd>
              </>
            )}
            {player.birthDate && (
              <>
                <dt className="text-slate-500">Nascimento</dt>
                <dd className="font-medium">
                  {formatDate(player.birthDate)}
                  <span className="block text-xs font-normal text-slate-500">
                    {[player.birthPlace, player.birthCountry].filter(Boolean).join(", ")}
                  </span>
                </dd>
              </>
            )}
            {player.nationality && (
              <>
                <dt className="text-slate-500">Nacionalidade</dt>
                <dd className="font-medium">{player.nationality}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
