"use client";

import type { Subject } from "@/lib/types";

/**
 * One list of tick-boxes shared by the class and student editors. Both answer
 * the same question — which subjects are taken — so both look the same; the
 * difference is only what the boxes start out as.
 */
export function SubjectPicker({
  subjects,
  taken,
  onToggle,
  defaults,
  legend,
  hint,
  emptyNote,
}: {
  subjects: Subject[];
  taken: Set<string>;
  onToggle: (id: string, next: boolean) => void;
  /** When given, rows differing from this set are flagged as changed. */
  defaults?: Set<string>;
  legend: string;
  hint: string;
  emptyNote: string;
}) {
  if (subjects.length === 0) {
    return <p className="text-xs text-ink/55">{emptyNote}</p>;
  }

  return (
    <fieldset>
      <legend className="mb-1 text-[11px] uppercase tracking-[0.16em] text-brass">{legend}</legend>
      <p className="mb-2 text-xs text-ink/55">{hint}</p>
      {/* Lets the server tell "unticked everything" apart from "no picker shown". */}
      <input type="hidden" name="subjectsPicked" value="1" />
      <div className="grid gap-2 sm:grid-cols-2">
        {subjects.map((subject) => {
          const on = taken.has(subject.id);
          const changed = defaults ? defaults.has(subject.id) !== on : false;
          return (
            <label
              key={subject.id}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                on ? "border-navy/40 bg-white" : "border-rule bg-parchment text-ink/55"
              }`}
            >
              <input
                type="checkbox"
                name="taken"
                value={subject.id}
                checked={on}
                onChange={(e) => onToggle(subject.id, e.target.checked)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className={on ? "text-navy" : ""}>{subject.name}</span>
                {subject.graded === false && subject.stage === "standard" ? (
                  <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-brass">skill</span>
                ) : null}
                {changed ? (
                  <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-[#7a5c00]">changed</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The subjects a class takes by default: compulsory, plus adds, minus drops. */
export function classDefaults(
  subjects: Subject[],
  schoolClass?: { optional_subject_ids?: string[]; excluded_subject_ids?: string[] } | null,
) {
  const added = new Set(schoolClass?.optional_subject_ids || []);
  const dropped = new Set(schoolClass?.excluded_subject_ids || []);
  return new Set(
    subjects.filter((s) => (s.compulsory || added.has(s.id)) && !dropped.has(s.id)).map((s) => s.id),
  );
}
