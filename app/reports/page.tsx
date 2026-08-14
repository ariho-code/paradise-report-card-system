import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ClassFilter } from "@/components/class-filter";
import { PageHeader } from "@/components/page-header";
import { PeriodBar } from "@/components/period-bar";
import { AddStudentButton } from "@/components/students-board";
import { btnGold, btnPrimary, cardClass } from "@/components/ui";
import { getSettings, listClasses, listStudents, listSubjects, listTerms, listYears } from "@/lib/db";
import { periodQuery, readPeriod } from "@/lib/period";

export const metadata = { title: "Report cards — Paradise Christian School" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; term?: string; class?: string }>;
}) {
  const params = await searchParams;
  const [settings, students, subjects, classes, years, terms] = await Promise.all([
    getSettings(),
    listStudents(),
    listSubjects(),
    listClasses(),
    listYears(),
    listTerms(),
  ]);
  const period = readPeriod(params, settings);
  const q = periodQuery(period.year, period.term);
  const className = params.class || "";
  const visible = className ? students.filter((student) => student.grade === className) : students;
  const classQuery = className ? `&class=${encodeURIComponent(className)}` : "";

  return (
    <AppShell current="/reports" period={settings}>
      <PageHeader
        kicker="Documents"
        title="Report cards"
        lede="Open one learner, or download a PDF for the whole class."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <AddStudentButton subjects={subjects} classes={classes} />
            <Link href={`/reports/print/class?${q}${classQuery}`} className={btnGold}>
              {className ? `PDF: ${className}` : "Download class PDF"}
            </Link>
          </div>
        }
      />
      <PeriodBar
        year={period.year}
        term={period.term}
        years={years}
        terms={terms}
        basePath="/reports"
      />
      <div className="mb-6">
        <ClassFilter
          value={className}
          classes={classes.map((item) => item.name)}
          year={period.year}
          term={period.term}
          basePath="/reports"
        />
      </div>
      <div className={cardClass}>
        {visible.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink/55">No students in this class.</p>
        ) : (
          <ul>
            {visible.map((student) => (
              <li
                key={student.id}
                className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl text-navy">{student.name}</p>
                  <p className="text-sm text-ink/55">{student.grade}</p>
                </div>
                <Link href={`/reports/print/${student.id}?${q}`} className={btnPrimary}>
                  Open report
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-3 text-sm text-ink/55">
        On the class page, tap <strong>Download PDF</strong> to save every report in one file.
      </p>
    </AppShell>
  );
}
