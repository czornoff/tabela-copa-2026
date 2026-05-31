import { type NextRequest } from "next/server";
import { authMiddleware } from "@/lib/auth/middleware";

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/tabela-copa-2026/((?!_next/static|_next/image|manifest.json|sw.js|icons/).*)",
  ],
};
