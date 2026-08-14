"use client";

import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { SchoolClass, Student, Subject } from "@/lib/types";

export function StudentModal({
  student,
  subjects,
  classes = [],
  onClose,
}: {
  student?: Student | null;
  subjects: Subject[];
  classes?: SchoolClass[];
  onClose: () => void;
}) {
  const optionals = subjects.filter((subject) => !subject.compulsory);
  const selected = new Set(student?.optional_subject_ids || []);
  const names = (classes || []).map((item) => item.name);
  if (student?.grade && !names.includes(student.grade)) names.unshift(student.grade);

  return (
    <Modal
      kicker="Register"
      title={student ? "Edit student" : "Add student"}
      onClose={onClose}
    >
      <form action="/api/students" method="post" className="space-y-4">
        {student ? <input type="hidden" name="id" value={student.id} /> : null}
        <Field label="Full name" name="name" defaultValue={student?.name} required placeholder="Amani Mary Baraka" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class</span>
            <select name="grade" required defaultValue={student?.grade || ""} className={fieldClass}>
              <option value="" disabled>
                Choose class
              </option>
              {names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Section" name="section" defaultValue={student?.section} placeholder="A" />
        </div>
        <Field label="Class adviser" name="adviser" defaultValue={student?.adviser} placeholder="Teacher name" />

        {optionals.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-brass">Optional subjects</legend>
            <div className="grid grid-cols-2 gap-2">
              {optionals.map((subject) => (
                <label key={subject.id} className="flex items-center gap-2 rounded-xl border border-rule bg-parchment px-3 py-2 text-sm">
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

        <p className="text-xs text-ink/55">
          Compulsory subjects are added automatically. Add more classes on the Classes page.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {student ? "Save student" : "Add student"}
          </button>
        </div>
      </form>
    </Modal>
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
        autoFocus={name === "name"}
        className={fieldClass}
      />
    </label>
  );
}
