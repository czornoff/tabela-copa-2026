import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth/users";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { email, password, name } = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const user = await createUser({ email, password, name });
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no cadastro." },
      { status: 400 }
    );
  }
}
