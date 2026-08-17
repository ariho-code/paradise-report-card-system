import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EarlyYearsForm } from "@/components/early-years-form";
import { MarksForm } from "@/components/marks-form";
import { PageHeader } from "@/components/page-header";
import {
  getAssessment,
  getSettings,
  getStudent,
  listAreaProgress,
  listCharacterMarks,
  listMarks,
  stageForGrade,
  subjectsForStudent,
} from "@/lib/db";
import { periodQuery, readPeriod } from "@/lib/period";

export default async function StudentMarksPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ year?: string; term?: string }>;
}) {
  const { studentId } = await params;
  const query = await searchParams;
  const [settings, student] = await Promise.all([getSettings(), getStudent(studentId)]);
  if (!student) notFound();

  const period = readPeriod(query, { year: settings.current_year, term: settings.current_term });
  const stage = await stageForGrade(student.grade);
  const subjects = await subjectsForStudent(student.id);
  const assessment = await getAssessment(student.id, period.year, period.term);
  const earlyYears = stage === "early_years";
  const marks = assessment && !earlyYears ? await listMarks(assessment.id) : [];
  const characters = assessment && !earlyYears ? await listCharacterMarks(assessment.id) : [];
  const progress = assessment && earlyYears ? await listAreaProgress(assessment.id) : [];
  const q = periodQuery(period.year, period.term);
  const studentClass = [student.grade, student.section].filter(Boolean).join(" · ");

  return (
    <AppShell current="/marks" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker={`${period.term} · ${period.year}`}
        title={student.name}
        lede={
          earlyYears
            ? "Write how this child is progressing in each area, then choose an award."
            : "Type test and End of Term marks. The letter grade is yours to keep or change."
        }
        action={
          <div className="flex gap-4 text-sm">
            <Link href={`/marks?${q}`} className="underline-offset-4 hover:underline">
              All marks
            </Link>
            <Link href={`/reports/print/${student.id}?${q}`} className="underline-offset-4 hover:underline">
              Open report
            </Link>
          </div>
        }
      />
      {earlyYears ? (
        <EarlyYearsForm
          studentId={student.id}
          studentName={student.name}
          studentClass={studentClass}
          year={period.year}
          term={period.term}
          areas={subjects}
          progress={progress}
          teacherComment={assessment?.teacher_comment || ""}
        />
      ) : (
        <MarksForm
          studentId={student.id}
          studentName={student.name}
          studentClass={studentClass}
          year={period.year}
          term={period.term}
          subjects={subjects}
          marks={marks}
          characters={characters}
          teacherComment={assessment?.teacher_comment || ""}
        />
      )}
    </AppShell>
  );
}
