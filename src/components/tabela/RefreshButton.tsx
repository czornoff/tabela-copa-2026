"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { BASE_PATH } from "@/lib/config";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/tournament/refresh`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      title="Atualizar dados"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
      />
      {loading ? "Atualizando..." : "Atualizar"}
    </button>
  );
}
