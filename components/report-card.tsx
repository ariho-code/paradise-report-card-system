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
        // Sized by padding, with no explicit height or line-height. The award
        // chips on the Early Years sheet are built the same way, and it is the
        // only form html2canvas centres the letter in for the PDF export.
        padding: "1px 5px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: DISPLAY,
        fontSize: 10.5,
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
 * The grading key is a legend, not a table. Reading it as one horizontal strip
 * costs a couple of lines instead of the third of a page a stacked panel took,
 * and matches the key word strip on the Early Years sheet.
 */
function GradingKeyStrip() {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "4px 14px",
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        padding: "5px 10px",
        background: "#ffffff",
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 8,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: MUTED,
          fontWeight: 700,
        }}
      >
        Grading key
      </span>
      {GRADE_SCALE.filter((row) => row.grade !== "U").map((row) => (
        <span key={row.grade} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <GradeSeal grade={row.grade} />
          <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}>{row.range}</span>
          <span style={{ fontFamily: SANS, fontSize: 10 }}>{row.meaning}</span>
        </span>
      ))}
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

        <div className="print-grow" />

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 8, alignItems: "start" }}>
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

        <GradingKeyStrip />

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
