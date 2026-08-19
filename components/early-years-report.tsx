import { FitToPage } from "@/components/fit-to-page";
import {
  BRASS,
  DISPLAY,
  GREEN,
  INK,
  LINE,
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
import { AWARD_LEVELS } from "@/lib/types";
import type { AreaProgress, Settings, Student, Subject } from "@/lib/types";

function AwardChip({ award }: { award: string }) {
  const tone: Record<string, { bg: string; color: string; border: string }> = {
    Impressive: { bg: GREEN, color: "#ffffff", border: GREEN },
    "Very Good": { bg: NAVY, color: "#ffffff", border: NAVY },
    Good: { bg: BRASS, color: "#ffffff", border: BRASS },
  };
  const look = tone[award];
  if (!look) {
    return <span style={{ color: MUTED, fontSize: 11 }}>—</span>;
  }
  return (
    <span
      className="grade-seal"
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 4,
        background: look.bg,
        color: look.color,
        border: `1.5px solid ${look.border}`,
        fontFamily: SANS,
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {award}
    </span>
  );
}

export function EarlyYearsReport({
  student,
  settings,
  year,
  term,
  areas,
  progress,
  teacherComment,
}: {
  student: Student;
  settings: Settings;
  year: string;
  term: string;
  areas: Subject[];
  progress: AreaProgress[];
  teacherComment: string;
}) {
  // The areas are the structure of this document, so every area the learner
  // takes prints whether or not the teacher has filled it in yet.
  const saved = new Map(progress.map((row) => [row.subject_id, row]));
  const rows = areas.map((area) => ({
    id: area.id,
    name: area.name,
    progress: saved.get(area.id)?.progress || "",
    award: saved.get(area.id)?.award || "",
  }));

  return (
    <article className="print-sheet">
      <img className="print-watermark" src="/logo.jpg" alt="" />
      <FitToPage>
        <ReportHeader settings={settings} />
        <ReportBanner label="Early Years Progress Report" />
        <ReportMeta student={student} year={year} term={term} />

        <section
          style={{
            flex: "0 0 auto",
            display: "flex",
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          <table
            style={{
              width: "100%",
              height: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
              fontFamily: SANS,
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: NAVY, color: "#ffffff" }}>
                <th style={{ width: "30%", textAlign: "left", padding: "5px 8px", fontWeight: 600 }}>Area tracked</th>
                <th style={{ textAlign: "left", padding: "5px 8px", fontWeight: 600 }}>Progress</th>
                <th style={{ width: "17%", padding: "5px 8px", fontWeight: 600 }}>Award</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 20, textAlign: "center", color: MUTED, fontStyle: "italic" }}>
                    No learning areas are set for this class.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 ? "#f7f9fc" : "#ffffff" }}>
                    <td
                      style={{
                        padding: "7px 8px",
                        borderTop: `1px solid ${LINE}`,
                        verticalAlign: "top",
                        fontWeight: 600,
                        color: NAVY,
                        lineHeight: 1.25,
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        borderTop: `1px solid ${LINE}`,
                        borderLeft: `1px solid ${LINE}`,
                        verticalAlign: "top",
                        color: INK,
                        lineHeight: 1.35,
                      }}
                    >
                      {row.progress || <span style={{ color: MUTED }}>—</span>}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        borderTop: `1px solid ${LINE}`,
                        borderLeft: `1px solid ${LINE}`,
                        verticalAlign: "top",
                        textAlign: "center",
                      }}
                    >
                      <AwardChip award={row.award} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
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
            Key word
          </span>
          {AWARD_LEVELS.map((award) => (
            <AwardChip key={award} award={award} />
          ))}
        </div>

        <section style={panel}>
          <div style={panelHeader}>Teacher&apos;s remarks</div>
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
        </section>

        <SignatureBand adviser={student.adviser || ""} principal={settings.principal} />

        <ReportFooter settings={settings} />
      </FitToPage>
    </article>
  );
}
