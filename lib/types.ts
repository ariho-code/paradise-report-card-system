export type GradeBand = {
  grade: string;
  min: number | null;
  meaning: string;
};

export type Settings = {
  id: string;
  school_name: string;
  principal: string;
  motto: string;
  term_open: string;
  term_end: string;
  current_year: string;
  current_term: string;
  grade_scale: GradeBand[];
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  adviser: string;
  created_at: string;
  optional_subject_ids?: string[];
  excluded_subject_ids?: string[];
};

export type Stage = "standard" | "early_years";

export type Subject = {
  id: string;
  name: string;
  compulsory: boolean;
  sort_order: number;
  stage: Stage;
};

export type SchoolClass = {
  id: string;
  name: string;
  sort_order: number;
  level: Stage;
};

export type Assessment = {
  id: string;
  student_id: string;
  year: string;
  term: string;
  teacher_comment: string;
};

export type Mark = {
  assessment_id: string;
  subject_id: string;
  subject_name?: string;
  test: number | null;
  eot: number | null;
  grade: string;
  missed: boolean;
  comment: string;
};

export type CharacterMark = {
  assessment_id: string;
  trait: string;
  remark: string;
};

export type AreaProgress = {
  assessment_id: string;
  subject_id: string;
  subject_name?: string;
  progress: string;
  award: string;
};

export type Period = {
  year: string;
  term: string;
};

export const DEFAULT_YEAR = "2026";
export const DEFAULT_TERM = "Term 2";

export const DEFAULT_TRAITS = [
  "Leadership",
  "Innovation",
  "Godly",
  "Hardworking",
  "Truthful",
] as const;

export const LETTER_GRADES = ["A", "B", "C", "D", "E", "F", "U"] as const;

/** The three words printed on the school's Early Years key strip. */
export const AWARD_LEVELS = ["Good", "Very Good", "Impressive"] as const;

/** Seeded once for Early Years classes. Teachers edit these like any subject. */
export const DEFAULT_EARLY_YEARS_AREAS = [
  "Communication, language and literacy",
  "Mathematics",
  "Personal, social and emotional development",
  "Understanding the world",
  "Physical development",
  "Creative expression",
] as const;

export const STAGE_LABELS: Record<Stage, string> = {
  standard: "Standard · marks",
  early_years: "Early Years · comments",
};

export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { grade: "A", min: 80, meaning: "Excellent" },
  { grade: "B", min: 70, meaning: "Good" },
  { grade: "C", min: 60, meaning: "Satisfactory" },
  { grade: "D", min: 50, meaning: "Needs effort" },
  { grade: "E", min: 41, meaning: "Below average" },
  { grade: "F", min: 0, meaning: "Fail" },
  { grade: "U", min: null, meaning: "Ungraded" },
];

export const GRADE_SCALE = DEFAULT_GRADE_BANDS.map((band) => ({
  grade: band.grade,
  range: bandRange(band),
  meaning: band.meaning,
}));

export function bandRange(band: GradeBand, all: GradeBand[] = DEFAULT_GRADE_BANDS): string {
  if (band.grade === "U" || band.min === null) return "Teacher assigned";
  const higher = all
    .filter((item) => item.min !== null && (item.min as number) > (band.min as number))
    .sort((a, b) => (a.min as number) - (b.min as number))[0];
  const top = higher ? (higher.min as number) - 1 : 100;
  if (band.min === 0) return `${top} & below`;
  return `${band.min} – ${top}`;
}
