"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { BASE_PATH } from "@/lib/config";
import type { PlayerDetail } from "@/lib/data/players";

type LocalPlayer = {
  name: string;
  number: number;
  club: string;
  position: string;
};

type Props = {
  playerId: string | null;
  localPlayer?: LocalPlayer;
  onClose: () => void;
};

export function PlayerDetailSheet({ playerId, localPlayer, onClose }: Props) {
  const [data, setData] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(playerId || localPlayer);

  useEffect(() => {
    if (!playerId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${BASE_PATH}/api/players/${playerId}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro ao carregar jogador.");
        return json as PlayerDetail;
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Erro desconhecido.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [playerId]);

  if (!open) return null;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("pt-BR");
    } catch {
      return iso;
    }
  };

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
          {localPlayer && !playerId && (
            <div className="space-y-2">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {localPlayer.name}
              </p>
              <p className="text-sm text-slate-500">
                {localPlayer.position} · #{localPlayer.number}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {localPlayer.club}
              </p>
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                Elenco local — configure <code className="text-xs">API_FOOTBALL_KEY</code>{" "}
                para estatísticas completas da API-Football.
              </p>
            </div>
          )}

          {playerId && loading && (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm">Carregando dados da API...</p>
            </div>
          )}

          {playerId && error && !loading && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </p>
          )}

          {playerId && data && !loading && (
            <>
              <div className="flex gap-4">
                {data.photo ? (
                  <img
                    src={data.photo}
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
                    {data.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {data.position}
                    {data.number != null ? ` · #${data.number}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {data.club}
                  </p>
                  {data.age != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      {data.age} anos · {data.nationality}
                    </p>
                  )}
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {data.height && (
                  <>
                    <dt className="text-slate-500">Altura</dt>
                    <dd className="font-medium">{data.height}</dd>
                  </>
                )}
                {data.weight && (
                  <>
                    <dt className="text-slate-500">Peso</dt>
                    <dd className="font-medium">{data.weight}</dd>
                  </>
                )}
                {data.birth && (
                  <>
                    <dt className="text-slate-500">Nascimento</dt>
                    <dd className="font-medium">
                      {formatDate(data.birth.date)}
                      <span className="block text-xs font-normal text-slate-500">
                        {data.birth.place}, {data.birth.country}
                      </span>
                    </dd>
                  </>
                )}
              </dl>

              {data.seasonStats && (
                <section className="mt-6">
                  <h3 className="mb-2 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Temporada (Copa)
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Jogos", value: data.seasonStats.appearances },
                      { label: "Gols", value: data.seasonStats.goals },
                      { label: "Assist.", value: data.seasonStats.assists },
                      { label: "Min.", value: data.seasonStats.minutes },
                      { label: "Amarelos", value: data.seasonStats.yellowCards },
                      { label: "Vermelhos", value: data.seasonStats.redCards },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg bg-slate-50 px-2 py-2 text-center dark:bg-slate-800/80"
                      >
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {value}
                        </p>
                        <p className="text-[10px] uppercase text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  {data.seasonStats.rating && (
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                      Nota média:{" "}
                      <span className="font-bold text-emerald-600">
                        {data.seasonStats.rating}
                      </span>
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
