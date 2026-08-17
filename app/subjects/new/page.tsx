import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { getSettings } from "@/lib/db";

export default async function NewSubjectPage() {
  const settings = await getSettings();

  return (
    <AppShell current="/subjects" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Curriculum"
        title="Add subject"
        action={
          <Link href="/subjects" className="text-sm underline-offset-4 hover:underline">
            Back to subjects
          </Link>
        }
      />
      <form action="/api/subjects" method="post" className="max-w-xl space-y-5 border border-rule bg-vellum p-6">
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Subject name</span>
          <input name="name" required className="w-full border border-rule bg-parchment px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Belongs to</span>
          <select name="stage" defaultValue="standard" className="w-full border border-rule bg-parchment px-3 py-2">
            <option value="standard">Subjects · marks report</option>
            <option value="early_years">Early Years · comment report</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Assessed by</span>
          <select name="graded" defaultValue="marks" className="w-full border border-rule bg-parchment px-3 py-2">
            <option value="marks">Marks · test, end of term, grade</option>
            <option value="comment">Comment only · a skill such as Chess or Music</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="compulsory" defaultChecked />
          Compulsory for every learner
        </label>
        <button type="submit" className="bg-navy px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-vellum">
          Save subject
        </button>
      </form>
    </AppShell>
  );
}
