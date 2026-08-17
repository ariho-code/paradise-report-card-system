"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { Stage, Subject } from "@/lib/types";

export function SubjectModal({
  subject,
  defaultStage = "standard",
  onClose,
}: {
  subject?: Subject | null;
  defaultStage?: Stage;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>(subject?.stage ?? defaultStage);
  const earlyYears = stage === "early_years";

  return (
    <Modal
      kicker="Curriculum"
      title={subject ? (earlyYears ? "Edit area" : "Edit subject") : earlyYears ? "Add area" : "Add subject"}
      onClose={onClose}
    >
      <form action="/api/subjects" method="post" className="space-y-4">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <input type="hidden" name="stage" value={stage} />

        <fieldset>
          <legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-brass">Belongs to</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["standard", "early_years"] as const).map((value) => {
              const active = stage === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStage(value)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    active ? "border-navy bg-navy text-white" : "border-rule bg-parchment text-navy hover:border-navy/40"
                  }`}
                >
                  {value === "standard" ? "Subjects" : "Early Years"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">
            {earlyYears ? "Area tracked" : "Subject name"}
          </span>
          <input
            name="name"
            required
            autoFocus
            defaultValue={subject?.name}
            placeholder={earlyYears ? "Creative expression" : "Mathematics"}
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-rule bg-parchment px-3 py-2.5 text-sm">
          <input type="checkbox" name="compulsory" defaultChecked={subject?.compulsory ?? true} />
          {earlyYears ? "Tracked for every Early Years learner" : "Compulsory for every learner"}
        </label>

        <p className="text-xs text-ink/55">
          {earlyYears
            ? "Early Years areas appear on the comment report. Remove one from a single child on their student record."
            : "Subjects appear on the marks report. Remove one from a single learner on their student record."}
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {subject ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
