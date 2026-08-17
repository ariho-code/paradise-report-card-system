import type { Settings, Student } from "@/lib/types";

/**
 * Shared furniture for both printed sheets. The senior report and the Early
 * Years report import from here so the crest, school name, motto, meta grid and
 * signature block can never drift apart.
 */

export const NAVY = "#16325c";
export const BRASS = "#a6853a";
export const GREEN = "#2f5a32";
export const LINE = "#d5dbe6";
export const INK = "#1a1f2b";
export const MUTED = "#5c6573";
export const DISPLAY = "var(--font-display), Fraunces, Georgia, serif";
export const SANS = "var(--font-sans), Figtree, sans-serif";
export const MONO = "var(--font-mono), 'IBM Plex Mono', monospace";

export function ReportHeader({ settings }: { settings: Settings }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        paddingBottom: 2,
      }}
    >
      <img
        src="/logo.jpg"
        alt="Paradise Christian School"
        width={130}
        height={130}
        style={{ width: 130, height: 130, objectFit: "contain", flexShrink: 0 }}
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
            margin: "4px 0 0",
            fontFamily: SANS,
            fontSize: 11,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: BRASS,
            fontWeight: 600,
          }}
        >
          {settings.motto}
        </p>
      </div>
    </header>
  );
}

export function ReportBanner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", paddingBottom: 4 }}>
      <p
        style={{
          display: "inline-block",
          margin: 0,
          padding: "4px 12px",
          background: NAVY,
          color: "#ffffff",
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export function ReportMeta({
  student,
  year,
  term,
}: {
  student: Student;
  year: string;
  term: string;
}) {
  const classLabel = [student.grade, student.section].filter(Boolean).join(" · ");
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        overflow: "hidden",
        background: "#ffffff",
        marginBottom: 4,
      }}
    >
      <Meta label="Learner" value={student.name} isLastInRow={false} isLastColumn={false} />
      <Meta label="Class" value={classLabel || "—"} isLastInRow={false} isLastColumn={true} />
      <Meta label="Class adviser" value={student.adviser || "—"} isLastInRow={true} isLastColumn={false} />
      <Meta label="Grading period" value={`${term}, ${year}`} isLastInRow={true} isLastColumn={true} />
    </section>
  );
}

export function ReportFooter({ settings }: { settings: Settings }) {
  return (
    <footer style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, paddingTop: 0 }}>
      <div>
        <p style={{ margin: 0, fontSize: 9, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Paradise Christian School
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 8, color: BRASS, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Invalid without school stamp
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ marginLeft: "auto", width: 190, height: 1, background: NAVY }} />
        <p style={{ margin: "12px 0 0", fontFamily: DISPLAY, fontSize: 16, color: NAVY }}>{settings.principal}</p>
        <p style={{ margin: "2px 0 0", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
          Principal
        </p>
      </div>
    </footer>
  );
}

export const panel: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 8,
  padding: 8,
  background: "rgba(255,255,255,0.86)",
};

export const panelHeader: React.CSSProperties = {
  background: NAVY,
  color: "#ffffff",
  padding: "6px 10px",
  margin: "-8px -8px 8px -8px",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 700,
  fontFamily: SANS,
};

function Meta({
  label,
  value,
  isLastInRow,
  isLastColumn,
}: {
  label: string;
  value: string;
  isLastInRow?: boolean;
  isLastColumn?: boolean;
}) {
  return (
    <div
      style={{
        padding: "5px 10px",
        borderBottom: isLastInRow ? "none" : `1px solid ${LINE}`,
        borderRight: isLastColumn ? "none" : `1px solid ${LINE}`,
      }}
    >
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
        {label}
      </p>
      <p style={{ margin: "1px 0 0", fontFamily: DISPLAY, fontSize: 14, color: NAVY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
