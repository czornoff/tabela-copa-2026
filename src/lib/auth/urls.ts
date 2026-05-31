import { BASE_PATH } from "@/lib/config";

/** Origem do site (sem basePath): http://localhost:3000 ou https://mandebem.com */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

/** URL pública do app com basePath: ex. http://localhost:3000/tabela-copa-2026 */
export function getAppUrl(path = ""): string {
  const origin = getSiteOrigin();
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${origin}${BASE_PATH}${normalized}`;
}

/** Rota interna com basePath para redirects no browser */
export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}

/** Remove o basePath do pathname (útil no middleware) */
export function stripBasePath(pathname: string): string {
  if (pathname.startsWith(BASE_PATH)) {
    const rest = pathname.slice(BASE_PATH.length);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

export function getEmailConfirmUrl(redirectPath = "/tabela"): string {
  return getAppUrl(`/login?redirect=${encodeURIComponent(redirectPath)}`);
}
