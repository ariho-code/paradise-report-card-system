"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { SchoolClass, Stage } from "@/lib/types";

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
  onClose,
}: {
  schoolClass?: SchoolClass | null;
  onClose: () => void;
}) {
  const [level, setLevel] = useState<Stage>(schoolClass?.level === "early_years" ? "early_years" : "standard");

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
