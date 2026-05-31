import { NextResponse, type NextRequest } from "next/server";
import { appPath, stripBasePath } from "@/lib/auth/urls";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function authMiddleware(request: NextRequest) {
  const pathname = stripBasePath(request.nextUrl.pathname);
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  const protectedPaths = ["/tabela", "/selecoes"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = appPath("/login");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = appPath("/tabela");
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
