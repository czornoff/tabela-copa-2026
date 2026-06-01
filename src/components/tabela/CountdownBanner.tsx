"use client";

import { useEffect, useState } from "react";

const WORLD_CUP_START = new Date("2026-06-11T00:00:00-06:00").getTime();

function getTimeLeft() {
  const now = Date.now();
  const diff = WORLD_CUP_START - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownBanner() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const isFinished = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white shadow-lg animate-in fade-in duration-500 dark:border-yellow-900 dark:from-yellow-900 dark:to-yellow-900">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-100 sm:text-sm">
            Copa do Mundo FIFA 2026
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-white sm:text-base">
            {isFinished
              ? "A Copa já começou!"
              : "Faltam para o início"}
          </p>
        </div>

        {!isFinished && (
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <TimeBlock value={time.days} label="dias" />
            <Separator />
            <TimeBlock value={time.hours} label="hrs" />
            <Separator />
            <TimeBlock value={time.minutes} label="min" />
            <Separator />
            <TimeBlock value={time.seconds} label="seg" />
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white/20 px-2 py-1.5 backdrop-blur-sm sm:px-3 sm:py-2">
      <span className="text-lg font-bold tabular-nums leading-none sm:text-2xl">
        {pad(value)}
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-yellow-100 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="self-center text-lg font-bold text-yellow-200 sm:text-xl">
      :
    </span>
  );
}
