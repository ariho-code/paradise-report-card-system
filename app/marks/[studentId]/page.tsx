import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MarksForm } from "@/components/marks-form";
import { PageHeader } from "@/components/page-header";
import {
  getAssessment,
  getSettings,
  getStudent,
  listCharacterMarks,
  listMarks,
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

  const period = readPeriod(query, settings);
  const subjects = await subjectsForStudent(student.id);
  const assessment = await getAssessment(student.id, period.year, period.term);
  const marks = assessment ? await listMarks(assessment.id) : [];
  const characters = assessment ? await listCharacterMarks(assessment.id) : [];
  const q = periodQuery(period.year, period.term);

  return (
    <AppShell current="/marks" period={settings}>
      <PageHeader
        kicker={`${period.term} · ${period.year}`}
        title={student.name}
        lede="Type test and End of Term marks. The letter grade is yours to keep or change."
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
      <MarksForm
        studentId={student.id}
        studentName={student.name}
        studentClass={[student.grade, student.section].filter(Boolean).join(" · ")}
        year={period.year}
        term={period.term}
        subjects={subjects}
        marks={marks}
        characters={characters}
        teacherComment={assessment?.teacher_comment || ""}
      />
    </AppShell>
  );
}
