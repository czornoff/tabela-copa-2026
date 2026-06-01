import { NextResponse } from "next/server";
import { getAllConvocados } from "@/lib/data/convocados";

export async function GET() {
  try {
    const all = await getAllConvocados();
    const result: Record<string, unknown> = {};
    for (const [key, value] of all) {
      result[key] = value;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar dados de convocados." },
      { status: 500 }
    );
  }
}
