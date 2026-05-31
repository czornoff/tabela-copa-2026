import type { Stadium } from "@/types";

export const hostCountries = [
  { id: "usa", name: "Estados Unidos", flag: "🇺🇸", cities: 11 },
  { id: "mex", name: "México", flag: "🇲🇽", cities: 3 },
  { id: "can", name: "Canadá", flag: "🇨🇦", cities: 2 },
] as const;

// Removed static stadiums array as it is now loaded from data/copa2026.json
