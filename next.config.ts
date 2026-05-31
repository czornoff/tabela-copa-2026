import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/tabela-copa-2026";

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
