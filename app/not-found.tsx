import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-brass">Paradise Christian School</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-navy">Page not found</h1>
      <Link href="/dashboard" className="mt-6 text-sm text-navy underline-offset-4 hover:underline">
        Return to the ledger
      </Link>
    </main>
  );
}
