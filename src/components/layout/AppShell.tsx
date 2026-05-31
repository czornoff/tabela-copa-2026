import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-16">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
