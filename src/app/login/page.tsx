import { Suspense } from "react";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <Suspense fallback={null}>
        <AuthErrorBanner />
      </Suspense>
      <Suspense fallback={<p className="text-slate-500">Carregando...</p>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
