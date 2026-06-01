import { NextResponse } from "next/server";
import { fetchPlayerDetail } from "@/lib/data/players";

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID de jogador inválido." }, { status: 400 });
  }

  const cached = cache.get(id);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data);
  }

  try {
    const player = await fetchPlayerDetail(id);

    if (!player) {
      return NextResponse.json(
        { error: "Jogador não encontrado ou API indisponível." },
        { status: 404 }
      );
    }

    cache.set(id, { data: player, expiresAt: Date.now() + CACHE_TTL });
    return NextResponse.json(player);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar dados do jogador." },
      { status: 500 }
    );
  }
}
