"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    const dismissedAt = Number(val);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<
    Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
  | null>(null);
  const [visible, setVisible] = useState(false);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }, []);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
      setTimeout(() => setVisible(true), 3000);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Instala o app
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acesse a Copa 2026 direto da tela inicial
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
