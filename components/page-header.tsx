export function PageHeader({
  kicker,
  title,
  lede,
  action,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-rule pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker ? (
          <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-brass">{kicker}</p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-navy sm:text-4xl">{title}</h1>
        {lede ? <p className="mt-2 max-w-xl text-sm text-ink/70">{lede}</p> : null}
      </div>
      {action}
    </div>
  );
}
