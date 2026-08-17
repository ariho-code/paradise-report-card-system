"use client";

import { useState } from "react";
import { ClassModal } from "@/components/class-modal";
import { ConfirmButton } from "@/components/confirm-button";
import { btnPrimary, btnQuiet, btnSecondary, cardClass } from "@/components/ui";
import type { SchoolClass } from "@/lib/types";

export function AddClassButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        Add class
      </button>
      {open ? <ClassModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function ClassesBoard({
  classes,
  error,
}: {
  classes: SchoolClass[];
  error?: string;
}) {
  const [open, setOpen] = useState<null | "create" | SchoolClass>(null);

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-blush/30 bg-blush/10 px-4 py-2 text-sm text-blush">{error}</p>
      ) : null}
      <div className={cardClass}>
        {classes.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-ink/55">No classes yet. Add Grade 7, Baby Class, or any group you teach.</p>
            <button type="button" onClick={() => setOpen("create")} className={`${btnPrimary} mt-4`}>
              Add the first class
            </button>
          </div>
        ) : (
          <ul>
            {classes.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-xl text-navy">{item.name}</p>
                  {item.level === "early_years" ? (
                    <span className="mt-1 inline-block rounded-full bg-brass/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a5c00]">
                      Early Years · comments
                    </span>
                  ) : null}
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <button type="button" onClick={() => setOpen(item)} className={`${btnSecondary} flex-1 sm:flex-none`}>
                    Edit
                  </button>
                  <form action="/api/classes" method="post" className="flex-1 sm:flex-none">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmButton
                      label="Remove"
                      message="Remove this class? Students must be moved first."
                      className={`${btnQuiet} w-full`}
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open === "create" ? <ClassModal onClose={() => setOpen(null)} /> : null}
      {open && open !== "create" ? <ClassModal schoolClass={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
