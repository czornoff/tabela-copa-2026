// Função utilitária para buscar da API do API-Football
export async function fetchFromApi(endpoint: string) {
  const host = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error("Chave API_FOOTBALL_KEY não configurada no .env.local.");
  }

  const cleanHost = host.trim();
  const cleanKey = key.trim();

  const headers: Record<string, string> = {};
  if (cleanHost.includes("rapidapi")) {
    headers["x-rapidapi-host"] = cleanHost;
    headers["x-rapidapi-key"] = cleanKey;
  } else {
    headers["x-apisports-key"] = cleanKey;
  }

  const url = `https://${cleanHost}/${endpoint}`;
  const response = await fetch(url, {
    headers,
    next: { revalidate: 900 } // Cache e revalidação no Next.js a cada 15 minutos (900 segundos)
  });

  if (!response.ok) {
    throw new Error(`Erro na chamada da API (${response.status}): ${response.statusText}`);
  }

  return response.json();
}
