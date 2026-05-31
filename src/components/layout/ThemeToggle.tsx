"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle, mounted } = useThemeContext();

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Alternar tema"
        className="fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-opacity opacity-50"
        disabled
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className="fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-500 active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-400"
    >
      <span className="transition-transform duration-300">
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </span>
    </button>
  );
}
