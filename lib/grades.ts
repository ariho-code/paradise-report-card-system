import { GRADE_SCALE } from "./types";

/** Suggest a letter grade from a single mark. Never averages two papers. */
export function suggestGrade(mark: number | null | undefined): string {
  if (mark === null || mark === undefined || Number.isNaN(Number(mark))) return "U";
  const n = Number(mark);
  if (n >= 80) return "A";
  if (n >= 70) return "B";
  if (n >= 60) return "C";
  if (n >= 50) return "D";
  if (n >= 41) return "E";
  return "F";
}

/** Prefer End of Term. Fall back to the test paper if EOT is empty. */
export function suggestedGradeFromPapers(
  test: number | null | undefined,
  eot: number | null | undefined,
  missed?: boolean,
): string {
  if (missed) return "U";
  if (eot !== null && eot !== undefined && !Number.isNaN(Number(eot))) {
    return suggestGrade(Number(eot));
  }
  if (test !== null && test !== undefined && !Number.isNaN(Number(test))) {
    return suggestGrade(Number(test));
  }
  return "U";
}

export function gradeComment(grade: string): string {
  const map: Record<string, string> = {
    A: "Excellent work",
    B: "Good progress",
    C: "Keep it up",
    D: "Needs more effort",
    E: "More effort needed",
    F: "Needs significant improvement",
    U: "Not assessed",
  };
  return map[grade] || "";
}

export function gradeMeaning(grade: string): string {
  return GRADE_SCALE.find((row) => row.grade === grade)?.meaning ?? "";
}

export function parseMark(value: FormDataEntryValue | null): number | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === "") return null;
  const n = Number(text);
  if (Number.isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}
