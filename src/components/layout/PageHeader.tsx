export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}
