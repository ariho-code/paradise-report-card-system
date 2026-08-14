"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { StudentModal } from "@/components/student-modal";
import { btnGold, btnPrimary, btnQuiet, btnSecondary, cardClass } from "@/components/ui";
import type { SchoolClass, Student, Subject } from "@/lib/types";

export function StudentsBoard({
  students,
  subjects,
  classes,
  periodQuery,
  compact,
}: {
  students: Student[];
  subjects: Subject[];
  classes: SchoolClass[];
  periodQuery: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState<null | "create" | Student>(null);
  const list = compact ? students.slice(0, 8) : students;

  return (
    <>
      <div className={cardClass}>
        {list.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-ink/55">No students in the register yet.</p>
            <button type="button" onClick={() => setOpen("create")} className={`${btnPrimary} mt-4`}>
              Add the first student
            </button>
          </div>
        ) : (
          <ul>
            {list.map((student) => (
              <li
                key={student.id}
                className="flex flex-col gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-xl text-navy">{student.name}</p>
                  <p className="text-sm text-ink/60">
                    {student.grade}
                    {student.section ? ` · ${student.section}` : ""}
                    {student.adviser ? ` · ${student.adviser}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button type="button" onClick={() => setOpen(student)} className={btnSecondary}>
                    Edit
                  </button>
                  <Link href={`/marks/${student.id}?${periodQuery}`} className={btnPrimary}>
                    Open marks
                  </Link>
                  <Link href={`/reports/print/${student.id}?${periodQuery}`} className={btnGold}>
                    Report
                  </Link>
                  <form action="/api/students" method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={student.id} />
                    <ConfirmButton
                      label="Remove"
                      message="Remove this student and their marks?"
                      className={`${btnQuiet} w-full`}
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open === "create" ? (
        <StudentModal subjects={subjects} classes={classes} onClose={() => setOpen(null)} />
      ) : null}
      {open && open !== "create" ? (
        <StudentModal student={open} subjects={subjects} classes={classes} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

export function AddStudentButton({
  subjects,
  classes,
  label = "Add student",
}: {
  subjects: Subject[];
  classes: SchoolClass[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        {label}
      </button>
      {open ? <StudentModal subjects={subjects} classes={classes} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
