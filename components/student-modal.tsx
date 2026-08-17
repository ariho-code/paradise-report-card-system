"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { SubjectPicker, classDefaults } from "@/components/subject-picker";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { SchoolClass, Stage, Student, Subject } from "@/lib/types";

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
  const [grade, setGrade] = useState(student?.grade || "");
  const [overrides, setOverrides] = useState<Record<string, Set<string>>>({});

  const names = (classes || []).map((item) => item.name);
  if (student?.grade && !names.includes(student.grade)) names.unshift(student.grade);

  // The learner's list follows their class, so it swaps between subjects and
  // Early Years areas as soon as the class changes.
  const schoolClass = classes.find((item) => item.name === grade);
  const stage: Stage = schoolClass?.level === "early_years" ? "early_years" : "standard";
  const earlyYears = stage === "early_years";
  const inStage = useMemo(
    () => subjects.filter((subject) => subject.stage === stage),
    [subjects, stage],
  );
  const noun = earlyYears ? "areas" : "subjects";

  // Start from what the class takes, then apply this learner's own changes.
  const byClass = useMemo(() => classDefaults(inStage, schoolClass), [inStage, schoolClass]);
  const initial = useMemo(() => {
    if (grade !== student?.grade) return byClass;
    const next = new Set(byClass);
    for (const id of student?.optional_subject_ids || []) next.add(id);
    for (const id of student?.excluded_subject_ids || []) next.delete(id);
    return next;
  }, [byClass, grade, student]);

  const taken = overrides[grade] ?? initial;

  function toggle(id: string, next: boolean) {
    setOverrides((current) => {
      const base = new Set(current[grade] ?? initial);
      if (next) base.add(id);
      else base.delete(id);
      return { ...current, [grade]: base };
    });
  }

  return (
    <Modal kicker="Register" title={student ? "Edit student" : "Add student"} onClose={onClose}>
      <form action="/api/students" method="post" className="space-y-4">
        {student ? <input type="hidden" name="id" value={student.id} /> : null}
        <Field label="Full name" name="name" defaultValue={student?.name} required placeholder="Amani Mary Baraka" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class</span>
            <select
              name="grade"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={fieldClass}
            >
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

        {earlyYears ? (
          <p className="rounded-xl border border-brass/30 bg-brass/10 px-3 py-2.5 text-xs text-[#7a5c00]">
            This is an Early Years class — the report is written comments and awards, with no marks.
          </p>
        ) : null}

        {grade ? (
          <SubjectPicker
            subjects={inStage}
            taken={taken}
            onToggle={toggle}
            defaults={byClass}
            legend={earlyYears ? "Areas this learner tracks" : "Subjects this learner takes"}
            hint={`Ticked to match ${grade}. Change one only if this child differs from the rest of the class.`}
            emptyNote={`No ${noun} for this class type yet. Add them on the Subjects page.`}
          />
        ) : (
          <p className="text-xs text-ink/55">Choose a class to see the {noun} it takes.</p>
        )}

        <p className="text-xs text-ink/55">
          Set what a whole class takes on the Classes page, and add more {noun} on the Subjects page.
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
