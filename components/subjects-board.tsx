"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { SubjectModal } from "@/components/subject-modal";
import { btnPrimary, btnQuiet, btnSecondary, cardClass } from "@/components/ui";
import type { Stage, Subject } from "@/lib/types";

type Editing = { subject: Subject } | { create: Stage };

export function SubjectsBoard({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState<Editing | null>(null);

  const groups: Array<{ stage: Stage; title: string; blurb: string; empty: string; add: string }> = [
    {
      stage: "standard",
      title: "Subjects",
      blurb: "Printed on the marks report for Grade classes.",
      empty: "No subjects yet.",
      add: "Add subject",
    },
    {
      stage: "early_years",
      title: "Early Years areas",
      blurb: "Printed on the comment report for Early Years classes.",
      empty: "No areas yet.",
      add: "Add area",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => {
          const rows = subjects.filter((subject) => subject.stage === group.stage);
          return (
            <section key={group.stage}>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">{group.title}</h2>
                  <p className="text-sm text-ink/55">{group.blurb}</p>
                </div>
                <button type="button" onClick={() => setOpen({ create: group.stage })} className={btnSecondary}>
                  {group.add}
                </button>
              </div>
              <div className={cardClass}>
                {rows.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-ink/55">{group.empty}</p>
                    <button
                      type="button"
                      onClick={() => setOpen({ create: group.stage })}
                      className={`${btnPrimary} mt-4`}
                    >
                      {group.add}
                    </button>
                  </div>
                ) : (
                  <ul>
                    {rows.map((subject) => (
                      <li
                        key={subject.id}
                        className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="font-[family-name:var(--font-display)] text-xl text-navy">{subject.name}</p>
                          <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                            {subject.compulsory ? "Compulsory" : "Optional"}
                            {group.stage === "standard" && subject.graded === false ? " · Comment only" : ""}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                          <button type="button" onClick={() => setOpen({ subject })} className={btnSecondary}>
                            Edit
                          </button>
                          <form action="/api/subjects" method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={subject.id} />
                            <ConfirmButton
                              label="Remove"
                              message="Remove this from the curriculum for every learner?"
                              className={`${btnQuiet} w-full`}
                            />
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {open && "create" in open ? (
        <SubjectModal defaultStage={open.create} onClose={() => setOpen(null)} />
      ) : null}
      {open && "subject" in open ? (
        <SubjectModal subject={open.subject} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
