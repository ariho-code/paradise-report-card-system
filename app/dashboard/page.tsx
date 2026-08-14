import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { AddStudentButton, StudentsBoard } from "@/components/students-board";
import { getSession } from "@/lib/auth";
import { countReportsReady, getSettings, listClasses, listStudents, listSubjects } from "@/lib/db";
import { periodQuery } from "@/lib/period";
import { redirect } from "next/navigation";

export const metadata = { title: "Ledger — Paradise Christian School" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [settings, students, subjects, classes] = await Promise.all([
    getSettings(),
    listStudents(),
    listSubjects(),
    listClasses(),
  ]);
  const ready = await countReportsReady(settings.current_year, settings.current_term);
  const q = periodQuery(settings.current_year, settings.current_term);

  return (
    <AppShell current="/dashboard" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Paradise Christian School"
        title="School ledger"
        lede={`${settings.current_term} ${settings.current_year} is the working period. Add a student, enter marks, then print the report.`}
        action={<AddStudentButton subjects={subjects} classes={classes} />}
      />

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Learners" value={students.length} />
        <Stat label="Classes" value={classes.length} />
        <Stat label={`Reports ready · ${settings.current_term}`} value={ready} />
      </section>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-navy">Learners</h2>
        <StudentsBoard students={students} subjects={subjects} classes={classes} periodQuery={q} compact />
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rule bg-vellum px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-brass">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-navy">{value}</p>
    </div>
  );
}
