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
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-emerald-100 text-3xl dark:bg-emerald-900/40">
            ⚽
          </div>
          <p className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {player.name}
          </p>
          {player.nationality && (
            <p className="mt-1 text-sm text-slate-500">
              {player.nationality}
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {age != null && (
              <>
                <dt className="text-slate-500">Idade</dt>
                <dd className="font-medium">{age} anos</dd>
              </>
            )}
            {player.dateOfBirth && (
              <>
                <dt className="text-slate-500">Nascimento</dt>
                <dd className="font-medium">{formatDate(player.dateOfBirth)}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
