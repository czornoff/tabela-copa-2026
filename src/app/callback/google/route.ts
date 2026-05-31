import { NextResponse } from "next/server";
import { appPath } from "@/lib/auth/urls";
import { exchangeGoogleCode } from "@/lib/auth/google-oauth";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  const loginError = (msg: string) =>
    NextResponse.redirect(
      new URL(`${appPath("/login")}?error=${encodeURIComponent(msg)}`, request.url)
    );

  if (error) return loginError(error);

  let redirect = "/tabela";
  if (stateRaw) {
    try {
      const state = JSON.parse(Buffer.from(stateRaw, "base64url").toString()) as {
        redirect?: string;
      };
      if (state.redirect?.startsWith("/")) redirect = state.redirect;
    } catch {
      /* ignore */
    }
  }

  if (!code) return loginError("Código Google ausente.");

  try {
    const profile = await exchangeGoogleCode(code);
    const token = await createSessionToken(profile);
    const response = NextResponse.redirect(new URL(appPath(redirect), request.url));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    return loginError(err instanceof Error ? err.message : "Falha no login Google.");
  }
}
