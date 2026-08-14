export type Settings = {
  id: string;
  school_name: string;
  principal: string;
  motto: string;
  term_open: string;
  term_end: string;
  current_year: string;
  current_term: string;
};

export type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  adviser: string;
  created_at: string;
  optional_subject_ids?: string[];
};

export type Subject = {
  id: string;
  name: string;
  compulsory: boolean;
  sort_order: number;
};

export type SchoolClass = {
  id: string;
  name: string;
  sort_order: number;
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

export const GRADE_SCALE = [
  { grade: "A", range: "80 – 100", meaning: "Excellent" },
  { grade: "B", range: "70 – 79", meaning: "Good" },
  { grade: "C", range: "60 – 69", meaning: "Satisfactory" },
  { grade: "D", range: "50 – 59", meaning: "Needs effort" },
  { grade: "E", range: "41 – 49", meaning: "Below average" },
  { grade: "F", range: "40 & below", meaning: "Fail" },
  { grade: "U", range: "—", meaning: "Not assessed" },
] as const;
