import { GRADE_SCALE } from "@/lib/types";
import type { CharacterMark, Mark, Settings, Student } from "@/lib/types";

const NAVY = "#16325c";
const BRASS = "#a6853a";
const GREEN = "#2f5a32";
const LINE = "#d0d7e2";
const INK = "#1a1f2b";
const MUTED = "#5b6475";

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
    <article className="print-sheet" style={{ background: "#ffffff", color: INK, boxSizing: "border-box" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 16px 12px",
          borderBottom: `3px solid ${NAVY}`,
          background: "#ffffff",
        }}
      >
        <img
          src="/logo.jpg"
          alt="Paradise Christian School"
          width={72}
          height={72}
          style={{ width: 72, height: 72, objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 26,
              lineHeight: 1.1,
              color: NAVY,
              fontWeight: 700,
            }}
          >
            {settings.school_name}
          </p>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: 11,
              letterSpacing: "0.32em",
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
              margin: "8px 0 0",
              padding: "4px 12px",
              background: NAVY,
              color: "#ffffff",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            Report card · {term} · {year}
          </p>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${LINE}` }}>
        <Meta label="Learner" value={student.name} />
        <Meta label="Class" value={classLabel || "—"} />
        <Meta label="Class adviser" value={student.adviser || "—"} />
        <Meta label="Grading period" value={`${term}, ${year}`} />
      </section>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: NAVY, color: "#ffffff" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>Subject</th>
            <th style={{ width: 58, padding: "8px 6px", fontWeight: 600 }}>Test</th>
            <th style={{ width: 58, padding: "8px 6px", fontWeight: 600 }}>EOT</th>
            <th style={{ width: 64, padding: "8px 6px", fontWeight: 600 }}>Grade</th>
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
                <td style={{ padding: "7px 12px", borderBottom: `1px solid ${LINE}`, fontWeight: 600, color: NAVY }}>
                  {row.subject_name}
                </td>
                <td
                  style={{
                    padding: "7px 6px",
                    borderBottom: `1px solid ${LINE}`,
                    textAlign: "center",
                    fontFamily: "ui-monospace, Menlo, monospace",
                  }}
                >
                  {row.missed ? "—" : row.test ?? "—"}
                </td>
                <td
                  style={{
                    padding: "7px 6px",
                    borderBottom: `1px solid ${LINE}`,
                    textAlign: "center",
                    fontFamily: "ui-monospace, Menlo, monospace",
                  }}
                >
                  {row.missed ? "—" : row.eot ?? "—"}
                </td>
                <td style={{ padding: "7px 6px", borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
                  <GradeSeal grade={row.grade} />
                </td>
                <td style={{ padding: "7px 12px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontStyle: "italic" }}>
                  {row.missed ? "Absent / not assessed" : row.comment || remarkFromGrade(row.grade)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${LINE}` }}>
        <div style={{ padding: "12px 14px", borderRight: `1px solid ${LINE}` }}>
          <SectionTitle>Character</SectionTitle>
          {characters.map((row) => (
            <div
              key={row.trait}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "6px 0",
                borderBottom: `1px solid ${LINE}`,
                fontSize: 13,
              }}
            >
              <strong style={{ color: NAVY }}>{row.trait}</strong>
              <span style={{ fontStyle: "italic", color: MUTED, textAlign: "right" }}>{row.remark || "—"}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <SectionTitle>Grading key</SectionTitle>
          {GRADE_SCALE.filter((row) => row.grade !== "U").map((row) => (
            <div key={row.grade} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
              <GradeSeal grade={row.grade} />
              <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, color: MUTED, width: 86 }}>
                {row.range}
              </span>
              <span style={{ fontSize: 13 }}>{row.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", borderTop: `1px solid ${LINE}` }}>
        <div style={{ padding: "12px 14px", borderRight: `1px solid ${LINE}` }}>
          <SectionTitle>Term dates</SectionTitle>
          <p style={{ margin: "10px 0 0", fontSize: 14 }}>Opens · {settings.term_open || "—"}</p>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>Ends · {settings.term_end || "—"}</p>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <SectionTitle>Teacher&apos;s comment</SectionTitle>
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 14,
              lineHeight: 1.45,
              color: INK,
            }}
          >
            {teacherComment || "—"}
          </p>
        </div>
      </section>

      <footer
        style={{
          marginTop: "auto",
          background: NAVY,
          color: "#ffffff",
          textAlign: "center",
          padding: "10px 14px",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <strong style={{ display: "block", color: "#e8d7a0", fontSize: 14 }}>Signed: {settings.principal}</strong>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Principal — {settings.school_name}
        </span>
      </footer>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
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
    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{label}</p>
      <p style={{ margin: "3px 0 0", fontFamily: "Georgia, serif", fontSize: 16, color: NAVY, fontWeight: 700 }}>{value}</p>
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
