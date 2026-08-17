"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
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
  const selected = new Set(student?.optional_subject_ids || []);
  const removed = new Set(student?.excluded_subject_ids || []);

  const names = (classes || []).map((item) => item.name);
  if (student?.grade && !names.includes(student.grade)) names.unshift(student.grade);

  // The learner's list follows their class, so the pickers below swap between
  // subjects and Early Years areas as soon as the class changes.
  const stage: Stage =
    classes.find((item) => item.name === grade)?.level === "early_years" ? "early_years" : "standard";
  const earlyYears = stage === "early_years";
  const inStage = subjects.filter((subject) => subject.stage === stage);
  const optionals = inStage.filter((subject) => !subject.compulsory);
  const compulsory = inStage.filter((subject) => subject.compulsory);
  const noun = earlyYears ? "areas" : "subjects";

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

        {optionals.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-brass">Optional {noun}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {optionals.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-2 rounded-xl border border-rule bg-parchment px-3 py-2 text-sm"
                >
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

        {compulsory.length > 0 ? (
          <fieldset>
            <legend className="mb-1 text-[11px] uppercase tracking-[0.16em] text-brass">Not taken by this learner</legend>
            <p className="mb-2 text-xs text-ink/55">
              Every {earlyYears ? "area" : "subject"} below is on by default. Tick one to drop it from this child&apos;s
              report — nobody else is affected.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {compulsory.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-2 rounded-xl border border-rule bg-parchment px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="excluded"
                    value={subject.id}
                    defaultChecked={removed.has(subject.id)}
                  />
                  <span className="min-w-0">{subject.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <p className="text-xs text-ink/55">
          Add more classes on the Classes page, and more {noun} on the Subjects page.
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
