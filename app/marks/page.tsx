import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PeriodBar } from "@/components/period-bar";
import { AddStudentButton } from "@/components/students-board";
import { btnPrimary, cardClass } from "@/components/ui";
import { getSettings, listClasses, listStudents, listSubjects, listTerms, listYears } from "@/lib/db";
import { periodQuery, readPeriod } from "@/lib/period";

export const metadata = { title: "Marks — Paradise Christian School" };

export default async function MarksIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; term?: string }>;
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

  return (
    <AppShell current="/marks" period={settings}>
      <PageHeader
        kicker="Assessment"
        title="Enter marks"
        lede="Choose a learner. Each student has a dedicated marks page for the selected year and term."
        action={<AddStudentButton subjects={subjects} classes={classes} />}
      />
      <PeriodBar
        year={period.year}
        term={period.term}
        years={years}
        terms={terms}
        basePath="/marks"
      />
      <div className={cardClass}>
        {students.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink/55">Add a student before entering marks.</p>
        ) : (
          <ul>
            {students.map((student) => (
              <li
                key={student.id}
                className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl text-navy">{student.name}</p>
                  <p className="text-sm text-ink/55">{student.grade}</p>
                </div>
                <Link href={`/marks/${student.id}?${q}`} className={btnPrimary}>
                  Open marks
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
