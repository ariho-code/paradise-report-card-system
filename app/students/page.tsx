import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { AddStudentButton, StudentsBoard } from "@/components/students-board";
import { getSettings, listClasses, listStudents, listSubjects } from "@/lib/db";
import { periodQuery } from "@/lib/period";

export const metadata = { title: "Students — Paradise Christian School" };

export default async function StudentsPage() {
  const [settings, students, subjects, classes] = await Promise.all([
    getSettings(),
    listStudents(),
    listSubjects(),
    listClasses(),
  ]);

  return (
    <AppShell current="/students" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Register"
        title="Students"
        lede="Add a learner from this page. Edit, marks, report, and remove sit on every row."
        action={<AddStudentButton subjects={subjects} classes={classes} />}
      />
      <StudentsBoard
        students={students}
        subjects={subjects}
        classes={classes}
        periodQuery={periodQuery(settings.current_year, settings.current_term)}
      />
    </AppShell>
  );
}
