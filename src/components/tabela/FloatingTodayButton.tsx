"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

export function FloatingTodayButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToToday() {
    const today = new Date().toISOString().slice(0, 10);
    const els = document.querySelectorAll("[id^='match-']");
    for (const el of Array.from(els)) {
      const id = el.id.replace("match-", "");
      // Try to find a match element whose date matches today
      const text = el.textContent || "";
      const formattedToday = today.split("-").reverse().join("/");
      if (text.includes(formattedToday)) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-emerald-400");
        setTimeout(() => el.classList.remove("ring-2", "ring-emerald-400"), 2000);
        return;
      }
    }
    // Fallback: scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToToday}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl active:scale-95 sm:bottom-6 sm:right-6 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      title="Ir para jogos de hoje"
    >
      <CalendarDays className="h-4 w-4" />
      Hoje
    </button>
  );
}
