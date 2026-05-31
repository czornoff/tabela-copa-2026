"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "copa-theme";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0f172a" : "#16a34a");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [theme]);


  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, mounted };
}
