import { GRADE_SCALE } from "@/lib/types";
import type { CharacterMark, Mark, Settings, Student } from "@/lib/types";

const NAVY = "#16325c";
const BRASS = "#a6853a";
const GREEN = "#2f5a32";
const LINE = "#d5dbe6";
const INK = "#1a1f2b";
const MUTED = "#5c6573";
const DISPLAY = "var(--font-display), Fraunces, Georgia, serif";
const SANS = "var(--font-sans), Figtree, sans-serif";
const MONO = "var(--font-mono), 'IBM Plex Mono', monospace";

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
  const classLabel = [student.grade, student.section].filter(Boolean).join(" · ");

  return (
    <article className="print-sheet">
      <img className="print-watermark" src="/logo.jpg" alt="" />
      <div className="print-inner">
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            paddingBottom: 4,
          }}
        >
          <img
            src="/logo.jpg"
            alt="Paradise Christian School"
            width={108}
            height={108}
            style={{ width: 108, height: 108, objectFit: "contain", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: DISPLAY,
                fontSize: 32,
                lineHeight: 1.08,
                color: NAVY,
                fontWeight: 700,
              }}
            >
              {settings.school_name}
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: SANS,
                fontSize: 12,
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                color: BRASS,
                fontWeight: 600,
              }}
            >
              {settings.motto}
            </p>
            <p
              style={{
                display: "inline-block",
                margin: "12px 0 0",
                padding: "5px 14px",
                background: NAVY,
                color: "#ffffff",
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 700,
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              Academic Progress Report
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: GREEN,
              }}
            >
              {term} · {year}
            </p>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          <Meta label="Learner" value={student.name} />
          <Meta label="Class" value={classLabel || "—"} />
          <Meta label="Class adviser" value={student.adviser || "—"} />
          <Meta label="Grading period" value={`${term}, ${year}`} />
        </section>

        <section style={{ border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden", background: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: SANS }}>
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>Subject</th>
                <th style={{ width: 62, padding: "8px 6px", fontWeight: 600 }}>Test</th>
                <th style={{ width: 62, padding: "8px 6px", fontWeight: 600 }}>EOT</th>
                <th style={{ width: 68, padding: "8px 6px", fontWeight: 600 }}>Grade</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>Remark</th>
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
                    <td style={{ padding: "6px 12px", borderTop: `1px solid ${LINE}`, fontWeight: 600, color: NAVY }}>
                      {row.subject_name}
                    </td>
                    <td style={cellMono}>{row.missed ? "—" : row.test ?? "—"}</td>
                    <td style={cellMono}>{row.missed ? "—" : row.eot ?? "—"}</td>
                    <td style={{ ...cellMono, paddingTop: 5, paddingBottom: 5 }}>
                      <GradeSeal grade={row.grade} />
                    </td>
                    <td style={{ padding: "6px 12px", borderTop: `1px solid ${LINE}`, color: MUTED, fontStyle: "italic" }}>
                      {row.missed ? "Absent / not assessed" : row.comment || remarkFromGrade(row.grade)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="print-grow" />

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              <div key={row.grade} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <GradeSeal grade={row.grade} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, width: 86 }}>{row.range}</span>
                <span style={{ fontSize: 12 }}>{row.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 12 }}>
          <div style={panel}>
            <SectionTitle>Term dates</SectionTitle>
            <p style={{ margin: "10px 0 0", fontSize: 13, fontFamily: SANS }}>Opens · {settings.term_open || "—"}</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, fontFamily: SANS }}>Ends · {settings.term_end || "—"}</p>
          </div>
          <div style={panel}>
            <SectionTitle>Teacher&apos;s comment</SectionTitle>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: DISPLAY,
                fontSize: 14,
                lineHeight: 1.45,
                color: INK,
              }}
            >
              {teacherComment || "—"}
            </p>
          </div>
        </section>

        <footer style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, paddingTop: 4 }}>
          <p style={{ margin: 0, fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Paradise Christian School
          </p>
          <div style={{ textAlign: "right" }}>
            <div style={{ marginLeft: "auto", width: 190, height: 1, background: NAVY }} />
            <p style={{ margin: "8px 0 0", fontFamily: DISPLAY, fontSize: 16, color: NAVY }}>{settings.principal}</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
              Principal
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

const cellMono: React.CSSProperties = {
  padding: "6px 6px",
  borderTop: `1px solid ${LINE}`,
  textAlign: "center",
  fontFamily: MONO,
};

const panel: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 8,
  padding: 12,
  background: "rgba(255,255,255,0.86)",
};

const rowLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "5px 0",
  borderBottom: `1px solid ${LINE}`,
  fontSize: 12,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: SANS,
        fontSize: 10,
        letterSpacing: "0.16em",
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
    <div style={{ padding: "9px 14px", borderBottom: `1px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
        {label}
      </p>
      <p style={{ margin: "3px 0 0", fontFamily: DISPLAY, fontSize: 16, color: NAVY, fontWeight: 700 }}>{value}</p>
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
