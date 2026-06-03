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

function calcAge(dob: string): number | null {
  try {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

export function PlayerDetailSheet({ player, onClose }: Props) {
  if (!player) return null;

  const age = player.dateOfBirth ? calcAge(player.dateOfBirth) : null;

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
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-3xl dark:bg-emerald-900/40 shrink-0">
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              <span>⚽</span>
            )}
          </div>
          <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {player.name}
          </p>
          {player.nationality && (
            <p className="mt-1 text-sm text-slate-500">
              {player.nationality}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
            {age != null && (
              <div>
                <dt className="text-slate-500">Idade</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{age} anos</dd>
              </div>
            )}
            {player.dateOfBirth && (
              <div>
                <dt className="text-slate-500">Nascimento</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{formatDate(player.dateOfBirth)}</dd>
              </div>
            )}
            {player.height && (
              <div>
                <dt className="text-slate-500">Altura</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{player.height} cm</dd>
              </div>
            )}
            {player.weight && (
              <div>
                <dt className="text-slate-500">Peso</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{player.weight} kg</dd>
              </div>
            )}
            {player.currentTeam && (
              <div className="col-span-2">
                <dt className="text-slate-500 mb-1">Clube Atual</dt>
                <dd className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  {player.currentTeam.logo && (
                    <img src={player.currentTeam.logo} alt={player.currentTeam.name} className="h-6 w-6 object-contain" />
                  )}
                  {player.currentTeam.name}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
