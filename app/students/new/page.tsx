import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/student-form";
import { getSettings, listSubjects } from "@/lib/db";

export default async function NewStudentPage() {
  const [settings, subjects] = await Promise.all([getSettings(), listSubjects()]);

  return (
    <AppShell current="/students" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Register"
        title="Add student"
        lede="Create a learner record. Compulsory subjects attach automatically."
        action={
          <Link href="/students" className="text-sm underline-offset-4 hover:underline">
            Back to students
          </Link>
        }
      />
      <StudentForm subjects={subjects} />
    </AppShell>
  );
}
