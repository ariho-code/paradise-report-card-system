import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { getSettings, listTerms, listYears } from "@/lib/db";

export const metadata = { title: "Registry — Paradise Christian School" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; pw?: string }>;
}) {
  const params = await searchParams;
  const [settings, years, terms] = await Promise.all([getSettings(), listYears(), listTerms()]);

  return (
    <AppShell current="/settings" period={{ year: settings.current_year, term: settings.current_term }}>
      <PageHeader
        kicker="Registry"
        title="School settings"
        lede="Set when the term opens and ends. Those dates print on every report card."
      />

      {params.saved ? (
        <p className="mb-5 border border-canopy/30 bg-canopy/10 px-4 py-2 text-sm text-canopy">School info saved.</p>
      ) : null}
      {params.pw === "ok" ? (
        <p className="mb-5 border border-canopy/30 bg-canopy/10 px-4 py-2 text-sm text-canopy">Password updated.</p>
      ) : null}
      {params.pw === "bad" ? (
        <p className="mb-5 border border-blush/30 bg-blush/10 px-4 py-2 text-sm text-blush">Current password is wrong.</p>
      ) : null}
      {params.pw === "short" ? (
        <p className="mb-5 border border-blush/30 bg-blush/10 px-4 py-2 text-sm text-blush">New password must be at least 4 characters.</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form action="/api/settings" method="post" className="space-y-4 rounded-2xl border border-rule bg-vellum p-6">
          <input type="hidden" name="intent" value="school" />
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">School</h2>
          <Field label="School name" name="school_name" defaultValue={settings.school_name} />
          <Field label="Principal" name="principal" defaultValue={settings.principal} />
          <Field label="Motto" name="motto" defaultValue={settings.motto} />
          <Field label="Term opens" name="term_open" defaultValue={settings.term_open} placeholder="12th May, 2026" />
          <Field label="Term ends" name="term_end" defaultValue={settings.term_end} placeholder="7th August, 2026" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Working year</span>
              <select name="current_year" defaultValue={settings.current_year} className="w-full border border-rule bg-parchment px-3 py-2">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Working term</span>
              <select name="current_term" defaultValue={settings.current_term} className="w-full border border-rule bg-parchment px-3 py-2">
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#16325c] px-5 py-2.5 text-sm font-semibold text-[#ffffff]">
            Save school info
          </button>
        </form>

        <div className="space-y-6">
          <section className="rounded-2xl border border-rule bg-vellum p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">Years</h2>
            <ul className="mt-4 divide-y divide-rule">
              {years.map((year) => (
                <li key={year} className="flex items-center justify-between py-2">
                  <span>{year}</span>
                  <form action="/api/settings" method="post">
                    <input type="hidden" name="intent" value="remove-year" />
                    <input type="hidden" name="name" value={year} />
                    <button type="submit" className="text-sm text-blush">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <form action="/api/settings" method="post" className="mt-4 flex gap-2">
              <input type="hidden" name="intent" value="add-year" />
              <input name="name" placeholder="2028" className="flex-1 border border-rule bg-parchment px-3 py-2" />
              <button type="submit" className="border border-navy px-3 py-2 text-sm text-navy">
                Add
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-rule bg-vellum p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">Terms</h2>
            <ul className="mt-4 divide-y divide-rule">
              {terms.map((term) => (
                <li key={term} className="flex items-center justify-between py-2">
                  <span>{term}</span>
                  <form action="/api/settings" method="post">
                    <input type="hidden" name="intent" value="remove-term" />
                    <input type="hidden" name="name" value={term} />
                    <button type="submit" className="text-sm text-blush">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <form action="/api/settings" method="post" className="mt-4 flex gap-2">
              <input type="hidden" name="intent" value="add-term" />
              <input name="name" placeholder="Mid-year" className="flex-1 border border-rule bg-parchment px-3 py-2" />
              <button type="submit" className="border border-navy px-3 py-2 text-sm text-navy">
                Add
              </button>
            </form>
          </section>

          <form action="/api/settings" method="post" className="space-y-4 rounded-2xl border border-rule bg-vellum p-6">
            <input type="hidden" name="intent" value="password" />
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">Password</h2>
            <Field label="Current password" name="current" type="password" />
            <Field label="New password" name="next" type="password" />
            <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#16325c] px-5 py-2.5 text-sm font-semibold text-[#ffffff]">
              Update password
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-rule bg-white px-3 py-2.5"
      />
    </label>
  );
}
