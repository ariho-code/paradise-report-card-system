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
        minWidth: 26,
        height: 22,
        lineHeight: "20px",
        padding: "0 6px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: DISPLAY,
        fontSize: 12,
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
  return (
    <article className="print-sheet">
      <img className="print-watermark" src="/logo.jpg" alt="" />
      <div className="print-inner">
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
                <th style={{ width: 60, padding: "4px 4px", fontWeight: 600 }}>Grade</th>
                <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 600 }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: "center", color: MUTED, fontStyle: "italic" }}>
                    No marks have been entered for this period.
                  </td>
                </tr>
              ) : (
                marks.map((row, i) => (
                  <tr key={row.subject_id} style={{ background: i % 2 ? "#f7f9fc" : "#ffffff" }}>
                    <td style={{ padding: "3px 8px", borderTop: `1px solid ${LINE}`, fontWeight: 600, color: NAVY }}>
                      {row.subject_name}
                    </td>
                    <td style={cellMono}>{row.missed ? "—" : row.test ?? "—"}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.eot ?? "—"}</td>
                    <td style={{ ...cellMono, paddingTop: 5, paddingBottom: 5 }}>
                      <GradeSeal grade={row.grade} />
                    </td>
                    <td style={{ padding: "3px 8px", borderTop: `1px solid ${LINE}`, color: MUTED, fontStyle: "italic" }}>
                      {row.missed ? "Absent / not assessed" : row.comment || remarkFromGrade(row.grade)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="print-grow" />

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
            <div style={panelHeader}>Grading key</div>
            {GRADE_SCALE.filter((row) => row.grade !== "U").map((row) => (
              <div key={row.grade} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <GradeSeal grade={row.grade} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, width: 86 }}>{row.range}</span>
                <span style={{ fontSize: 12 }}>{row.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 8 }}>
          <div style={panel}>
            <div style={panelHeader}>Term dates</div>
            <p style={{ margin: "10px 0 0", fontSize: 13, fontFamily: SANS }}>Opens · {settings.term_open || "—"}</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, fontFamily: SANS }}>Ends · {settings.term_end || "—"}</p>
          </div>
          <div style={panel}>
            <div style={panelHeader}>Teacher&apos;s comment</div>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: DISPLAY,
                fontSize: 13,
                lineHeight: 1.4,
                color: INK,
                maxHeight: 80,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
              }}
            >
              {teacherComment || "—"}
            </p>
          </div>
        </section>

        <ReportFooter settings={settings} />
      </div>
    </article>
  );
}

const cellMono: React.CSSProperties = {
  padding: "3px 5px",
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
