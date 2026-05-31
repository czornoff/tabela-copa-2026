"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  Home,
  MapPin,
  Shield,
  Trophy,
  User,
} from "lucide-react";

const links = [
  { href: "/classificacao", label: "Classificação", icon: Trophy },
  { href: "/tabela", label: "Tabela", icon: Home },
  { href: "/selecoes", label: "Seleções", icon: Shield },
  { href: "/sedes", label: "Sedes", icon: MapPin },
  { href: "/historia", label: "História", icon: History },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const hidden = pathname === "/login";

  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe dark:border-slate-800 dark:bg-slate-900/95"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400 scale-105"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    active ? "scale-110" : ""
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
