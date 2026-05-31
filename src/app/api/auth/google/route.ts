import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google-oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/tabela";

  try {
    const state = Buffer.from(JSON.stringify({ redirect })).toString("base64url");
    const url = buildGoogleAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao iniciar login Google.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
