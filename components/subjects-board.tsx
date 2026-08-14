"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { SubjectModal } from "@/components/subject-modal";
import { btnPrimary, btnQuiet, btnSecondary, cardClass } from "@/components/ui";
import type { Subject } from "@/lib/types";

export function AddSubjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        Add subject
      </button>
      {open ? <SubjectModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function SubjectsBoard({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState<null | "create" | Subject>(null);

  return (
    <>
      <div className={cardClass}>
        {subjects.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-ink/55">No subjects yet.</p>
            <button type="button" onClick={() => setOpen("create")} className={`${btnPrimary} mt-4`}>
              Add subject
            </button>
          </div>
        ) : (
          <ul>
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl text-navy">{subject.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    {subject.compulsory ? "Compulsory" : "Optional"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button type="button" onClick={() => setOpen(subject)} className={btnSecondary}>
                    Edit
                  </button>
                  <form action="/api/subjects" method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={subject.id} />
                    <ConfirmButton
                      label="Remove"
                      message="Remove this subject?"
                      className={`${btnQuiet} w-full`}
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open === "create" ? <SubjectModal onClose={() => setOpen(null)} /> : null}
      {open && open !== "create" ? <SubjectModal subject={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
