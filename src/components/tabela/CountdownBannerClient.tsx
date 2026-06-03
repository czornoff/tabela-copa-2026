"use client";

import dynamic from "next/dynamic";

const CountdownBanner = dynamic(
  () => import("@/components/tabela/CountdownBanner").then((m) => m.CountdownBanner),
  { ssr: false },
);

export function CountdownBannerClient() {
  return <CountdownBanner />;
}
