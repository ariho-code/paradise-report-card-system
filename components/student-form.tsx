"use client";

import { useState } from "react";
import type { SchoolClass, Stage, Student, Subject } from "@/lib/types";

export function StudentForm({
  student,
  subjects,
  classes = [],
}: {
  student?: Student;
  subjects: Subject[];
  classes?: SchoolClass[];
}) {
  const [grade, setGrade] = useState(student?.grade || "");
  const selected = new Set(student?.optional_subject_ids || []);
  const removed = new Set(student?.excluded_subject_ids || []);

  const names = classes.map((item) => item.name);
  if (student?.grade && !names.includes(student.grade)) names.unshift(student.grade);

  const stage: Stage =
    classes.find((item) => item.name === grade)?.level === "early_years" ? "early_years" : "standard";
  const earlyYears = stage === "early_years";
  const inStage = subjects.filter((subject) => subject.stage === stage);
  const optionals = inStage.filter((subject) => !subject.compulsory);
  const compulsory = inStage.filter((subject) => subject.compulsory);
  const noun = earlyYears ? "areas" : "subjects";

  return (
    <form action="/api/students" method="post" className="max-w-xl space-y-5 border border-rule bg-vellum p-6">
      {student ? <input type="hidden" name="id" value={student.id} /> : null}
      <Field label="Full name" name="name" defaultValue={student?.name} required placeholder="Amani Mary Baraka" />
      <div className="grid gap-4 sm:grid-cols-2">
        {names.length > 0 ? (
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class</span>
            <select
              name="grade"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-rule bg-parchment px-3 py-2"
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
        ) : (
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class</span>
            <input
              name="grade"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Grade 7"
              className="w-full border border-rule bg-parchment px-3 py-2"
            />
          </label>
        )}
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
          <legend className="mb-2 text-[11px] uppercase tracking-[0.18em] text-brass">Optional {noun}</legend>
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

      {compulsory.length > 0 ? (
        <fieldset>
          <legend className="mb-1 text-[11px] uppercase tracking-[0.18em] text-brass">Not taken by this learner</legend>
          <p className="mb-2 text-xs text-ink/55">
            Tick one to drop it from this child&apos;s report. Nobody else is affected.
          </p>
          <div className="space-y-2">
            {compulsory.map((subject) => (
              <label key={subject.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="excluded"
                  value={subject.id}
                  defaultChecked={removed.has(subject.id)}
                />
                {subject.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

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
