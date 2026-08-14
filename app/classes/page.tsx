import { AppShell } from "@/components/app-shell";
import { AddClassButton, ClassesBoard } from "@/components/classes-board";
import { PageHeader } from "@/components/page-header";
import { getSettings, listClasses } from "@/lib/db";

export const metadata = { title: "Classes — Paradise Christian School" };

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const [settings, classes] = await Promise.all([getSettings(), listClasses()]);

  return (
    <AppShell current="/classes" period={settings}>
      <PageHeader
        kicker="Register"
        title="Classes"
        lede="Add classes here, then pick one when you enrol a student. Names stay editable."
        action={<AddClassButton />}
      />
      <ClassesBoard classes={classes} error={params.error} />
    </AppShell>
  );
}
