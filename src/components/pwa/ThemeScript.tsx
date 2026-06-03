"use client";

import { useEffect } from "react";

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('copa-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  useEffect(() => {
    const s = document.createElement("script");
    s.textContent = themeScript;
    document.head.appendChild(s);
    document.head.removeChild(s);
  }, []);

  return null;
}
