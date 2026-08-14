import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { AddSubjectButton, SubjectsBoard } from "@/components/subjects-board";
import { getSettings, listSubjects } from "@/lib/db";

export const metadata = { title: "Subjects — Paradise Christian School" };

export default async function SubjectsPage() {
  const [settings, subjects] = await Promise.all([getSettings(), listSubjects()]);

  return (
    <AppShell current="/subjects" period={settings}>
      <PageHeader
        kicker="Curriculum"
        title="Subjects"
        lede="Compulsory subjects appear on every report. Optional subjects are assigned when you add a student."
        action={<AddSubjectButton />}
      />
      <SubjectsBoard subjects={subjects} />
    </AppShell>
  );
}
