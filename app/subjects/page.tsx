import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SubjectsBoard } from "@/components/subjects-board";
import { getSettings, listSubjects } from "@/lib/db";

export const metadata = { title: "Subjects — Paradise Christian School" };

export default async function SubjectsPage() {
  const [settings, subjects] = await Promise.all([getSettings(), listSubjects()]);

  return (
    <AppShell current="/subjects" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Curriculum"
        title="Subjects"
        lede="Grade classes are marked on subjects. Early Years classes are commented on areas. Both are edited here."
      />
      <SubjectsBoard subjects={subjects} />
    </AppShell>
  );
}
