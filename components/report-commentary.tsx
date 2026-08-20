import {
  DISPLAY,
  GradeSeal,
  INK,
  LINE,
  MUTED,
  NAVY,
  ReportContinuationHeader,
  ReportFooter,
  SANS,
  TYPE,
  panel,
  panelHeader,
} from "@/components/report-chrome";
import type { CharacterMark, Mark, Settings, Student } from "@/lib/types";

/**
 * Page two: what the teachers actually wrote.
 *
 * The school asked for elaborate comments — "they have to be elaborate" — and
 * elaborate comments cannot share a page with a table of marks. On the summary
 * sheet they were squeezed into a narrow column and came off the printer at
 * roughly 4pt. Here each one gets the full measure of the page at 9.4pt, set
 * upright and ranged left rather than italic and ragged-right, which is the
 * pairing that made the old sheet hardest to read.
 *
 * The order is deliberate. The class teacher's overall comment leads, because
 * it is the paragraph every parent reads first and because a block placed last
 * on a flowing sheet is the one that gets pushed alone onto a spare page. The
 * sections below it are free to break across a page boundary between rows, so
 * a teacher who writes about eighteen subjects fills the sheet and continues
 * rather than leaving half a page white.
 */

/** True when there is anything worth printing a second sheet for. */
export function hasCommentary(
  marks: Mark[],
  characters: CharacterMark[],
  teacherComment: string,
): boolean {
  return (
    marks.some((row) => row.comment?.trim()) ||
    characters.some((row) => row.remark?.trim()) ||
    Boolean(teacherComment.trim())
  );
}

/**
 * A section of the commentary. Ruled rather than boxed: a bordered panel that
 * breaks across a page leaves a cut edge at the fold, while a heading bar and
 * hairlines carry on cleanly onto the next sheet.
 */
function CommentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ ...panelHeader, margin: "0 0 1px", borderRadius: 4 }}>{title}</h2>
      {children}
    </section>
  );
}

function CommentRow({
  title,
  body,
  grade,
  first,
}: {
  title: string;
  body: string;
  grade?: string;
  first: boolean;
}) {
  return (
    <div
      className="print-block"
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: 14,
        padding: "3px 2px",
        borderTop: first ? "none" : `1px solid ${LINE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, minWidth: 0 }}>
        {grade ? <GradeSeal grade={grade} /> : null}
        <strong
          style={{
            fontFamily: SANS,
            fontSize: TYPE.table,
            fontWeight: 700,
            color: NAVY,
            lineHeight: 1.3,
          }}
        >
          {title}
        </strong>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: SANS,
          fontSize: TYPE.narrative,
          lineHeight: TYPE.narrativeLine,
          color: INK,
        }}
      >
        {body}
      </p>
    </div>
  );
}

export function ReportCommentary({
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
  // A subject only appears here when a teacher has written about it. An empty
  // slot under every subject would say nothing and cost half the page.
  const subjects = marks.filter((row) => row.graded !== false && row.comment?.trim());
  const skills = marks.filter((row) => row.graded === false && row.comment?.trim());
  const traits = characters.filter((row) => row.remark?.trim());

  return (
    <article className="print-flow-sheet">
      <ReportContinuationHeader
        settings={settings}
        student={student}
        year={year}
        term={term}
        label="Teachers' comments"
      />

      {teacherComment.trim() ? (
        <section style={panel} className="print-block">
          <div style={panelHeader}>Class teacher&apos;s general comment</div>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: DISPLAY,
              fontSize: TYPE.overall,
              lineHeight: 1.5,
              color: INK,
            }}
          >
            {teacherComment}
          </p>
          {student.adviser ? (
            <p
              style={{
                margin: "8px 0 0",
                textAlign: "right",
                fontFamily: SANS,
                fontSize: TYPE.fine,
                color: MUTED,
              }}
            >
              — {student.adviser}, class adviser
            </p>
          ) : null}
        </section>
      ) : null}

      {subjects.length > 0 ? (
        <CommentSection title="Subject comments">
          {subjects.map((row, i) => (
            <CommentRow
              key={row.subject_id}
              title={row.subject_name || ""}
              body={row.comment}
              grade={row.grade}
              first={i === 0}
            />
          ))}
        </CommentSection>
      ) : null}

      {skills.length > 0 ? (
        <CommentSection title="Skills &amp; activities">
          {skills.map((row, i) => (
            <CommentRow key={row.subject_id} title={row.subject_name || ""} body={row.comment} first={i === 0} />
          ))}
        </CommentSection>
      ) : null}

      {traits.length > 0 ? (
        <CommentSection title="Character &amp; personal development">
          {traits.map((row, i) => (
            <CommentRow key={row.trait} title={row.trait} body={row.remark} first={i === 0} />
          ))}
        </CommentSection>
      ) : null}

      <div className="print-flow-tail">
        <ReportFooter settings={settings} note="End of report" />
      </div>
    </article>
  );
}
