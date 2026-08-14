import { DEFAULT_GRADE_BANDS, bandRange, type GradeBand } from "./types";

export function normalizeScale(scale?: GradeBand[] | null): GradeBand[] {
  if (!scale || scale.length === 0) return DEFAULT_GRADE_BANDS;
  const letters = ["A", "B", "C", "D", "E", "F", "U"];
  return letters.map((grade) => {
    const found = scale.find((row) => row.grade === grade);
    const fallback = DEFAULT_GRADE_BANDS.find((row) => row.grade === grade)!;
    return {
      grade,
      min: found?.min === undefined ? fallback.min : found.min,
      meaning: found?.meaning?.trim() || fallback.meaning,
    };
  });
}

export function suggestGrade(mark: number | null | undefined, scale?: GradeBand[]): string {
  if (mark === null || mark === undefined || Number.isNaN(Number(mark))) return "U";
  const n = Number(mark);
  const bands = normalizeScale(scale)
    .filter((band) => band.grade !== "U" && band.min !== null)
    .sort((a, b) => (b.min as number) - (a.min as number));
  for (const band of bands) {
    if (n >= (band.min as number)) return band.grade;
  }
  return "F";
}

export function suggestedGradeFromPapers(
  test: number | null | undefined,
  eot: number | null | undefined,
  missed?: boolean,
  scale?: GradeBand[],
): string {
  if (missed) return "U";
  
  const testNum = test !== null && test !== undefined && !Number.isNaN(Number(test)) ? Number(test) : null;
  const eotNum = eot !== null && eot !== undefined && !Number.isNaN(Number(eot)) ? Number(eot) : null;
  
  if (testNum !== null && eotNum !== null) {
    const average = (testNum + eotNum) / 2;
    return suggestGrade(average, scale);
  }
  if (eotNum !== null) {
    return suggestGrade(eotNum, scale);
  }
  if (testNum !== null) {
    return suggestGrade(testNum, scale);
  }
  return "U";
}

export function gradeComment(grade: string, scale?: GradeBand[]): string {
  const meaning = normalizeScale(scale).find((row) => row.grade === grade)?.meaning;
  return meaning || "";
}

export function parseMark(value: FormDataEntryValue | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function scaleForDisplay(scale?: GradeBand[]) {
  const bands = normalizeScale(scale);
  return bands.map((band) => ({
    grade: band.grade,
    range: bandRange(band, bands),
    meaning: band.meaning,
  }));
}
