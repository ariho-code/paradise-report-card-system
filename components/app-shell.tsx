import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/students", label: "Students" },
  { href: "/classes", label: "Classes" },
  { href: "/subjects", label: "Subjects" },
  { href: "/marks", label: "Marks" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Registry" },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/students", label: "Students" },
  { href: "/classes", label: "Classes" },
  { href: "/marks", label: "Marks" },
  { href: "/reports", label: "Reports" },
];

export function AppShell({
  children,
  current,
  period,
}: {
  children: React.ReactNode;
  current: string;
  period: { year: string; term: string };
}) {
  return (
    <div className="min-h-screen bg-parchment text-ink lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print hidden border-rule bg-ink text-vellum lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-white/10">
        <div className="flex items-center gap-3 px-5 py-5">
          <img
            src="/logo.jpg"
            alt="Paradise Christian School"
            className="h-12 w-12 rounded-full bg-vellum object-contain p-0.5"
          />
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg leading-tight">Paradise</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-brass-soft">Christian School</p>
          </div>
        </div>
        <p className="px-5 pb-4 text-[11px] uppercase tracking-[0.18em] text-brass-soft/80">
          {period.term} · {period.year}
        </p>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  active
                    ? "bg-black text-white"
                    : "text-white hover:bg-black hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action="/api/auth/logout" method="post" className="px-3 pb-6">
          <button
            type="submit"
            className="w-full rounded-xl border border-white/20 px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-black hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-rule bg-vellum/95 px-4 py-3 backdrop-blur lg:static">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/logo.jpg" alt="" className="h-9 w-9 rounded-full object-contain lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy lg:hidden">Paradise</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-navy/60">
                {period.term} · {period.year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/subjects" className="rounded-xl px-2 py-2 text-sm font-semibold text-navy lg:hidden">
              Subjects
            </Link>
            <Link href="/settings" className="rounded-xl px-2 py-2 text-sm font-semibold text-navy lg:hidden">
              Registry
            </Link>
            <form action="/api/auth/logout" method="post" className="lg:hidden">
              <button type="submit" className="rounded-xl px-2 py-2 text-sm font-semibold text-navy">
                Out
              </button>
            </form>
          </div>
        </header>
        <main className="px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-rule bg-vellum/95 px-1 py-2 backdrop-blur lg:hidden">
        {MOBILE_NAV.map((item) => {
          const active = current === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-1 py-2 text-center text-[11px] font-semibold ${
                active ? "bg-black text-white" : "text-navy hover:bg-black hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
