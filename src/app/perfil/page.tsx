import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getSession } from "@/lib/auth/session";
import { appPath } from "@/lib/auth/urls";

export default async function PerfilPage() {
  const user = await getSession();

  if (!user) {
    return (
      <>
        <PageHeader title="Perfil" subtitle="Faça login para acessar recursos exclusivos" />
        <Link
          href={appPath("/login")}
          className="block w-full rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white"
        >
          Entrar / Cadastrar
        </Link>
        <p className="mt-4 text-center text-sm text-slate-500">
          Tabela e seleções exigem login. Sedes e história são públicas.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Perfil" subtitle="Sua conta Copa 2026" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Nome</p>
        <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.name}</p>
        <p className="mt-4 text-sm text-slate-500">E-mail</p>
        <p className="mt-1 font-semibold text-slate-900 dark:text-white break-all">
          {user.email}
        </p>
      </div>
      <LogoutButton />
    </>
  );
}
