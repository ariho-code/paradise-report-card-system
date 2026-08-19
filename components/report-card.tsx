import { FitToPage } from "@/components/fit-to-page";
import {
  BRASS,
  DISPLAY,
  GREEN,
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
  panel,
  panelHeader,
} from "@/components/report-chrome";
import { GRADE_SCALE } from "@/lib/types";
import type { CharacterMark, Mark, Settings, Student } from "@/lib/types";

function GradeSeal({ grade }: { grade: string }) {
  const tone: Record<string, { bg: string; color: string; border: string }> = {
    A: { bg: GREEN, color: "#ffffff", border: GREEN },
    B: { bg: NAVY, color: "#ffffff", border: NAVY },
    C: { bg: BRASS, color: "#ffffff", border: BRASS },
    D: { bg: "#fff4d6", color: "#7a5c00", border: BRASS },
    E: { bg: "#fdecec", color: "#8c2f2f", border: "#8c2f2f" },
    F: { bg: "#8c2f2f", color: "#ffffff", border: "#8c2f2f" },
    U: { bg: "#f1f5f9", color: MUTED, border: LINE },
  };
  const look = tone[grade] || tone.U;
  return (
    <span
      className="grade-seal"
      style={{
        display: "inline-block",
        minWidth: 22,
        // line-height must equal the font size. The sheet inherits a 1.5
        // line-height, and html2canvas puts the whole of that leading above
        // the glyph instead of splitting it, dropping the letter half out of
        // its seal in the downloaded PDF. With no leading there is nothing for
        // it to misplace, and the padding alone centres the grade.
        lineHeight: 1,
        padding: "4px 5px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: DISPLAY,
        fontSize: 11,
        fontWeight: 800,
        textAlign: "center",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {grade}
    </span>
  );
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
              gap: 2,
              textAlign: "center",
              borderLeft: i === 0 ? "none" : `1px solid ${LINE}`,
            }}
          >
            <GradeSeal grade={row.grade} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED, whiteSpace: "nowrap" }}>{row.range}</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, color: INK }}>{row.meaning}</span>
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
  characters,
  teacherComment,
}: {
  student: Student;
  settings: Settings;
  year: string;
  term: string;
  marks: Mark[];
  characters: CharacterMark[];
  teacherComment: string;
}) {
  // Skills carry a written comment instead of marks, so they print in their
  // own block rather than as a row of dashes in the marks table.
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, fontFamily: SANS }}>
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Subject</th>
                <th style={{ width: 55, padding: "4px 4px", fontWeight: 600 }}>Test</th>
                <th style={{ width: 55, padding: "4px 4px", fontWeight: 600 }}>EOT</th>
                <th style={{ width: 56, padding: "4px 4px", fontWeight: 600 }}>Grade</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Remark</th>
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
                    <td style={{ padding: "2px 8px", borderTop: `1px solid ${LINE}`, fontWeight: 600, color: NAVY }}>
                      {row.subject_name}
                    </td>
                    <td style={cellMono}>{row.missed ? "—" : row.test ?? "—"}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.eot ?? "—"}</td>
                    <td style={{ ...cellMono, paddingTop: 3, paddingBottom: 3 }}>
                      <GradeSeal grade={row.grade} />
                    </td>
                    <td style={{ padding: "2px 8px", borderTop: `1px solid ${LINE}`, color: MUTED, fontStyle: "italic" }}>
                      {row.missed ? "Absent / not assessed" : row.comment || remarkFromGrade(row.grade)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {skills.length > 0 ? (
          <section style={panel}>
            <div style={panelHeader}>Skills</div>
            {skills.map((row) => (
              <div key={row.subject_id} style={rowLine}>
                <strong style={{ color: NAVY, whiteSpace: "nowrap" }}>{row.subject_name}</strong>
                <span style={{ fontStyle: "italic", color: MUTED, textAlign: "right" }}>
                  {row.comment || "—"}
                </span>
              </div>
            ))}
          </section>
        ) : null}

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 8 }}>
          <div style={panel}>
            <div style={panelHeader}>Character</div>
            {characters.map((row) => (
              <div key={row.trait} style={rowLine}>
                <strong style={{ color: NAVY }}>{row.trait}</strong>
                <span style={{ fontStyle: "italic", color: MUTED, textAlign: "right" }}>{row.remark || "—"}</span>
              </div>
            ))}
          </div>
          <div style={panel}>
            <div style={panelHeader}>Teacher&apos;s comment</div>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: DISPLAY,
                fontSize: 12.5,
                lineHeight: 1.4,
                color: INK,
              }}
            >
              {teacherComment || "—"}
            </p>
          </div>
        </section>

        <GradingKeyPanel />

        <SignatureBand adviser={student.adviser || ""} principal={settings.principal} />

        <ReportFooter settings={settings} />
      </FitToPage>
    </article>
  );
}

const cellMono: React.CSSProperties = {
  padding: "2px 5px",
  borderTop: `1px solid ${LINE}`,
  textAlign: "center",
  fontFamily: MONO,
  fontSize: 10,
};

const rowLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "2px 0",
  borderBottom: `1px solid ${LINE}`,
  fontSize: 10,
};

function remarkFromGrade(grade: string) {
  const map: Record<string, string> = {
    A: "Excellent work",
    B: "Good progress",
    C: "Keep it up",
    D: "Needs more effort",
    E: "More effort needed",
    F: "Needs significant improvement",
    U: "Not assessed",
  };
  return map[grade] || "";
}
