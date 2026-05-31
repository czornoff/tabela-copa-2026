"use client";

import { useState } from "react";
import type { WorldCupEdition } from "@/types";

export function HistoryTimeline({ editions }: { editions: WorldCupEdition[] }) {
  const [expanded, setExpanded] = useState<number | null>(2022);

  return (
    <ul className="space-y-2">
      {editions.map((ed) => {
        const isOpen = expanded === ed.ano;
        return (
          <li key={ed.ano}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : ed.ano)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <span>
                  <span className="flex h-10 w-28 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-2xl font-bold text-white">
                    {ed.ano}
                  </span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white">
                    {ed.sede ? `🏟️ ${ed.sede}` : ""}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                    {ed.campeao ? `🏆 ${ed.campeao}` : ""}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {ed.campeao ? `🥈 ${ed.vice}` : ""}
                </p>
              </div>
              <span
                className={`text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="mx-1 mt-0 rounded-lg bg-slate-50 px-4 pb-2 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-4 gap-2 justify-between mb-4 pt-4 pe-4">
                    <div className="col-span-3">
                        {ed.final && (
                        <p className="text-md font-semibold mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            Final: {ed.final.placar}
                        </p>
                        )}
                        {ed.terceiro_lugar && (
                        <p className="mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            3º Lugar: {ed.terceiro_lugar.placar}
                        </p>
                        )}
                        {ed.artilheiro && (
                        <div className="font-semibold mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                        { ed.artilheiro && (
                            <div className="flex items-top gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <div className="w-13 text-lg font-bold">⚽&nbsp;{ed.artilheiro.gols}</div>
                                <div className="pt-1">{ed.artilheiro.nome} ({ed.artilheiro.pais})</div>
                            </div>
                        ) }
                        </div>
                        )}
                        {ed.destaque && (
                        <p className="font-semibold mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            {ed.destaque}
                        </p>
                        )}
                    </div>
                    <div className="col-span-1">
                        <img
                            src={`./img/poster/poster${ed.ano}.jpg`}
                            alt={`Poster da Copa de ${ed.ano}`}
                            className="ms-4 object-cover mb-1"
                        />
                    </div>
                </div>
                <ul className="list-disc pl-5 space-y-1.5">
                  {ed.curiosidades.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
                {ed. mascote && (
                <div className="grid grid-cols-4 gap-2 justify-between mb-4 pt-4 pe-0 border-t border-slate-200 dark:border-slate-700 mt-3">
                    <div className="col-span-1 mx-0">
                        <img
                            src={`./img/mascotes/${ed.ano}.webp`}
                            alt={ed.mascote.nome}
                            className="ms-0 pe-6 object-cover mb-1"
                        />
                    </div>
                    <div className="col-span-3">
                        <p className="text-2xl font-semibold mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            {ed.mascote.nome}
                        </p>
                        <p className="mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            {ed.mascote.curiosidade}
                        </p>
                    </div>
                </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
