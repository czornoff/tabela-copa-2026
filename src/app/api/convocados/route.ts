import { NextResponse } from "next/server";
import { getAllConvocados } from "@/lib/data/convocados";

export async function GET() {
  try {
    const all = await getAllConvocados();
    return NextResponse.json(all);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar dados de convocados." },
      { status: 500 }
    );
  }
}
