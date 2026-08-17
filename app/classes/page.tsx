import { AppShell } from "@/components/app-shell";
import { AddClassButton, ClassesBoard } from "@/components/classes-board";
import { PageHeader } from "@/components/page-header";
import { getSettings, listClasses, listSubjects } from "@/lib/db";

export const metadata = { title: "Classes — Paradise Christian School" };

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const [settings, classes, subjects] = await Promise.all([
    getSettings(),
    listClasses(),
    listSubjects(),
  ]);

  return (
    <AppShell current="/classes" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Register"
        title="Classes"
        lede="Set each class once — its report type and the subjects it takes. Every learner in the class follows."
        action={<AddClassButton subjects={subjects} />}
      />
      <ClassesBoard classes={classes} subjects={subjects} error={params.error} />
    </AppShell>
  );
}
