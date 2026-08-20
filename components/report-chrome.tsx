import type { Settings, Student } from "@/lib/types";

/**
 * Shared furniture for the printed sheets. Every report — the senior summary,
 * its commentary page and the Early Years report — imports from here so the
 * crest, school name, motto, meta grid, signature band and footer can never
 * drift apart.
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

/**
 * One type scale for both sheets, in px, because everything here is laid out
 * in px against a page measured in mm.
 *
 * The conversion that matters: CSS px are 1/96in and points are 1/72in, so a
 * printed size in points is the px size times 0.75. Trade printing guidance
 * puts 9pt at the floor for body copy and 10–11pt at comfortable, which makes
 * 12px the smallest size any sentence on these sheets may be set in, and 13px
 * the working size for the marks table. The sheet used to run 8–10.5px — 6 to
 * 7.9pt — which is why it came off the school's printer unreadable.
 *
 * Anything below 12px here is a label, never a sentence: uppercase, letter
 * spaced and read as a heading rather than as running text.
 */
export const TYPE = {
  /** Marks table rows, and the subject names beside them. 9.75pt. */
  table: 13,
  /** The short band remark in the last column of the marks table. 9.4pt. */
  remark: 12.5,
  /** Narrative: subject commentary, character notes, area progress. 9.4pt. */
  narrative: 12.5,
  /** Leading for narrative. Long comments need the extra air more than short ones. */
  narrativeLine: 1.5,
  /** The class teacher's overall comment, the one paragraph parents always read. 10.5pt. */
  overall: 14,
  /** Field values in the meta grid and the names under the signature rules. */
  value: 15,
  /** Uppercase field labels and section headers. Never a sentence. */
  label: 9,
  /** Footer rules and the grading key. */
  fine: 11,
} as const;

/**
 * The letter grade as a badge. Lives here because both the marks table on the
 * summary sheet and the subject commentary overleaf stamp the same grade, and
 * a parent comparing the two must not see two different-looking seals.
 */
export function GradeSeal({ grade }: { grade: string }) {
  const look = GRADE_TONE[grade] || GRADE_TONE.U;
  return (
    <span
      className="grade-seal"
      style={{
        display: "inline-block",
        minWidth: 24,
        // A badge sizes itself: with no leading of its own the padding alone
        // decides how much room sits around the letter, so the seal keeps its
        // shape wherever it is used and does not inherit the sheet's line
        // height and grow a lopsided gap above the grade.
        lineHeight: 1,
        padding: "4px 6px",
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

const GRADE_TONE: Record<string, { bg: string; color: string; border: string; ink: string }> = {
  A: { bg: GREEN, color: "#ffffff", border: GREEN, ink: GREEN },
  B: { bg: NAVY, color: "#ffffff", border: NAVY, ink: NAVY },
  C: { bg: BRASS, color: "#ffffff", border: BRASS, ink: "#7a5c00" },
  D: { bg: "#fff4d6", color: "#7a5c00", border: BRASS, ink: "#7a5c00" },
  E: { bg: "#fdecec", color: "#8c2f2f", border: "#8c2f2f", ink: "#8c2f2f" },
  F: { bg: "#8c2f2f", color: "#ffffff", border: "#8c2f2f", ink: "#8c2f2f" },
  U: { bg: "#f1f5f9", color: MUTED, border: LINE, ink: MUTED },
};

/** Text colour that matches a grade's seal, dark enough to read as body copy. */
export function gradeInk(grade: string) {
  return (GRADE_TONE[grade] || GRADE_TONE.U).ink;
}

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

/**
 * The masthead for a continuation sheet. A page of commentary can be separated
 * from the summary it belongs to — filed, photocopied, handed to one subject
 * teacher — so it names the school and the learner in its own right rather
 * than relying on the sheet before it.
 */
export function ReportContinuationHeader({
  settings,
  student,
  year,
  term,
  label,
}: {
  settings: Settings;
  student: Student;
  year: string;
  term: string;
  label: string;
}) {
  const classLabel = [student.grade, student.section].filter(Boolean).join(" · ");
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: `2px solid ${NAVY}`,
        paddingBottom: 8,
      }}
    >
      <img
        src="/logo.jpg"
        alt=""
        width={40}
        height={40}
        style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 17, color: NAVY, fontWeight: 700, lineHeight: 1.15 }}>
          {settings.school_name}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontFamily: SANS,
            fontSize: TYPE.label,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: BRASS,
            fontWeight: 700,
          }}
        >
          {label}
        </p>
      </div>
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: TYPE.value, color: NAVY, fontWeight: 700 }}>
          {student.name}
        </p>
        <p style={{ margin: "1px 0 0", fontFamily: SANS, fontSize: TYPE.fine, color: MUTED }}>
          {[classLabel, `${term}, ${year}`].filter(Boolean).join("  ·  ")}
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
          fontSize: TYPE.value,
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
          fontSize: TYPE.label,
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

/**
 * `note` carries the sheet's place in the document — "continued overleaf" on a
 * summary, "page 2 of 2" on the commentary — so a parent holding one sheet can
 * tell whether they are holding all of it.
 */
export function ReportFooter({ settings, note }: { settings: Settings; note?: string }) {
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
      <p style={{ margin: 0, fontFamily: SANS, fontSize: TYPE.fine, color: MUTED }}>
        Term opens · <strong style={{ color: NAVY }}>{settings.term_open || "—"}</strong>
        {"   ·   "}
        Ends · <strong style={{ color: NAVY }}>{settings.term_end || "—"}</strong>
      </p>
      <p style={{ margin: 0, display: "flex", gap: 14, alignItems: "center" }}>
        {note ? (
          <span style={{ fontFamily: SANS, fontSize: TYPE.fine, color: NAVY, fontWeight: 700 }}>{note}</span>
        ) : null}
        <span style={{ fontSize: TYPE.label, color: BRASS, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Invalid without school stamp
        </span>
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
      <p style={{ margin: 0, fontFamily: SANS, fontSize: TYPE.label, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
        {label}
      </p>
      <p style={{ margin: "1px 0 0", fontFamily: DISPLAY, fontSize: TYPE.value, color: NAVY, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
