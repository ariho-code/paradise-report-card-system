

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-vellum">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-canopy/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-brass/20 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="mb-12 max-w-md lg:mb-0">
          <img src="/logo.jpg" alt="Paradise Christian School" className="h-28 w-28 rounded-full bg-vellum object-contain p-1" />
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-vellum">
            Paradise Christian School
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.32em] text-brass-soft">Be The Light</p>
          <p className="mt-6 max-w-sm text-vellum/70">
            Official staff register for term reports. Enter marks, issue a printed academic progress report, and keep the school ledger in one place.
          </p>
        </div>

        <form action="/api/auth/login" method="post" className="w-full max-w-md rounded-3xl border border-brass/40 bg-vellum p-8 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-brass">Staff register</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-navy">Sign in</h2>
          {params.error ? (
            <p className="mt-4 border border-blush/40 bg-blush/10 px-3 py-2 text-sm text-blush">
              Those credentials were not accepted.
            </p>
          ) : null}
          <label className="mt-6 block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Username</span>
            <input
              name="username"
              autoComplete="username"
              defaultValue="admin"
              className="w-full rounded-xl border border-rule bg-parchment px-3 py-2.5"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-rule bg-parchment px-3 py-2.5"
            />
          </label>
          <button type="submit" className="mt-6 w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white">
            Open the ledger
          </button>
          <p className="mt-4 text-center text-xs text-ink/50">Default access: admin / admin123</p>
        </form>
      </div>
    </main>
  );
}
