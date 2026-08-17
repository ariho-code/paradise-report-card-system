import postgres from "postgres";
import bcrypt from "bcryptjs";
import {
  DEFAULT_EARLY_YEARS_AREAS,
  DEFAULT_TERM,
  DEFAULT_TRAITS,
  DEFAULT_YEAR,
  type AreaProgress,
  type Assessment,
  type CharacterMark,
  type Mark,
  type SchoolClass,
  type Settings,
  type Stage,
  type Student,
  type Subject,
} from "./types";

function createClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set. Add your Neon or local Postgres URL.");
  }
  const parsed = new URL(raw);
  parsed.searchParams.delete("channel_binding");
  const url = parsed.toString();
  const neon = url.includes("neon.tech") || url.includes("sslmode=require");
  return postgres(url, {
    ssl: neon ? "require" : false,
    max: process.env.VERCEL ? 1 : 8,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 20,
    onnotice: () => undefined,
  });
}

const globalForSql = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql = globalForSql.sql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForSql.sql = sql;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) schemaReady = applySchema();
  return schemaReady;
}

async function applySchema() {
  const present = await sql<{ name: string | null }[]>`
    SELECT to_regclass('public.settings')::text AS name
  `;
  if (present[0]?.name) {
    const existing = await sql`SELECT id FROM settings WHERE id = 'school'`;
    if (existing.length === 0) await seedDefaults();
    await ensureClassesTable();
    await ensureUpgrades();
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'school',
      school_name TEXT NOT NULL,
      principal TEXT NOT NULL,
      motto TEXT NOT NULL,
      term_open TEXT NOT NULL,
      term_end TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      current_year TEXT NOT NULL DEFAULT '2026',
      current_term TEXT NOT NULL DEFAULT 'Term 2'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS terms (
      name TEXT PRIMARY KEY,
      sort_order INT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS years (
      name TEXT PRIMARY KEY
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT '',
      adviser TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      compulsory BOOLEAN NOT NULL DEFAULT true,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS student_optionals (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      PRIMARY KEY (student_id, subject_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      year TEXT NOT NULL,
      term TEXT NOT NULL,
      teacher_comment TEXT NOT NULL DEFAULT '',
      UNIQUE (student_id, year, term)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS character_marks (
      assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      trait TEXT NOT NULL,
      remark TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (assessment_id, trait)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS marks (
      assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      test NUMERIC(5,1),
      eot NUMERIC(5,1),
      grade TEXT NOT NULL DEFAULT 'U',
      missed BOOLEAN NOT NULL DEFAULT false,
      comment TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (assessment_id, subject_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;

  const existing = await sql`SELECT id FROM settings WHERE id = 'school'`;
  if (existing.length === 0) {
    await seedDefaults();
  }
  await ensureClassesTable();
  await ensureUpgrades();
}

/**
 * Additive migrations for databases created before Early Years support.
 * applySchema returns early when `settings` already exists, so this runs on
 * both branches — anything left in applySchema's tail never reaches a live DB.
 */
async function ensureUpgrades() {
  await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'standard'`;
  await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'standard'`;

  // Subject names were globally unique, which would stop Early Years from
  // tracking "Mathematics" while a Grade class already has the subject.
  // Names only need to be unique within their own stage.
  await sql`ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS subjects_name_stage_key ON subjects (name, stage)`;

  await sql`
    CREATE TABLE IF NOT EXISTS student_exclusions (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      PRIMARY KEY (student_id, subject_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS area_progress (
      assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      progress TEXT NOT NULL DEFAULT '',
      award TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (assessment_id, subject_id)
    )
  `;

  await seedEarlyYearsAreas();
}

async function seedEarlyYearsAreas() {
  const count = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM subjects WHERE stage = 'early_years'
  `;
  if ((count[0]?.n ?? 0) > 0) return;

  const rows = await sql<{ max: number }[]>`SELECT COALESCE(MAX(sort_order), 0) AS max FROM subjects`;
  let sort = rows[0].max + 1;
  for (const name of DEFAULT_EARLY_YEARS_AREAS) {
    await sql`
      INSERT INTO subjects (id, name, compulsory, sort_order, stage)
      VALUES (${crypto.randomUUID()}, ${name}, true, ${sort}, 'early_years')
      ON CONFLICT (name, stage) DO NOTHING
    `;
    sort += 1;
  }
}

async function ensureClassesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;
  const count = await sql<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM classes`;
  if ((count[0]?.n ?? 0) > 0) return;

  const defaults = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
  ];
  for (let i = 0; i < defaults.length; i += 1) {
    await sql`
      INSERT INTO classes (id, name, sort_order)
      VALUES (${`cls_${i + 1}`}, ${defaults[i]}, ${i + 1})
      ON CONFLICT (name) DO NOTHING
    `;
  }
  const extras = await sql<{ grade: string }[]>`
    SELECT DISTINCT grade FROM students WHERE grade <> ''
  `;
  let sort = defaults.length + 1;
  for (const row of extras) {
    await sql`
      INSERT INTO classes (id, name, sort_order)
      VALUES (${crypto.randomUUID()}, ${row.grade}, ${sort})
      ON CONFLICT (name) DO NOTHING
    `;
    sort += 1;
  }
}

async function seedDefaults() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await sql`
    INSERT INTO settings (
      id, school_name, principal, motto, term_open, term_end,
      password_hash, current_year, current_term
    ) VALUES (
      'school',
      'Paradise Christian School',
      'Sebagala Methuselah',
      'Be The Light',
      '12th May, 2026',
      '7th August, 2026',
      ${passwordHash},
      ${DEFAULT_YEAR},
      ${DEFAULT_TERM}
    )
  `;

  await sql`
    INSERT INTO terms (name, sort_order) VALUES
      ('Term 1', 1),
      ('Term 2', 2),
      ('Term 3', 3)
    ON CONFLICT DO NOTHING
  `;

  await sql`
    INSERT INTO years (name) VALUES ('2025'), ('2026'), ('2027')
    ON CONFLICT DO NOTHING
  `;

  const subjects: Array<[string, string, boolean, number]> = [
    ["sub_eng", "English", true, 1],
    ["sub_math", "Mathematics", true, 2],
    ["sub_bio", "Biology", true, 3],
    ["sub_phy", "Physics", true, 4],
    ["sub_che", "Chemistry", true, 5],
    ["sub_geo", "Geography", true, 6],
    ["sub_his", "History", true, 7],
    ["sub_gp", "Global Perspectives", true, 8],
    ["sub_kis", "Kiswahili", true, 9],
    ["sub_mus", "Music", false, 10],
    ["sub_art", "ART", false, 11],
    ["sub_cod", "Coding", false, 12],
    ["sub_ict", "ICT", false, 13],
  ];

  for (const [id, name, compulsory, sort] of subjects) {
    await sql`
      INSERT INTO subjects (id, name, compulsory, sort_order)
      VALUES (${id}, ${name}, ${compulsory}, ${sort})
      ON CONFLICT (name) DO NOTHING
    `;
  }

  const studentId = "stu_amani";
  await sql`
    INSERT INTO students (id, name, grade, section, adviser)
    VALUES (${studentId}, 'Amani Mary Baraka', 'Grade 7', '', 'Mrs. Nakato')
    ON CONFLICT DO NOTHING
  `;

  await sql`
    INSERT INTO student_optionals (student_id, subject_id)
    VALUES (${studentId}, 'sub_art')
    ON CONFLICT DO NOTHING
  `;

  const assessmentId = "asm_amani_2026_t2";
  await sql`
    INSERT INTO assessments (id, student_id, year, term, teacher_comment)
    VALUES (
      ${assessmentId},
      ${studentId},
      ${DEFAULT_YEAR},
      ${DEFAULT_TERM},
      'Good results. You are capable of performing better than this current level. Put more attention and zeal in order to achieve your top most grades.'
    )
    ON CONFLICT DO NOTHING
  `;

  const seedMarks: Array<[string, number, number, string]> = [
    ["sub_eng", 77, 81, "A"],
    ["sub_math", 59, 42, "E"],
    ["sub_bio", 78, 72, "B"],
    ["sub_phy", 67, 54, "D"],
    ["sub_che", 74, 72, "B"],
    ["sub_geo", 80, 80, "A"],
    ["sub_his", 70, 71, "B"],
    ["sub_gp", 68, 52, "D"],
    ["sub_kis", 67, 85, "A"],
    ["sub_art", 85, 82, "A"],
  ];

  for (const [subjectId, test, eot, grade] of seedMarks) {
    await sql`
      INSERT INTO marks (assessment_id, subject_id, test, eot, grade, missed, comment)
      VALUES (${assessmentId}, ${subjectId}, ${test}, ${eot}, ${grade}, false, '')
      ON CONFLICT DO NOTHING
    `;
  }

  const traits: Array<[string, string]> = [
    ["Leadership", "Needs growth"],
    ["Innovation", "Is innovative in dance"],
    ["Godly", "Evident godliness"],
    ["Hardworking", "Can do better"],
    ["Truthful", "Evident fruit of truthfulness"],
  ];

  for (const [trait, remark] of traits) {
    await sql`
      INSERT INTO character_marks (assessment_id, trait, remark)
      VALUES (${assessmentId}, ${trait}, ${remark})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function getSettings(): Promise<Settings> {
  await ensureSchema();
  const rows = await sql<Settings[]>`
    SELECT id, school_name, principal, motto, term_open, term_end, current_year, current_term
    FROM settings WHERE id = 'school'
  `;
  return rows[0];
}

export async function getPasswordHash(): Promise<string> {
  await ensureSchema();
  const rows = await sql<{ password_hash: string }[]>`
    SELECT password_hash FROM settings WHERE id = 'school'
  `;
  return rows[0].password_hash;
}

export async function updateSettings(input: {
  school_name: string;
  principal: string;
  motto: string;
  term_open: string;
  term_end: string;
  current_year: string;
  current_term: string;
}) {
  await ensureSchema();
  await sql`
    UPDATE settings SET
      school_name = ${input.school_name},
      principal = ${input.principal},
      motto = ${input.motto},
      term_open = ${input.term_open},
      term_end = ${input.term_end},
      current_year = ${input.current_year},
      current_term = ${input.current_term}
    WHERE id = 'school'
  `;
}

export async function updatePassword(hash: string) {
  await ensureSchema();
  await sql`UPDATE settings SET password_hash = ${hash} WHERE id = 'school'`;
}

export async function listTerms(): Promise<string[]> {
  await ensureSchema();
  const rows = await sql<{ name: string }[]>`SELECT name FROM terms ORDER BY sort_order, name`;
  return rows.map((r) => r.name);
}

export async function listYears(): Promise<string[]> {
  await ensureSchema();
  const rows = await sql<{ name: string }[]>`SELECT name FROM years ORDER BY name`;
  return rows.map((r) => r.name);
}

export async function addTerm(name: string) {
  await ensureSchema();
  const rows = await sql<{ max: number }[]>`SELECT COALESCE(MAX(sort_order), 0) AS max FROM terms`;
  await sql`INSERT INTO terms (name, sort_order) VALUES (${name}, ${rows[0].max + 1}) ON CONFLICT DO NOTHING`;
}

export async function removeTerm(name: string) {
  await ensureSchema();
  await sql`DELETE FROM terms WHERE name = ${name}`;
}

export async function addYear(name: string) {
  await ensureSchema();
  await sql`INSERT INTO years (name) VALUES (${name}) ON CONFLICT DO NOTHING`;
}

export async function removeYear(name: string) {
  await ensureSchema();
  await sql`DELETE FROM years WHERE name = ${name}`;
}

export async function listClasses(): Promise<SchoolClass[]> {
  await ensureSchema();
  return sql<SchoolClass[]>`
    SELECT id, name, sort_order, level FROM classes ORDER BY sort_order, name
  `;
}

export async function getClass(id: string) {
  await ensureSchema();
  const rows = await sql<SchoolClass[]>`
    SELECT id, name, sort_order, level FROM classes WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function createClass(name: string, level: Stage = "standard") {
  await ensureSchema();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Class name is required.");
  const rows = await sql<{ max: number }[]>`SELECT COALESCE(MAX(sort_order), 0) AS max FROM classes`;
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO classes (id, name, sort_order, level)
    VALUES (${id}, ${trimmed}, ${rows[0].max + 1}, ${level})
  `;
  return id;
}

export async function updateClass(id: string, name: string, level: Stage = "standard") {
  await ensureSchema();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Class name is required.");
  const current = await getClass(id);
  if (!current) throw new Error("Class not found.");
  await sql`UPDATE classes SET name = ${trimmed}, level = ${level} WHERE id = ${id}`;
  if (current.name !== trimmed) {
    await sql`UPDATE students SET grade = ${trimmed} WHERE grade = ${current.name}`;
  }
}

/**
 * Report type follows the class, matched by name since students store the class
 * name rather than an id. An unmatched name falls back to standard so a learner
 * is never stranded without subjects.
 */
export async function stageForGrade(grade: string): Promise<Stage> {
  await ensureSchema();
  if (!grade) return "standard";
  const rows = await sql<{ level: Stage }[]>`
    SELECT level FROM classes WHERE name = ${grade}
  `;
  return rows[0]?.level === "early_years" ? "early_years" : "standard";
}

export async function deleteClass(id: string) {
  await ensureSchema();
  const current = await getClass(id);
  if (!current) return;
  const used = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM students WHERE grade = ${current.name}
  `;
  if ((used[0]?.n ?? 0) > 0) {
    throw new Error("Remove or move students in this class first.");
  }
  await sql`DELETE FROM classes WHERE id = ${id}`;
}

export async function listStudents(): Promise<Student[]> {
  await ensureSchema();
  const students = await sql<Student[]>`
    SELECT id, name, grade, section, adviser, created_at::text
    FROM students
    ORDER BY name
  `;
  const optionals = await sql<{ student_id: string; subject_id: string }[]>`
    SELECT student_id, subject_id FROM student_optionals
  `;
  const exclusions = await sql<{ student_id: string; subject_id: string }[]>`
    SELECT student_id, subject_id FROM student_exclusions
  `;
  const group = (rows: { student_id: string; subject_id: string }[]) => {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.student_id) ?? [];
      list.push(row.subject_id);
      map.set(row.student_id, list);
    }
    return map;
  };
  const extras = group(optionals);
  const removed = group(exclusions);
  return students.map((student) => ({
    ...student,
    optional_subject_ids: extras.get(student.id) ?? [],
    excluded_subject_ids: removed.get(student.id) ?? [],
  }));
}

export async function getStudent(id: string): Promise<Student | null> {
  await ensureSchema();
  const rows = await sql<Student[]>`
    SELECT id, name, grade, section, adviser, created_at::text
    FROM students WHERE id = ${id}
  `;
  if (!rows[0]) return null;
  const optionals = await sql<{ subject_id: string }[]>`
    SELECT subject_id FROM student_optionals WHERE student_id = ${id}
  `;
  const exclusions = await sql<{ subject_id: string }[]>`
    SELECT subject_id FROM student_exclusions WHERE student_id = ${id}
  `;
  return {
    ...rows[0],
    optional_subject_ids: optionals.map((o) => o.subject_id),
    excluded_subject_ids: exclusions.map((o) => o.subject_id),
  };
}

type StudentInput = {
  name: string;
  grade: string;
  section: string;
  adviser: string;
  optional_subject_ids: string[];
  excluded_subject_ids: string[];
};

async function writeStudentSubjects(id: string, input: StudentInput) {
  await sql`DELETE FROM student_optionals WHERE student_id = ${id}`;
  for (const subjectId of input.optional_subject_ids) {
    await sql`
      INSERT INTO student_optionals (student_id, subject_id)
      VALUES (${id}, ${subjectId})
      ON CONFLICT DO NOTHING
    `;
  }
  await sql`DELETE FROM student_exclusions WHERE student_id = ${id}`;
  for (const subjectId of input.excluded_subject_ids) {
    await sql`
      INSERT INTO student_exclusions (student_id, subject_id)
      VALUES (${id}, ${subjectId})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function createStudent(input: StudentInput) {
  await ensureSchema();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO students (id, name, grade, section, adviser)
    VALUES (${id}, ${input.name}, ${input.grade}, ${input.section}, ${input.adviser})
  `;
  await writeStudentSubjects(id, input);
  return id;
}

export async function updateStudent(id: string, input: StudentInput) {
  await ensureSchema();
  await sql`
    UPDATE students
    SET name = ${input.name}, grade = ${input.grade},
        section = ${input.section}, adviser = ${input.adviser}
    WHERE id = ${id}
  `;
  await writeStudentSubjects(id, input);
}

export async function deleteStudent(id: string) {
  await ensureSchema();
  await sql`DELETE FROM students WHERE id = ${id}`;
}

export async function listSubjects(): Promise<Subject[]> {
  await ensureSchema();
  return sql<Subject[]>`
    SELECT id, name, compulsory, sort_order, stage
    FROM subjects
    ORDER BY sort_order, name
  `;
}

export async function getSubject(id: string): Promise<Subject | null> {
  await ensureSchema();
  const rows = await sql<Subject[]>`
    SELECT id, name, compulsory, sort_order, stage FROM subjects WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function createSubject(input: { name: string; compulsory: boolean; stage: Stage }) {
  await ensureSchema();
  const rows = await sql<{ max: number }[]>`SELECT COALESCE(MAX(sort_order), 0) AS max FROM subjects`;
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO subjects (id, name, compulsory, sort_order, stage)
    VALUES (${id}, ${input.name}, ${input.compulsory}, ${rows[0].max + 1}, ${input.stage})
  `;
  return id;
}

export async function updateSubject(
  id: string,
  input: { name: string; compulsory: boolean; stage: Stage },
) {
  await ensureSchema();
  await sql`
    UPDATE subjects
    SET name = ${input.name}, compulsory = ${input.compulsory}, stage = ${input.stage}
    WHERE id = ${id}
  `;
}

export async function deleteSubject(id: string) {
  await ensureSchema();
  await sql`DELETE FROM subjects WHERE id = ${id}`;
}

/**
 * The one place a learner's list is resolved. Filters to the stage of the class
 * the learner sits in, then drops anything the teacher marked as not taken.
 */
export async function subjectsForStudent(studentId: string, stage: Stage): Promise<Subject[]> {
  await ensureSchema();
  return sql<Subject[]>`
    SELECT s.id, s.name, s.compulsory, s.sort_order, s.stage
    FROM subjects s
    WHERE s.stage = ${stage}
      AND (
        s.compulsory = true
        OR s.id IN (
          SELECT subject_id FROM student_optionals WHERE student_id = ${studentId}
        )
      )
      AND s.id NOT IN (
        SELECT subject_id FROM student_exclusions WHERE student_id = ${studentId}
      )
    ORDER BY s.sort_order, s.name
  `;
}

export async function getOrCreateAssessment(studentId: string, year: string, term: string) {
  await ensureSchema();
  const existing = await sql<Assessment[]>`
    SELECT id, student_id, year, term, teacher_comment
    FROM assessments
    WHERE student_id = ${studentId} AND year = ${year} AND term = ${term}
  `;
  if (existing[0]) return existing[0];

  const id = crypto.randomUUID();
  await sql`
    INSERT INTO assessments (id, student_id, year, term, teacher_comment)
    VALUES (${id}, ${studentId}, ${year}, ${term}, '')
  `;

  for (const trait of DEFAULT_TRAITS) {
    await sql`
      INSERT INTO character_marks (assessment_id, trait, remark)
      VALUES (${id}, ${trait}, '')
      ON CONFLICT DO NOTHING
    `;
  }

  return {
    id,
    student_id: studentId,
    year,
    term,
    teacher_comment: "",
  } satisfies Assessment;
}

export async function getAssessment(studentId: string, year: string, term: string) {
  await ensureSchema();
  const rows = await sql<Assessment[]>`
    SELECT id, student_id, year, term, teacher_comment
    FROM assessments
    WHERE student_id = ${studentId} AND year = ${year} AND term = ${term}
  `;
  return rows[0] ?? null;
}

export async function listMarks(assessmentId: string): Promise<Mark[]> {
  await ensureSchema();
  // Subjects the teacher has since removed from this learner drop off the
  // report without their saved marks being destroyed — restore the subject and
  // the marks come back.
  return sql<Mark[]>`
    SELECT m.assessment_id, m.subject_id, s.name AS subject_name,
           m.test::float8 AS test, m.eot::float8 AS eot,
           m.grade, m.missed, m.comment
    FROM marks m
    JOIN subjects s ON s.id = m.subject_id
    JOIN assessments a ON a.id = m.assessment_id
    WHERE m.assessment_id = ${assessmentId}
      AND s.id NOT IN (
        SELECT subject_id FROM student_exclusions WHERE student_id = a.student_id
      )
    ORDER BY s.sort_order, s.name
  `;
}

export async function listAreaProgress(assessmentId: string): Promise<AreaProgress[]> {
  await ensureSchema();
  return sql<AreaProgress[]>`
    SELECT p.assessment_id, p.subject_id, s.name AS subject_name, p.progress, p.award
    FROM area_progress p
    JOIN subjects s ON s.id = p.subject_id
    JOIN assessments a ON a.id = p.assessment_id
    WHERE p.assessment_id = ${assessmentId}
      AND s.id NOT IN (
        SELECT subject_id FROM student_exclusions WHERE student_id = a.student_id
      )
    ORDER BY s.sort_order, s.name
  `;
}

export async function listCharacterMarks(assessmentId: string): Promise<CharacterMark[]> {
  await ensureSchema();
  const rows = await sql<CharacterMark[]>`
    SELECT assessment_id, trait, remark
    FROM character_marks
    WHERE assessment_id = ${assessmentId}
  `;
  const map = new Map(rows.map((r) => [r.trait, r]));
  return DEFAULT_TRAITS.map((trait) => map.get(trait) ?? { assessment_id: assessmentId, trait, remark: "" });
}

export async function saveAssessmentBundle(input: {
  assessmentId: string;
  teacherComment: string;
  marks: Array<{
    subjectId: string;
    test: number | null;
    eot: number | null;
    grade: string;
    missed: boolean;
    comment: string;
  }>;
  characters: Array<{ trait: string; remark: string }>;
}) {
  await ensureSchema();
  await sql`
    UPDATE assessments SET teacher_comment = ${input.teacherComment}
    WHERE id = ${input.assessmentId}
  `;

  for (const mark of input.marks) {
    if (mark.missed) {
      await sql`
        INSERT INTO marks (assessment_id, subject_id, test, eot, grade, missed, comment)
        VALUES (${input.assessmentId}, ${mark.subjectId}, NULL, NULL, 'U', true, ${mark.comment})
        ON CONFLICT (assessment_id, subject_id)
        DO UPDATE SET test = NULL, eot = NULL, grade = 'U', missed = true, comment = EXCLUDED.comment
      `;
      continue;
    }

    const empty = mark.test === null && mark.eot === null && (!mark.grade || mark.grade === "U");
    if (empty && !mark.comment) {
      await sql`
        DELETE FROM marks
        WHERE assessment_id = ${input.assessmentId} AND subject_id = ${mark.subjectId}
      `;
      continue;
    }

    await sql`
      INSERT INTO marks (assessment_id, subject_id, test, eot, grade, missed, comment)
      VALUES (
        ${input.assessmentId}, ${mark.subjectId}, ${mark.test}, ${mark.eot},
        ${mark.grade || "U"}, false, ${mark.comment}
      )
      ON CONFLICT (assessment_id, subject_id)
      DO UPDATE SET
        test = EXCLUDED.test,
        eot = EXCLUDED.eot,
        grade = EXCLUDED.grade,
        missed = false,
        comment = EXCLUDED.comment
    `;
  }

  for (const row of input.characters) {
    await sql`
      INSERT INTO character_marks (assessment_id, trait, remark)
      VALUES (${input.assessmentId}, ${row.trait}, ${row.remark})
      ON CONFLICT (assessment_id, trait)
      DO UPDATE SET remark = EXCLUDED.remark
    `;
  }
}

export async function saveEarlyYearsBundle(input: {
  assessmentId: string;
  teacherComment: string;
  areas: Array<{ subjectId: string; progress: string; award: string }>;
}) {
  await ensureSchema();
  await sql`
    UPDATE assessments SET teacher_comment = ${input.teacherComment}
    WHERE id = ${input.assessmentId}
  `;

  for (const area of input.areas) {
    const progress = area.progress.trim();
    const award = area.award.trim();
    if (!progress && !award) {
      await sql`
        DELETE FROM area_progress
        WHERE assessment_id = ${input.assessmentId} AND subject_id = ${area.subjectId}
      `;
      continue;
    }
    await sql`
      INSERT INTO area_progress (assessment_id, subject_id, progress, award)
      VALUES (${input.assessmentId}, ${area.subjectId}, ${progress}, ${award})
      ON CONFLICT (assessment_id, subject_id)
      DO UPDATE SET progress = EXCLUDED.progress, award = EXCLUDED.award
    `;
  }
}

export async function countReportsReady(year: string, term: string) {
  await ensureSchema();
  const rows = await sql<{ n: number }[]>`
    SELECT COUNT(DISTINCT a.student_id)::int AS n
    FROM assessments a
    WHERE a.year = ${year} AND a.term = ${term}
      AND (
        EXISTS (SELECT 1 FROM marks m WHERE m.assessment_id = a.id)
        OR EXISTS (SELECT 1 FROM area_progress p WHERE p.assessment_id = a.id)
      )
  `;
  return rows[0]?.n ?? 0;
}
