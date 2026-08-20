import { FitToPage } from "@/components/fit-to-page";
import {
  BRASS,
  GradeSeal,
  INK,
  LINE,
  MONO,
  MUTED,
  NAVY,
  ReportBanner,
  ReportFooter,
  ReportHeader,
  ReportMeta,
  SANS,
  SignatureBand,
  TYPE,
  gradeInk,
  panel,
  panelHeader,
} from "@/components/report-chrome";
import { GRADE_SCALE } from "@/lib/types";
import type { Mark, Settings, Student } from "@/lib/types";

/**
 * Page one: what the learner scored, and nothing that has to be read closely.
 *
 * The remark column carries the band word for the grade and only ever that.
 * Elaborate subject comments used to sit in this column, which forced the
 * whole sheet down to a size the school's printer could not resolve; they now
 * have a page of their own where they can be set at a readable size. See
 * <ReportCommentary />.
 */

/** The generic remarks the school asked for: one short phrase per band. */
const BAND_REMARK: Record<string, string> = {
  A: "Excellent",
  B: "Good work",
  C: "Fair effort",
  D: "Work harder",
  E: "Work much harder",
  F: "Needs close support",
  U: "Not assessed",
};

export function bandRemark(grade: string) {
  return BAND_REMARK[grade] || BAND_REMARK.U;
}

/**
 * The grading key is a legend, not a table. One titled panel with the six bands
 * on an even grid reads at a glance and costs a fraction of the third of a page
 * the old stacked panel took. Equal columns keep the seals on a common baseline
 * however wide the sheet is scaled.
 */
function GradingKeyPanel() {
  const bands = GRADE_SCALE.filter((row) => row.grade !== "U");
  return (
    <section style={panel}>
      <div style={panelHeader}>Grading key</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${bands.length}, 1fr)`, gap: 6 }}>
        {bands.map((row, i) => (
          <div
            key={row.grade}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textAlign: "center",
              borderLeft: i === 0 ? "none" : `1px solid ${LINE}`,
            }}
          >
            <GradeSeal grade={row.grade} />
            <span style={{ fontFamily: MONO, fontSize: TYPE.fine, color: MUTED, whiteSpace: "nowrap" }}>{row.range}</span>
            <span style={{ fontFamily: SANS, fontSize: TYPE.fine, color: INK }}>{row.meaning}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportCard({
  student,
  settings,
  year,
  term,
  marks,
  hasCommentary,
}: {
  student: Student;
  settings: Settings;
  year: string;
  term: string;
  marks: Mark[];
  /** Whether a commentary sheet follows, so the footer can say so. */
  hasCommentary?: boolean;
}) {
  // Skills carry a written comment instead of marks, so they are named here
  // and written about overleaf rather than printed as a row of dashes.
  const graded = marks.filter((row) => row.graded !== false);
  const skills = marks.filter((row) => row.graded === false);

  return (
    <article className="print-sheet">
      <img className="print-watermark" src="/logo.jpg" alt="" />
      <FitToPage>
        <ReportHeader settings={settings} />
        <ReportBanner label="Academic Progress Report" />
        <ReportMeta student={student} year={year} term={term} />

        <section style={{ border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden", background: "#ffffff" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: TYPE.table,
              fontFamily: SANS,
            }}
          >
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff" }}>
                <th style={{ ...head, textAlign: "left" }}>Subject</th>
                <th style={{ ...head, width: "12%" }}>Test</th>
                <th style={{ ...head, width: "12%" }}>EOT</th>
                <th style={{ ...head, width: "12%" }}>Grade</th>
                <th style={{ ...head, width: "27%", textAlign: "left" }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {graded.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: "center", color: MUTED, fontStyle: "italic" }}>
                    No marks have been entered for this period.
                  </td>
                </tr>
              ) : (
                graded.map((row, i) => (
                  <tr key={row.subject_id} style={{ background: i % 2 ? "#f7f9fc" : "#ffffff" }}>
                    <td style={{ ...cell, fontWeight: 600, color: NAVY }}>{row.subject_name}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.test ?? "—"}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.eot ?? "—"}</td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <GradeSeal grade={row.grade} />
                    </td>
                    <td
                      style={{
                        ...cell,
                        fontSize: TYPE.remark,
                        fontWeight: 600,
                        color: row.missed ? MUTED : gradeInk(row.grade),
                      }}
                    >
                      {row.missed ? "Absent" : bandRemark(row.grade)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {skills.length > 0 ? (
          <section
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
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
              Also taking
            </span>
            {skills.map((row) => (
              <span
                key={row.subject_id}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: `1px solid ${LINE}`,
                  background: "#f7f9fc",
                  fontFamily: SANS,
                  fontSize: TYPE.remark,
                  fontWeight: 600,
                  color: NAVY,
                }}
              >
                {row.subject_name}
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: SANS, fontSize: TYPE.fine, color: BRASS }}>
              Assessed by comment overleaf
            </span>
          </section>
        ) : null}

        <GradingKeyPanel />

        <SignatureBand adviser={student.adviser || ""} principal={settings.principal} />

        <ReportFooter settings={settings} note={hasCommentary ? "Teachers’ comments overleaf" : undefined} />
      </FitToPage>
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
  padding: "5px 8px",
  borderTop: `1px solid ${LINE}`,
  verticalAlign: "middle",
};

const cellMono: React.CSSProperties = {
  ...cell,
  textAlign: "center",
  fontFamily: MONO,
  fontSize: TYPE.remark,
  color: INK,
};
