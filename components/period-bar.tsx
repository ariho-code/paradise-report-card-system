"use client";

import { useRouter } from "next/navigation";

export function PeriodBar({
  year,
  term,
  years,
  terms,
  basePath,
}: {
  year: string;
  term: string;
  years: string[];
  terms: string[];
  basePath: string;
}) {
  const router = useRouter();

  function go(nextYear: string, nextTerm: string) {
    router.push(`${basePath}?year=${encodeURIComponent(nextYear)}&term=${encodeURIComponent(nextTerm)}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-rule bg-vellum px-4 py-3">
      <span className="pb-2 text-[11px] uppercase tracking-[0.18em] text-navy/60">Period</span>
      <label className="min-w-28 flex-1 text-sm">
        <span className="sr-only">Year</span>
        <select
          className="w-full rounded-xl border border-rule bg-parchment px-3 py-2.5"
          value={year}
          onChange={(e) => go(e.target.value, term)}
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-28 flex-1 text-sm">
        <span className="sr-only">Term</span>
        <select
          className="w-full rounded-xl border border-rule bg-parchment px-3 py-2.5"
          value={term}
          onChange={(e) => go(year, e.target.value)}
        >
          {terms.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
