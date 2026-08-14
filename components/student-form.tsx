import type { Student, Subject } from "@/lib/types";

export function StudentForm({
  student,
  subjects,
}: {
  student?: Student;
  subjects: Subject[];
}) {
  const optionals = subjects.filter((s) => !s.compulsory);
  const selected = new Set(student?.optional_subject_ids || []);

  return (
    <form action="/api/students" method="post" className="max-w-xl space-y-5 border border-rule bg-vellum p-6">
      {student ? <input type="hidden" name="id" value={student.id} /> : null}
      <Field label="Full name" name="name" defaultValue={student?.name} required placeholder="Amani Mary Baraka" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Class" name="grade" defaultValue={student?.grade} required placeholder="Grade 7" />
        <Field label="Section" name="section" defaultValue={student?.section} placeholder="A" />
      </div>
      <Field label="Class adviser" name="adviser" defaultValue={student?.adviser} placeholder="Teacher name" />

      {optionals.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-[11px] uppercase tracking-[0.18em] text-brass">Optional subjects</legend>
          <div className="space-y-2">
            {optionals.map((subject) => (
              <label key={subject.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="optional"
                  value={subject.id}
                  defaultChecked={selected.has(subject.id)}
                />
                {subject.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p className="text-xs text-ink/55">Compulsory subjects are added to every learner automatically.</p>
      <button type="submit" className="bg-navy px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-vellum">
        {student ? "Save student" : "Add student"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full border border-rule bg-parchment px-3 py-2"
      />
    </label>
  );
}
