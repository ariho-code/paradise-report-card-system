import Link from "next/link";
import { EarlyYearsReport } from "@/components/early-years-report";
import { FitReports } from "@/components/fit-reports";
import { PdfDownloadButton } from "@/components/pdf-download";
import { PrintButton } from "@/components/print-button";
import { ReportCard } from "@/components/report-card";
import { ReportCommentary, hasCommentary } from "@/components/report-commentary";
import {
  getAssessment,
  getSettings,
  listAreaProgress,
  listCharacterMarks,
  listMarks,
  listStudents,
  stageForGrade,
  subjectsForStudent,
} from "@/lib/db";
import { periodQuery, readPeriod } from "@/lib/period";

export const metadata = { title: "Class reports — Paradise Christian School" };

export default async function ClassPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; term?: string; class?: string }>;
}) {
  const query = await searchParams;
  const [settings, allStudents] = await Promise.all([getSettings(), listStudents()]);
  const period = readPeriod(query, { year: settings.current_year, term: settings.current_term });
  const q = periodQuery(period.year, period.term);
  const className = query.class || "";
  const students = className
    ? allStudents.filter((student) => student.grade === className)
    : allStudents;

  const cards = [];
  for (const student of students) {
    const assessment = await getAssessment(student.id, period.year, period.term);
    if ((await stageForGrade(student.grade)) === "early_years") {
      cards.push(
        <EarlyYearsReport
          key={student.id}
          student={student}
          settings={settings}
          year={period.year}
          term={period.term}
          areas={await subjectsForStudent(student.id)}
          progress={assessment ? await listAreaProgress(assessment.id) : []}
          teacherComment={assessment?.teacher_comment || ""}
        />,
      );
      continue;
    }
    const marks = assessment ? await listMarks(assessment.id) : [];
    const characters = assessment ? await listCharacterMarks(assessment.id) : [];
    const teacherComment = assessment?.teacher_comment || "";
    const commentary = hasCommentary(marks, characters, teacherComment);
    cards.push(
      <ReportCard
        key={student.id}
        student={student}
        settings={settings}
        year={period.year}
        term={period.term}
        marks={marks}
        hasCommentary={commentary}
      />,
    );
    if (commentary) {
      cards.push(
        <ReportCommentary
          key={`${student.id}-comments`}
          student={student}
          settings={settings}
          year={period.year}
          term={period.term}
          marks={marks}
          characters={characters}
          teacherComment={teacherComment}
        />,
      );
    }
  }

  const fileLabel = (className || "all-classes").replace(/\s+/g, "-");

  return (
    <main className="min-h-screen space-y-8 bg-[#e8edf3] px-4 py-6 print:m-0 print:space-y-0 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-5 flex w-full max-w-[210mm] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/reports?${q}`} className="text-sm font-semibold text-navy underline-offset-4 hover:underline">
          Back to reports
        </Link>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PrintButton label={`Print ${students.length}`} />
          <PdfDownloadButton
            label={`Save ${students.length} as PDF`}
            filename={`${fileLabel}-${period.term}-${period.year}.pdf`}
          />
        </div>
      </div>
      {students.length === 0 ? (
        <p className="no-print text-center text-sm text-ink/60">No students in this class.</p>
      ) : (
        cards
      )}
      <FitReports />
    </main>
  );
}
