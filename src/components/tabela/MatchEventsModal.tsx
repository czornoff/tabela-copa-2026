"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { getTeamById } from "@/lib/data/teams";
import { FlagImg } from "@/components/ui/FlagImg";
import { BASE_PATH } from "@/lib/config";

interface NormalizedEvent {
  minute: number;
  extraMinute: number | null;
  teamSide: "home" | "away";
  type: string;
  player: string;
  playerIn: string;
  playerOut: string;
  assist: string | null;
  detail: string | null;
}

const CACHE_TTL = 60 * 60 * 1000;
const CACHE_VERSION = 3;

function getCacheKey(matchId: string) {
  return `match_events_v${CACHE_VERSION}_${matchId}`;
}

function getCached(matchId: string): NormalizedEvent[] | null {
  try {
    const raw = localStorage.getItem(getCacheKey(matchId));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(getCacheKey(matchId));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(matchId: string, data: NormalizedEvent[]) {
  try {
    localStorage.setItem(
      getCacheKey(matchId),
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {}
}

function eventIcon(type: string) {
  switch (type) {
    case "goal":
    case "penalty":
    case "own_goal":
      return "⚽";
    case "yellow_card":
      return "🟨";
    case "red_card":
      return "🟥";
    case "substitution":
      return "🔄";
    default:
      return "•";
  }
}

function eventTypeLabel(type: string) {
  switch (type) {
    case "goal":
      return "Gol";
    case "penalty":
      return "Pênalti";
    case "own_goal":
      return "Gol Contra";
    case "yellow_card":
      return "Cartão Amarelo";
    case "red_card":
      return "Cartão Vermelho";
    case "substitution":
      return "Substituição";
    default:
      return type;
  }
}

function eventMinute(ev: NormalizedEvent): string {
  if (!ev.minute && ev.minute !== 0) return "?";
  const base = String(ev.minute);
  return ev.extraMinute ? `${base}+${ev.extraMinute}` : base;
}

export function MatchEventsButton({
  matchId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
}) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const cached = getCached(matchId);
    if (cached) {
      setEvents(cached);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("home", homeTeam);
      qs.set("away", awayTeam);
      if (date) {
        const [d, m, y] = date.split("/");
        qs.set("date", `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      }
      const res = await fetch(`${BASE_PATH}/api/matches/${matchId}/events?${qs.toString()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const parsed: NormalizedEvent[] = data?.events ?? [];
      setEvents(parsed);
      setCache(matchId, parsed);
    } catch {
      setError("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, [matchId, homeTeam, awayTeam, date]);

  useEffect(() => {
    if (open) fetchEvents();
  }, [open, fetchEvents]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  const home = getTeamById(homeTeam);
  const away = getTeamById(awayTeam);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
      >
        Ver eventos do jogo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <FlagImg teamId={homeTeam} name={home?.name} size="sm" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {home?.name ?? homeTeam}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  {homeScore} - {awayScore}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {away?.name ?? awayTeam}
                </span>
                <FlagImg teamId={awayTeam} name={away?.name} size="sm" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Carregando eventos...</span>
                </div>
              )}

              {error && (
                <div className="py-8 text-center text-sm text-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && events.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  Nenhum evento registrado
                </div>
              )}

              {!loading && !error && events.length > 0 && (
                <div className="space-y-1">
                  {events
                    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
                    .map((ev, i) => {
                      const isHome = ev.teamSide === "home";
                      const isSub = ev.type === "substitution";
                      const corHome = ev.type == "goal" ? "bg-blue-200 dark:bg-blue-950/50" : "bg-blue-50 dark:bg-blue-950/30";
                      const corAway = ev.type == "goal" ? "bg-amber-200 dark:bg-amber-950/50" : "bg-amber-50 dark:bg-amber-950/30";
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                            isHome
                              ? corHome
                              : corAway
                          }`}
                        >
                          <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-slate-500">
                            {eventMinute(ev)}&apos;
                          </span>
                          <span className="text-base">
                            {eventIcon(ev.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            {isSub ? (
                              <>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {ev.playerIn}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {" "}
                                  entra por{" "}
                                </span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {ev.playerOut}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {ev.player}
                                </span>
                                <span className="ml-1 text-[10px] text-slate-400">
                                  ({eventTypeLabel(ev.type)})
                                </span>
                                {ev.assist && (
                                  <span className="block text-[10px] text-slate-400">
                                    Assistência: {ev.assist}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <FlagImg
                            teamId={isHome ? homeTeam : awayTeam}
                            name={
                              getTeamById(isHome ? homeTeam : awayTeam)?.name
                            }
                            size="sm"
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
