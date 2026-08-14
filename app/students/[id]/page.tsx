import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/student-form";
import { getSettings, getStudent, listSubjects } from "@/lib/db";
import { periodQuery } from "@/lib/period";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [settings, student, subjects] = await Promise.all([
    getSettings(),
    getStudent(id),
    listSubjects(),
  ]);
  if (!student) notFound();
  const q = periodQuery(settings.current_year, settings.current_term);

  return (
    <AppShell current="/students" period={settings}>
      <PageHeader
        kicker="Register"
        title={student.name}
        lede="Update the learner record or open marks for the current period."
        action={
          <div className="flex gap-4 text-sm">
            <Link href={`/marks/${student.id}?${q}`} className="underline-offset-4 hover:underline">
              Enter marks
            </Link>
            <Link href="/students" className="underline-offset-4 hover:underline">
              All students
            </Link>
          </div>
        }
      />
      <StudentForm student={student} subjects={subjects} />
    </AppShell>
  );
}
