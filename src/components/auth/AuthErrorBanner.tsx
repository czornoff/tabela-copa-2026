"use client";

import { useSearchParams } from "next/navigation";

export function AuthErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;

  return (
    <p className="mb-4 w-full max-w-sm rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
      {decodeURIComponent(error)}
    </p>
  );
}
