"use client";

import { useMemo, useState } from "react";
import { suggestedGradeFromPapers } from "@/lib/grades";
import { DEFAULT_TRAITS, LETTER_GRADES, type CharacterMark, type Mark, type Subject } from "@/lib/types";

type RowState = {
  subjectId: string;
  name: string;
  test: string;
  eot: string;
  grade: string;
  missed: boolean;
  comment: string;
  graded: boolean;
};

function toNum(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function MarksForm({
  studentId,
  studentName,
  studentClass,
  year,
  term,
  subjects,
  marks,
  characters,
  teacherComment,
}: {
  studentId: string;
  studentName: string;
  studentClass: string;
  year: string;
  term: string;
  subjects: Subject[];
  marks: Mark[];
  characters: CharacterMark[];
  teacherComment: string;
}) {
  const initialRows = useMemo<RowState[]>(() => {
    const bySubject = new Map(marks.map((m) => [m.subject_id, m]));
    return subjects.map((subject) => {
      const saved = bySubject.get(subject.id);
      return {
        subjectId: subject.id,
        name: subject.name,
        test: saved?.test == null ? "" : String(saved.test),
        eot: saved?.eot == null ? "" : String(saved.eot),
        grade: saved?.grade || "U",
        missed: Boolean(saved?.missed),
        comment: saved?.comment || "",
        graded: subject.graded !== false,
      };
    });
  }, [subjects, marks]);

  const [rows, setRows] = useState(initialRows);
  // Skills are commented on, not marked, so they get their own card below the
  // ledger. Indexes are kept so patch() still targets the right row.
  const gradedRows = rows.map((row, index) => ({ row, index })).filter((r) => r.row.graded);
  const skillRows = rows.map((row, index) => ({ row, index })).filter((r) => !r.row.graded);
  const [comment, setComment] = useState(teacherComment);
  const [summary, setSummary] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [charRemarks, setCharRemarks] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {};
    for (const trait of DEFAULT_TRAITS) {
      next[trait] = characters.find((row) => row.trait === trait)?.remark || "";
    }
    return next;
  });

  function patch(index: number, next: Partial<RowState>, restampGrade = false) {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        const merged = { ...row, ...next };
        if (restampGrade) {
          merged.grade = suggestedGradeFromPapers(toNum(merged.test), toNum(merged.eot), merged.missed);
        }
        return merged;
      }),
    );
  }

  async function generateComments() {
    setAiBusy(true);
    setAiNote("");
    try {
      const response = await fetch("/api/ai/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentClass,
          year,
          term,
          summary,
          marks: gradedRows.map(({ row }) => ({
            subject: row.name,
            test: row.missed ? "" : row.test,
            eot: row.missed ? "" : row.eot,
            grade: row.missed ? "U" : row.grade,
          })),
          skills: skillRows.map(({ row }) => row.name),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        characters?: Record<string, string>;
        teacherComment?: string;
        markComments?: Record<string, string>;
      };
      if (!response.ok) {
        setAiNote(data.error || "Could not generate comments.");
        return;
      }
      if (data.characters) {
        setCharRemarks((current) => ({ ...current, ...data.characters }));
      }
      if (data.teacherComment) setComment(data.teacherComment);
      if (data.markComments) {
        setRows((current) =>
          current.map((row) => ({
            ...row,
            comment: data.markComments?.[row.name] || row.comment,
          }))
        );
      }
      setAiNote("Draft filled. Edit anything, then save. Nothing is printed until you save.");
    } catch {
      setAiNote("Could not reach the comment service.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <form action="/api/marks" method="post" className="space-y-6">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="term" value={term} />

      <div className="overflow-hidden rounded-2xl border border-rule bg-vellum">
        <div className="flex items-end justify-between border-b border-rule px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Marks ledger</p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">{studentName}</h2>
            <p className="text-sm text-ink/60">
              {studentClass} · {term} · {year}. Change any letter grade before saving.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-navy text-left text-vellum">
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="w-24 px-2 py-2 font-medium">Test</th>
                <th className="w-24 px-2 py-2 font-medium">EOT</th>
                <th className="w-24 px-2 py-2 font-medium">Grade</th>
                <th className="w-24 px-2 py-2 font-medium">Missed</th>
                <th className="px-3 py-2 font-medium">Remark</th>
              </tr>
            </thead>
            <tbody>
              {gradedRows.map(({ row, index }) => (
                <tr key={row.subjectId} className="border-t border-rule">
                  <td className="px-4 py-3 font-medium text-navy">
                    {row.name}
                    <input type="hidden" name="subjectId" value={row.subjectId} />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      name={`test_${row.subjectId}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      disabled={row.missed}
                      value={row.test}
                      onChange={(e) => patch(index, { test: e.target.value }, true)}
                      className="w-20 border border-rule bg-parchment px-2 py-1 font-[family-name:var(--font-mono)] disabled:opacity-40"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      name={`eot_${row.subjectId}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      disabled={row.missed}
                      value={row.eot}
                      onChange={(e) => patch(index, { eot: e.target.value }, true)}
                      className="w-20 border border-rule bg-parchment px-2 py-1 font-[family-name:var(--font-mono)] disabled:opacity-40"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      name={`grade_${row.subjectId}`}
                      disabled={row.missed}
                      value={row.missed ? "U" : row.grade}
                      onChange={(e) => patch(index, { grade: e.target.value })}
                      className="border border-rule bg-parchment px-2 py-1 font-[family-name:var(--font-mono)] font-semibold disabled:opacity-40"
                    >
                      {LETTER_GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
                      <input
                        type="checkbox"
                        name={`missed_${row.subjectId}`}
                        checked={row.missed}
                        onChange={(e) =>
                          patch(
                            index,
                            {
                              missed: e.target.checked,
                              test: e.target.checked ? "" : row.test,
                              eot: e.target.checked ? "" : row.eot,
                              grade: e.target.checked ? "U" : row.grade,
                            },
                            true,
                          )
                        }
                      />
                      Absent
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name={`comment_${row.subjectId}`}
                      value={row.comment}
                      onChange={(e) => patch(index, { comment: e.target.value })}
                      placeholder="Optional"
                      className="w-full border border-rule bg-parchment px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {skillRows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-rule bg-vellum">
          <div className="border-b border-rule px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Skills</p>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-navy">
              Comment only, no marks
            </h3>
            <p className="text-sm text-ink/60">
              These print in their own block on the report. Leave one blank to keep it off the sheet.
            </p>
          </div>
          <ul className="divide-y divide-rule">
            {skillRows.map(({ row, index }) => (
              <li key={row.subjectId} className="px-4 py-4 sm:px-5">
                <input type="hidden" name="subjectId" value={row.subjectId} />
                <label className="block">
                  <span className="mb-1 block font-[family-name:var(--font-display)] text-lg text-navy">
                    {row.name}
                  </span>
                  <input
                    name={`comment_${row.subjectId}`}
                    value={row.comment}
                    onChange={(e) => patch(index, { comment: e.target.value })}
                    placeholder="How is the learner doing in this skill?"
                    className="w-full rounded-xl border border-rule bg-parchment px-3 py-2 text-sm"
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-rule bg-vellum p-5">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-brass">Comments</h3>
        <p className="mt-1 text-sm text-ink/70">
          Write the character remarks and teacher comment yourself below, or ask AI to draft them first. You can edit any AI draft. Nothing is printed until you save.
        </p>
        <label className="mt-4 block text-sm font-medium text-navy">Optional note for AI</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="strong in art, weak in maths, respectful but quiet"
          className="mt-1 w-full rounded-xl border border-rule bg-white px-3 py-2"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generateComments}
            disabled={aiBusy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#16325c] px-4 py-2.5 text-sm font-semibold text-[#ffffff] disabled:opacity-50"
          >
            {aiBusy ? "Writing…" : "Generate with AI"}
          </button>
          <p className="text-sm text-ink/60">Or skip this and type your own comments on the right and left.</p>
        </div>
        {aiNote ? <p className="mt-2 text-sm text-navy">{aiNote}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-vellum p-5">
          <h3 className="mb-1 text-[11px] uppercase tracking-[0.2em] text-brass">Character</h3>
          <p className="mb-4 text-sm text-ink/55">Write your own remark for each value. These are not locked phrases.</p>
          <div className="space-y-3">
            {DEFAULT_TRAITS.map((trait) => (
              <label key={trait} className="block">
                <span className="mb-1 block text-sm font-medium text-navy">{trait}</span>
                <input
                  name={`trait_${trait}`}
                  value={charRemarks[trait] || ""}
                  onChange={(e) => setCharRemarks((current) => ({ ...current, [trait]: e.target.value }))}
                  placeholder="Your remark"
                  className="w-full border border-rule bg-parchment px-3 py-2"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-rule bg-vellum p-5">
          <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-brass">Teacher&apos;s comment</h3>
          <textarea
            name="teacherComment"
            rows={10}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-rule bg-parchment px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#16325c] px-6 py-3 text-sm font-semibold text-[#ffffff] hover:bg-[#0d1f3d] sm:w-auto"
      >
        Save marks and open report
      </button>
    </form>
  );
}
