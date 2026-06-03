import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BASE_PATH } from "@/lib/config";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeScript } from "@/components/pwa/ThemeScript";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copa do Mundo 2026 — Tabela & Curiosidades",
  description:
    "PWA da Copa do Mundo 2026: tabela, seleções, sedes e história desde 1930.",
  manifest: `${BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Copa 2026",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href={`${BASE_PATH}/icons/icon-192.png`} />
        <link rel="icon" href={`${BASE_PATH}/icons/icon-192.png`} type="image/png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ThemeScript />
        <ThemeProvider>
          <SplashScreen />
          <div className="mx-auto max-w-4xl">
            <a href="https://www.zornoff.com.br" target="_blank" rel="noopener noreferrer">
              <img
                className="h-12 mt-4 ml-5"
                src={`${BASE_PATH}/img/logohZt.png`}
                alt="Zornoff Consultoria"
              />
            </a>
          </div>
          <AppShell>{children}</AppShell>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
