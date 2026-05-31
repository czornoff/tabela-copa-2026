"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_PATH } from "@/lib/config";
import { GoogleSignIn } from "./GoogleSignIn";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/tabela";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe um e-mail válido.");
      return false;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "register" : "login";
      const res = await fetch(`${BASE_PATH}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro na autenticação.");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in duration-300">
      <div className="mb-8 text-center">
        <span className="text-5xl" role="img" aria-hidden>
          ⚽
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
          Copa 2026
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
        </p>
      </div>

      <div className="mb-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? "bg-white text-emerald-700 shadow dark:bg-slate-700 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {m === "login" ? "Entrar" : "Cadastrar"}
          </button>
        ))}
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="••••••••"
          />
        </div>
        {mode === "signup" && (
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <GoogleSignIn redirect={redirect} onError={setError} disabled={loading} />
    </div>
  );
}
