"use client";

import { useMemo, useState } from "react";
import { AWARD_LEVELS, type AreaProgress, type Subject } from "@/lib/types";

type RowState = {
  subjectId: string;
  name: string;
  progress: string;
  award: string;
};

export function EarlyYearsForm({
  studentId,
  studentName,
  studentClass,
  year,
  term,
  areas,
  progress,
  teacherComment,
}: {
  studentId: string;
  studentName: string;
  studentClass: string;
  year: string;
  term: string;
  areas: Subject[];
  progress: AreaProgress[];
  teacherComment: string;
}) {
  const initialRows = useMemo<RowState[]>(() => {
    const byArea = new Map(progress.map((row) => [row.subject_id, row]));
    return areas.map((area) => ({
      subjectId: area.id,
      name: area.name,
      progress: byArea.get(area.id)?.progress || "",
      award: byArea.get(area.id)?.award || "",
    }));
  }, [areas, progress]);

  const [rows, setRows] = useState(initialRows);
  const [comment, setComment] = useState(teacherComment);
  const [summary, setSummary] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");

  function patch(index: number, next: Partial<RowState>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)));
  }

  async function generateComments() {
    setAiBusy(true);
    setAiNote("");
    try {
      const response = await fetch("/api/ai/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "early_years",
          studentName,
          studentClass,
          year,
          term,
          summary,
          areas: rows.map((row) => ({ area: row.name, award: row.award })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        areaProgress?: Record<string, string>;
        awards?: Record<string, string>;
        teacherComment?: string;
      };
      if (!response.ok) {
        setAiNote(data.error || "Could not generate comments.");
        return;
      }
      if (data.teacherComment) setComment(data.teacherComment);
      setRows((current) =>
        current.map((row) => ({
          ...row,
          progress: data.areaProgress?.[row.name] || row.progress,
          award: row.award || data.awards?.[row.name] || "",
        })),
      );
      setAiNote("Draft filled. Edit anything, then save. Nothing is printed until you save.");
    } catch {
      setAiNote("Could not reach the comment service.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <form action="/api/marks" method="post" className="space-y-6">
      <input type="hidden" name="mode" value="early_years" />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="term" value={term} />

      <div className="overflow-hidden rounded-2xl border border-rule bg-vellum">
        <div className="border-b border-rule px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Early years progress</p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">{studentName}</h2>
          <p className="text-sm text-ink/60">
            {studentClass} · {term} · {year}. Write how the child is doing in each area. No marks are recorded.
          </p>
        </div>

        <ul className="divide-y divide-rule">
          {rows.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-ink/55">
              No learning areas yet. Add them on the Subjects page under Early Years.
            </li>
          ) : (
            rows.map((row, index) => (
              <li key={row.subjectId} className="px-4 py-4 sm:px-5">
                <input type="hidden" name="subjectId" value={row.subjectId} />
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-[family-name:var(--font-display)] text-lg leading-tight text-navy">
                    {row.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Award for ${row.name}`}>
                    {AWARD_LEVELS.map((award) => {
                      const active = row.award === award;
                      return (
                        <button
                          key={award}
                          type="button"
                          aria-pressed={active}
                          onClick={() => patch(index, { award: active ? "" : award })}
                          className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "border-[#16325c] bg-[#16325c] text-white"
                              : "border-rule bg-parchment text-navy hover:border-navy"
                          }`}
                        >
                          {award}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input type="hidden" name={`award_${row.subjectId}`} value={row.award} />
                <textarea
                  name={`progress_${row.subjectId}`}
                  value={row.progress}
                  onChange={(e) => patch(index, { progress: e.target.value })}
                  rows={2}
                  placeholder="How is the child progressing in this area?"
                  className="w-full rounded-xl border border-rule bg-parchment px-3 py-2 text-sm"
                />
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-rule bg-vellum p-5">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-brass">Comments</h3>
        <p className="mt-1 text-sm text-ink/70">
          Write the progress notes yourself above, or ask AI to draft them first. You can edit any AI draft. Nothing is
          printed until you save.
        </p>
        <label className="mt-4 block text-sm font-medium text-navy">Optional note for AI</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="loves songs and stories, shy with new people, holds a pencil well"
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
          <p className="text-sm text-ink/60">Awards you have already chosen are kept.</p>
        </div>
        {aiNote ? <p className="mt-2 text-sm text-navy">{aiNote}</p> : null}
      </div>

      <div className="rounded-2xl border border-rule bg-vellum p-5">
        <h3 className="mb-1 text-[11px] uppercase tracking-[0.2em] text-brass">Teacher&apos;s remarks</h3>
        <p className="mb-4 text-sm text-ink/55">This prints under the areas table, above your signature.</p>
        <textarea
          name="teacherComment"
          rows={6}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-xl border border-rule bg-parchment px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#16325c] px-6 py-3 text-sm font-semibold text-[#ffffff] hover:bg-[#0d1f3d] sm:w-auto"
      >
        Save progress and open report
      </button>
    </form>
  );
}
