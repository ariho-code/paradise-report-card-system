import {
  BRASS,
  DISPLAY,
  GREEN,
  INK,
  LINE,
  MUTED,
  NAVY,
  ReportBanner,
  ReportFooter,
  ReportHeader,
  ReportMeta,
  SANS,
  SignatureBand,
  TYPE,
  panel,
  panelHeader,
} from "@/components/report-chrome";
import { AWARD_LEVELS } from "@/lib/types";
import type { AreaProgress, Settings, Student, Subject } from "@/lib/types";

/**
 * The Early Years report is narrative all the way down: the seven areas are
 * described rather than marked, so there is no table of figures to hold to a
 * page. It therefore flows like the senior commentary sheet — a full page at
 * minimum, running onto a second when a teacher has written at length —
 * instead of being scaled down to fit. Scaling is what made it print at around
 * 8pt; the writing is the whole document and has to be readable.
 */
function AwardChip({ award }: { award: string }) {
  const tone: Record<string, { bg: string; color: string; border: string }> = {
    Impressive: { bg: GREEN, color: "#ffffff", border: GREEN },
    "Very Good": { bg: NAVY, color: "#ffffff", border: NAVY },
    Good: { bg: BRASS, color: "#ffffff", border: BRASS },
  };
  const look = tone[award];
  if (!look) {
    return <span style={{ color: MUTED, fontSize: TYPE.remark }}>—</span>;
  }
  return (
    <span
      className="grade-seal"
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: SANS,
        fontSize: TYPE.fine,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {award}
    </span>
  );
}

export function EarlyYearsReport({
  student,
  settings,
  year,
  term,
  areas,
  progress,
  teacherComment,
}: {
  student: Student;
  settings: Settings;
  year: string;
  term: string;
  areas: Subject[];
  progress: AreaProgress[];
  teacherComment: string;
}) {
  // The areas are the structure of this document, so every area the learner
  // takes prints whether or not the teacher has filled it in yet.
  const saved = new Map(progress.map((row) => [row.subject_id, row]));
  const rows = areas.map((area) => ({
    id: area.id,
    name: area.name,
    progress: saved.get(area.id)?.progress || "",
    award: saved.get(area.id)?.award || "",
  }));

  return (
    <article className="print-flow-sheet">
      <ReportHeader settings={settings} />
      <ReportBanner label="Early Years Progress Report" />
      <ReportMeta student={student} year={year} term={term} />

      <section
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: TYPE.narrative,
            fontFamily: SANS,
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr style={{ background: NAVY, color: "#ffffff" }}>
              <th style={{ ...head, width: "27%", textAlign: "left" }}>Area tracked</th>
              <th style={{ ...head, textAlign: "left" }}>Progress</th>
              <th style={{ ...head, width: "17%" }}>Award</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 20, textAlign: "center", color: MUTED, fontStyle: "italic" }}>
                  No learning areas are set for this class.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id} className="print-block" style={{ background: i % 2 ? "#f7f9fc" : "#ffffff" }}>
                  <td
                    style={{
                      ...cell,
                      fontSize: TYPE.table,
                      fontWeight: 600,
                      color: NAVY,
                      lineHeight: 1.3,
                    }}
                  >
                    {row.name}
                  </td>
                  <td
                    style={{
                      ...cell,
                      borderLeft: `1px solid ${LINE}`,
                      color: INK,
                      lineHeight: TYPE.narrativeLine,
                    }}
                  >
                    {row.progress || <span style={{ color: MUTED }}>—</span>}
                  </td>
                  <td style={{ ...cell, borderLeft: `1px solid ${LINE}`, textAlign: "center" }}>
                    <AwardChip award={row.award} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div
        className="print-block"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          padding: "6px 10px",
          background: "#ffffff",
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: TYPE.label,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: MUTED,
            fontWeight: 700,
          }}
        >
          Key word
        </span>
        {AWARD_LEVELS.map((award) => (
          <AwardChip key={award} award={award} />
        ))}
      </div>

      <div className="print-flow-tail">
        <section style={panel} className="print-block">
          <div style={panelHeader}>Teacher&apos;s remarks</div>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: DISPLAY,
              fontSize: TYPE.overall,
              lineHeight: 1.5,
              color: INK,
            }}
          >
            {teacherComment || "—"}
          </p>
        </section>

        <SignatureBand adviser={student.adviser || ""} principal={settings.principal} />

        <ReportFooter settings={settings} />
      </div>
    </article>
  );
}

const head: React.CSSProperties = {
  padding: "6px 8px",
  fontWeight: 600,
  fontSize: TYPE.remark,
  letterSpacing: "0.04em",
};

const cell: React.CSSProperties = {
  padding: "8px",
  borderTop: `1px solid ${LINE}`,
  verticalAlign: "top",
};
