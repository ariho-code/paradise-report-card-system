import Link from "next/link";
import { notFound } from "next/navigation";
import { EarlyYearsReport } from "@/components/early-years-report";
import { PdfDownloadButton } from "@/components/pdf-download";
import { PrintButton } from "@/components/print-button";
import { ReportCard } from "@/components/report-card";
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

export const metadata = { title: "Report card — Paradise Christian School" };

export default async function PrintReportPage({
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
  const assessment = await getAssessment(student.id, period.year, period.term);
  const earlyYears = (await stageForGrade(student.grade)) === "early_years";
  const marks = assessment && !earlyYears ? await listMarks(assessment.id) : [];
  const characters = assessment && !earlyYears ? await listCharacterMarks(assessment.id) : [];
  const areas = earlyYears ? await subjectsForStudent(student.id, "early_years") : [];
  const progress = assessment && earlyYears ? await listAreaProgress(assessment.id) : [];
  const q = periodQuery(period.year, period.term);

  return (
    <main className="min-h-screen bg-[#e8edf3] px-4 py-6 print:m-0 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-5 flex w-full max-w-[210mm] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-navy">
          <Link href={`/reports?${q}`} className="underline-offset-4 hover:underline">
            Back
          </Link>
          <Link href={`/marks/${student.id}?${q}`} className="underline-offset-4 hover:underline">
            Edit marks
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PrintButton />
          <PdfDownloadButton filename={`${student.name.replace(/\s+/g, "-")}-${period.term}-${period.year}.pdf`} />
        </div>
      </div>
      {earlyYears ? (
        <EarlyYearsReport
          student={student}
          settings={settings}
          year={period.year}
          term={period.term}
          areas={areas}
          progress={progress}
          teacherComment={assessment?.teacher_comment || ""}
        />
      ) : (
        <ReportCard
          student={student}
          settings={settings}
          year={period.year}
          term={period.term}
          marks={marks}
          characters={characters}
          teacherComment={assessment?.teacher_comment || ""}
        />
      )}
    </main>
  );
}
