import { GRADE_SCALE } from "@/lib/types";
import type { CharacterMark, Mark, Settings, Student } from "@/lib/types";

const NAVY = "#16325c";
const BRASS = "#a6853a";
const GREEN = "#2f5a32";
const LINE = "#d5dbe6";
const INK = "#1a1f2b";
const MUTED = "#5c6573";

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
        minWidth: 28,
        height: 24,
        lineHeight: "22px",
        padding: "0 7px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 13,
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
  const classLabel = [student.grade, student.section].filter(Boolean).join(" · ");

  return (
    <article className="print-sheet">
      <div className="print-inner">
        <header style={{ textAlign: "center", paddingBottom: 4 }}>
          <img
            src="/logo.jpg"
            alt="Paradise Christian School"
            width={86}
            height={86}
            style={{ width: 86, height: 86, objectFit: "contain", display: "block", margin: "0 auto" }}
          />
          <h1
            style={{
              margin: "12px 0 0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 28,
              lineHeight: 1.15,
              color: NAVY,
              fontWeight: 700,
            }}
          >
            {settings.school_name}
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: BRASS,
              fontWeight: 600,
            }}
          >
            {settings.motto}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px auto 0", maxWidth: 460 }}>
            <span style={{ flex: 1, height: 1, background: NAVY }} />
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: NAVY,
                fontWeight: 700,
              }}
            >
              Academic Progress Report
            </span>
            <span style={{ flex: 1, height: 1, background: NAVY }} />
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GREEN,
            }}
          >
            {term} · {year}
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: `1px solid ${LINE}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Meta label="Learner" value={student.name} />
          <Meta label="Class" value={classLabel || "—"} />
          <Meta label="Class adviser" value={student.adviser || "—"} />
          <Meta label="Grading period" value={`${term}, ${year}`} />
        </section>

        <section style={{ border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600 }}>Subject</th>
                <th style={{ width: 70, padding: "10px 8px", fontWeight: 600 }}>Test</th>
                <th style={{ width: 70, padding: "10px 8px", fontWeight: 600 }}>EOT</th>
                <th style={{ width: 76, padding: "10px 8px", fontWeight: 600 }}>Grade</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600 }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 28, textAlign: "center", color: MUTED, fontStyle: "italic" }}>
                    No marks have been entered for this period.
                  </td>
                </tr>
              ) : (
                marks.map((row, i) => (
                  <tr key={row.subject_id} style={{ background: i % 2 ? "#f7f9fc" : "#ffffff" }}>
                    <td style={{ padding: "9px 14px", borderTop: `1px solid ${LINE}`, fontWeight: 600, color: NAVY }}>
                      {row.subject_name}
                    </td>
                    <td style={cellMono}>{row.missed ? "—" : row.test ?? "—"}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.eot ?? "—"}</td>
                    <td style={{ ...cellMono, paddingTop: 7, paddingBottom: 7 }}>
                      <GradeSeal grade={row.grade} />
                    </td>
                    <td style={{ padding: "9px 14px", borderTop: `1px solid ${LINE}`, color: MUTED, fontStyle: "italic" }}>
                      {row.missed ? "Absent / not assessed" : row.comment || remarkFromGrade(row.grade)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="print-grow" />

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={panel}>
            <SectionTitle>Character</SectionTitle>
            {characters.map((row) => (
              <div key={row.trait} style={rowLine}>
                <strong style={{ color: NAVY }}>{row.trait}</strong>
                <span style={{ fontStyle: "italic", color: MUTED, textAlign: "right" }}>{row.remark || "—"}</span>
              </div>
            ))}
          </div>
          <div style={panel}>
            <SectionTitle>Grading key</SectionTitle>
            {GRADE_SCALE.filter((row) => row.grade !== "U").map((row) => (
              <div key={row.grade} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <GradeSeal grade={row.grade} />
                <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, color: MUTED, width: 90 }}>
                  {row.range}
                </span>
                <span style={{ fontSize: 13 }}>{row.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={panel}>
          <SectionTitle>Teacher&apos;s comment</SectionTitle>
          <p
            style={{
              margin: "12px 0 0",
              minHeight: 64,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 15,
              lineHeight: 1.55,
              color: INK,
            }}
          >
            {teacherComment || "—"}
          </p>
        </section>

        <footer style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={panel}>
            <SectionTitle>Term dates</SectionTitle>
            <p style={{ margin: "12px 0 0", fontSize: 14 }}>Opens · {settings.term_open || "—"}</p>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>Ends · {settings.term_end || "—"}</p>
          </div>
          <div style={{ ...panel, textAlign: "right" }}>
            <div style={{ margin: "22px 0 0 auto", width: 200, height: 1, background: NAVY }} />
            <p style={{ margin: "10px 0 0", fontFamily: "Georgia, serif", fontSize: 18, color: NAVY }}>
              {settings.principal}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
              Principal
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

const cellMono: React.CSSProperties = {
  padding: "9px 8px",
  borderTop: `1px solid ${LINE}`,
  textAlign: "center",
  fontFamily: "ui-monospace, Menlo, monospace",
};

const panel: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  padding: 16,
  background: "#ffffff",
};

const rowLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "8px 0",
  borderBottom: `1px solid ${LINE}`,
  fontSize: 13,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: BRASS,
        fontWeight: 700,
      }}
    >
      {children}
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>{label}</p>
      <p style={{ margin: "5px 0 0", fontFamily: "Georgia, serif", fontSize: 17, color: NAVY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

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
