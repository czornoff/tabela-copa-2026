"use client";

import { useRouter } from "next/navigation";
import { BASE_PATH } from "@/lib/config";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${BASE_PATH}/api/auth/logout`, { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-6 w-full rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      Sair da conta
    </button>
  );
}
