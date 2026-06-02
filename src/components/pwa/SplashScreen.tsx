"use client";

import { useState, useEffect } from "react";
import { BASE_PATH } from "@/lib/config";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-emerald-600 transition-opacity duration-500 dark:bg-slate-900"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <img
        src={`${BASE_PATH}/icons/icon-512.png`}
        alt="Copa do Mundo 2026"
        className="h-28 w-28 animate-pulse"
      />
      <h1 className="mt-6 text-3xl font-bold text-white tracking-tight">
        Copa do Mundo
      </h1>
      <p className="mt-1 text-lg font-semibold text-emerald-100 dark:text-emerald-300">
        2026
      </p>
      <div className="mt-8 flex gap-1">
        <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-white animate-bounce" />
      </div>
    </div>
  );
}
