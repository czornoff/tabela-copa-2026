import { NextResponse } from "next/server";
import { fetchPlayerDetail } from "@/lib/data/players";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID de jogador inválido." }, { status: 400 });
  }

  const player = await fetchPlayerDetail(id);

  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado ou API indisponível." },
      { status: 404 }
    );
  }

  return NextResponse.json(player);
}
