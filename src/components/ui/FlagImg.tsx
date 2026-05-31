/**
 * Renderiza a bandeira de um país como imagem usando flagcdn.com,
 * evitando o problema do Windows que exibe "BR", "FR" etc. ao invés do emoji.
 */

// Mapeamento do ID local do time para o código ISO 3166-1 alpha-2 (ou subdivisão UK) usado pelo flagcdn
const teamIdToFlagCode: Record<string, string> = {
  bra: "br",
  arg: "ar",
  mex: "mx",
  rsa: "za",
  kor: "kr",
  den: "dk",
  can: "ca",
  jpn: "jp",
  sui: "ch",
  crc: "cr",
  mar: "ma",
  hai: "ht",
  sco: "gb-sct",
  usa: "us",
  par: "py",
  aus: "au",
  tur: "tr",
  fra: "fr",
  uru: "uy",
  col: "co",
  sen: "sn",
  ger: "de",
  nzl: "nz",
  ecu: "ec",
  qat: "qa",
  esp: "es",
  bel: "be",
  egy: "eg",
  irn: "ir",
  eng: "gb-eng",
  cro: "hr",
  gha: "gh",
  wal: "gb-wls",
  ita: "it",
  pol: "pl",
  sau: "sa",
  cmr: "cm",
  chi: "cl",
  tun: "tn",
  per: "pe",
  por: "pt",
  ukr: "ua",
  alg: "dz",
  jam: "jm",
  ned: "nl",
  aut: "at",
  nir: "gb-nir",
  pan: "pa",
  bih: "ba",
  czr: "cz",
  swe: "se",
  cpv: "cv",
  civ: "ci",
  cuw: "cw",
  irq: "iq",
  nor: "no",
  jor: "jo",
  cod: "cd",
  uzb: "uz",
  
};

type FlagSize = "sm" | "md" | "lg";

const sizeClasses: Record<FlagSize, string> = {
  sm: "h-4 w-5",
  md: "h-5 w-7",
  lg: "h-8 w-10",
};

interface FlagImgProps {
  /** ID local do time (ex: "bra", "fra", "eng") */
  teamId: string;
  /** Nome do time para acessibilidade */
  name?: string;
  /** Tamanho: sm (16px), md (20px), lg (32px) */
  size?: FlagSize;
  className?: string;
}

export function FlagImg({ teamId, name, size = "sm", className = "" }: FlagImgProps) {
  const normalizedId = teamId?.toLowerCase()?.trim();
  const code = teamIdToFlagCode[normalizedId];
  if (!code) {
    return <span className="inline-block text-center" style={{ width: "1.25em" }}>🏳️</span>;
  }

  // flagcdn entrega PNGs otimizados em diferentes larguras (20, 40, 80, 160...)
  const width = size === "lg" ? 80 : size === "md" ? 40 : 20;
  const src = `https://flagcdn.com/w${width}/${code}.png`;

  return (
    <img
      src={src}
      alt={name ? `Bandeira ${name}` : `Bandeira ${teamId.toUpperCase()}`}
      className={`inline-block rounded-sm object-cover ${sizeClasses[size]} ${className}`}
      loading="lazy"
    />
  );
}

/** Exporta o mapeamento para uso em outros contextos (ex: TopScorersTable) */
export { teamIdToFlagCode };
