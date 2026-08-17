"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { SubjectPicker, classDefaults } from "@/components/subject-picker";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { SchoolClass, Stage, Subject } from "@/lib/types";

const LEVELS: Array<{ value: Stage; title: string; blurb: string }> = [
  {
    value: "standard",
    title: "Standard",
    blurb: "Test and end-of-term marks, letter grades, grading key.",
  },
  {
    value: "early_years",
    title: "Early Years",
    blurb: "Written progress per area with an award. No marks anywhere.",
  },
];

export function ClassModal({
  schoolClass,
  subjects = [],
  onClose,
}: {
  schoolClass?: SchoolClass | null;
  subjects?: Subject[];
  onClose: () => void;
}) {
  const [level, setLevel] = useState<Stage>(schoolClass?.level === "early_years" ? "early_years" : "standard");
  const inStage = useMemo(() => subjects.filter((s) => s.stage === level), [subjects, level]);
  const curriculum = useMemo(
    () => new Set(inStage.filter((s) => s.compulsory).map((s) => s.id)),
    [inStage],
  );

  // Switching level swaps the whole list, so the ticks are recomputed per level
  // and edits to one level are not carried into the other.
  const [takenByLevel, setTakenByLevel] = useState<Record<Stage, Set<string> | undefined>>({
    standard: undefined,
    early_years: undefined,
  });
  const taken = takenByLevel[level] ?? classDefaults(inStage, schoolClass);

  function toggle(id: string, next: boolean) {
    setTakenByLevel((current) => {
      const base = new Set(current[level] ?? classDefaults(inStage, schoolClass));
      if (next) base.add(id);
      else base.delete(id);
      return { ...current, [level]: base };
    });
  }

  return (
    <Modal kicker="Classes" title={schoolClass ? "Edit class" : "Add class"} onClose={onClose}>
      <form action="/api/classes" method="post" className="space-y-4">
        {schoolClass ? <input type="hidden" name="id" value={schoolClass.id} /> : null}
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class name</span>
          <input
            name="name"
            required
            autoFocus
            defaultValue={schoolClass?.name}
            placeholder="Grade 8"
            className={fieldClass}
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-brass">Report type</legend>
          <input type="hidden" name="level" value={level} />
          <div className="grid gap-2">
            {LEVELS.map((option) => {
              const active = level === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLevel(option.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active ? "border-navy bg-white ring-1 ring-navy" : "border-rule bg-parchment hover:border-navy/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                        active ? "border-navy bg-navy" : "border-rule-dark bg-transparent"
                      }`}
                    />
                    <span className="text-sm font-semibold text-navy">{option.title}</span>
                  </span>
                  <span className="mt-1 block pl-[22px] text-xs text-ink/60">{option.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <SubjectPicker
          subjects={inStage}
          taken={taken}
          onToggle={toggle}
          defaults={curriculum}
          legend={level === "early_years" ? "Areas this class tracks" : "Subjects this class takes"}
          hint="Set it once here and it applies to every learner in the class. Individual learners can still be changed on their own record."
          emptyNote="No subjects for this type yet. Add them on the Subjects page."
        />

        <p className="text-xs text-ink/55">
          Editing a class name also updates every student already in that class.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {schoolClass ? "Save class" : "Add class"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
