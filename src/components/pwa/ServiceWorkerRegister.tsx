"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/config";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const swUrl = `${BASE_PATH}/sw.js`;
    const scope = `${BASE_PATH}/`;

    const register = async () => {
      try {
        await navigator.serviceWorker.register(swUrl, { scope });
      } catch (err) {
        console.warn("SW registration failed:", err);
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
