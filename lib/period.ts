import { DEFAULT_TERM, DEFAULT_YEAR } from "./types";

export function readPeriod(
  searchParams: { year?: string; term?: string },
  fallback?: { year: string; term: string },
) {
  return {
    year: searchParams.year || fallback?.year || DEFAULT_YEAR,
    term: searchParams.term || fallback?.term || DEFAULT_TERM,
  };
}

export function periodQuery(year: string, term: string) {
  return `year=${encodeURIComponent(year)}&term=${encodeURIComponent(term)}`;
}
