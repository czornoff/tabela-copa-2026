import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { appPath } from "@/lib/auth/urls";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL(appPath("/login"), request.url));
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
