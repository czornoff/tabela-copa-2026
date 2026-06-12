import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearFootballDataCache } from "@/lib/data/footballData";

export async function POST() {
  try {
    clearFootballDataCache();
    revalidatePath("/classificacao");
    revalidatePath("/tabela");
    return NextResponse.json({
      success: true,
      message: "Cache limpo e páginas invalidadas.",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro ao limpar cache." },
      { status: 500 }
    );
  }
}
