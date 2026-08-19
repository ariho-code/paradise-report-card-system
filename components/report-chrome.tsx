import type { Settings, Student } from "@/lib/types";

/**
 * Shared furniture for both printed sheets. The senior report and the Early
 * Years report import from here so the crest, school name, motto, meta grid,
 * signature band and footer can never drift apart.
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
        gap: 14,
        paddingBottom: 2,
      }}
    >
      <img
        src="/logo.jpg"
        alt="Paradise Christian School"
        width={78}
        height={78}
        style={{ width: 78, height: 78, objectFit: "contain", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: DISPLAY,
            fontSize: 26,
            lineHeight: 1.08,
            color: NAVY,
            fontWeight: 700,
          }}
        >
          {settings.school_name}
        </h1>
        <p
          style={{
            margin: "3px 0 0",
            fontFamily: SANS,
            fontSize: 10,
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
    <div style={{ textAlign: "center", paddingBottom: 2 }}>
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
        marginBottom: 2,
      }}
    >
      <Meta label="Learner" value={student.name} isLastInRow={false} isLastColumn={false} />
      <Meta label="Class" value={classLabel || "—"} isLastInRow={false} isLastColumn={true} />
      <Meta label="Class adviser" value={student.adviser || "—"} isLastInRow={true} isLastColumn={false} />
      <Meta label="Grading period" value={`${term}, ${year}`} isLastInRow={true} isLastColumn={true} />
    </section>
  );
}

/**
 * Signing space for the two people who own the report. The clear area above
 * each rule is sized in millimetres and divided by --fit-scale, so a crowded
 * sheet that has been scaled down still leaves a full-size gap to sign in.
 */
export function SignatureBand({
  adviser,
  principal,
  space = 15,
}: {
  adviser: string;
  principal: string;
  space?: number;
}) {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34, alignItems: "end" }}>
      <SignatureSlot label="Class adviser" name={adviser} space={space} />
      <SignatureSlot label="Principal" name={principal} space={space} />
    </section>
  );
}

function SignatureSlot({ label, name, space }: { label: string; name: string; space: number }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="sig-space" style={{ "--sig-mm": `${space}mm` } as React.CSSProperties} />
      <div style={{ height: 1, background: NAVY }} />
      <p
        style={{
          margin: "5px 0 0",
          fontFamily: DISPLAY,
          fontSize: 13,
          color: NAVY,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name || "—"}
      </p>
      <p
        style={{
          margin: "1px 0 0",
          fontSize: 8,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        {label}
      </p>
    </div>
  );
}

export function ReportFooter({ settings }: { settings: Settings }) {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        borderTop: `1px solid ${LINE}`,
        paddingTop: 5,
      }}
    >
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 9, color: MUTED }}>
        Term opens · <strong style={{ color: NAVY }}>{settings.term_open || "—"}</strong>
        {"   ·   "}
        Ends · <strong style={{ color: NAVY }}>{settings.term_end || "—"}</strong>
      </p>
      <p style={{ margin: 0, fontSize: 8, color: BRASS, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Invalid without school stamp
      </p>
    </footer>
  );
}

export const panel: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 8,
  padding: 7,
  background: "rgba(255,255,255,0.86)",
};

export const panelHeader: React.CSSProperties = {
  background: NAVY,
  color: "#ffffff",
  padding: "5px 9px",
  margin: "-7px -7px 6px -7px",
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
        padding: "4px 9px",
        borderBottom: isLastInRow ? "none" : `1px solid ${LINE}`,
        borderRight: isLastColumn ? "none" : `1px solid ${LINE}`,
      }}
    >
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
        {label}
      </p>
      <p style={{ margin: "1px 0 0", fontFamily: DISPLAY, fontSize: 13, color: NAVY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
