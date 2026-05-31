import type { PodiumRanking, TopScorer, WorldCupEdition } from "@/types";

// Removed static worldCupHistory as it is now loaded from data/copas.json

export const podiumRanking: PodiumRanking[] = [
  { team: "Brasil", code: "BRA", titles: 5, finals: 7, thirdPlaces: 2, totalPodiums: 14 },
  { team: "Alemanha", code: "GER", titles: 4, finals: 8, thirdPlaces: 4, totalPodiums: 16 },
  { team: "Itália", code: "ITA", titles: 4, finals: 6, thirdPlaces: 1, totalPodiums: 11 },
  { team: "Argentina", code: "ARG", titles: 3, finals: 7, thirdPlaces: 0, totalPodiums: 10 },
  { team: "França", code: "FRA", titles: 2, finals: 4, thirdPlaces: 0, totalPodiums: 6 },
  { team: "Uruguai", code: "URU", titles: 2, finals: 2, thirdPlaces: 0, totalPodiums: 4 },
  { team: "Inglaterra", code: "ENG", titles: 1, finals: 1, thirdPlaces: 0, totalPodiums: 2 },
  { team: "Espanha", code: "ESP", titles: 1, finals: 1, thirdPlaces: 0, totalPodiums: 2 },
];

export const topScorers: TopScorer[] = [
  { name: "Miroslav Klose", country: "Alemanha", code: "GER", goals: 16, editions: "2002–2014" },
  { name: "Ronaldo Fenômeno", country: "Brasil", code: "BRA", goals: 15, editions: "1998–2006" },
  { name: "Gerd Müller", country: "Alemanha", code: "GER", goals: 14, editions: "1970–1974" },
  { name: "Just Fontaine", country: "França", code: "FRA", goals: 13, editions: "1958 (única Copa)" },
  { name: "Lionel Messi", country: "Argentina", code: "ARG", goals: 13, editions: "2006–2022" },
  { name: "Pelé", country: "Brasil", code: "BRA", goals: 12, editions: "1958–1970" },
];
