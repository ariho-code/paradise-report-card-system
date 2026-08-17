# Early Years reports & per-learner subject removal

**Date:** 2026-08-17
**Status:** Approved for implementation

## Problem

Early Years classes are assessed by written comment, not by marks. The current
system has one report card — a marks ledger with Test / EOT / Grade columns — so
Early Years teachers have nothing usable to print.

Separately, compulsory subjects currently attach to every learner with no way to
take one off. Different classes cover different work at different levels, so a
learner may not sit a subject the register calls compulsory.

## Goals

1. A second report card for Early Years: areas tracked, a written progress
   comment per area, and an award — no marks anywhere on the sheet.
2. It must carry the existing report card's house style: crest header, school
   name, motto, watermark, signature block, footer.
3. Teachers can remove a compulsory subject from an individual learner.
4. The live database upgrades in place. No existing row is rewritten and no
   existing report changes appearance.

## Non-goals

- Class-level subject removal defaults (per-learner only; revisit if the ticking
  becomes tedious).
- Character traits on the Early Years sheet — not on the school's printed form.
- Any change to how Grade 1–7 marks are entered, graded, or printed.

## Model

The report type is a property of the **class**, not the learner. A teacher never
picks a report format; opening an Early Years learner simply yields the right
screen.

Early Years "areas tracked" are stored as rows in the existing `subjects` table
carrying `stage='early_years'`. This reuses one CRUD screen, one sort order, and
one removal mechanism across both report types rather than maintaining parallel
sets of near-identical code.

### Schema changes — additive only

```sql
ALTER TABLE classes  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'standard';

CREATE TABLE IF NOT EXISTS student_exclusions (
  student_id TEXT NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id)  ON DELETE CASCADE,
  PRIMARY KEY (student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS area_progress (
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  subject_id    TEXT NOT NULL REFERENCES subjects(id)    ON DELETE CASCADE,
  progress      TEXT NOT NULL DEFAULT '',
  award         TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (assessment_id, subject_id)
);
```

`classes.level` ∈ `standard | early_years`. `subjects.stage` takes the same two
values. Every existing row defaults to `standard`, so current learners resolve to
exactly the subject list they have today.

Seven Early Years areas are seeded once, only when no `early_years` subject
exists: Communication, language and literacy · Mathematics · Personal
development · Social and emotional development · Understanding the world ·
Physical development · Creative expression.

Personal development and social/emotional development were originally one
combined area. Databases seeded before the split carry the combined row;
`splitPersonalSocialArea` renames it to "Personal development" — keeping the row
id so progress already written stays attached — shifts the later areas down one,
and inserts "Social and emotional development" beside it. It is guarded on the
old name so it runs exactly once and never renumbers on a later cold start.

Awards are the three words on the school's printed key: `Good`, `Very Good`,
`Impressive`, plus blank for "not yet awarded".

### Skills — comment-only subjects

Some subjects in the Grade classes are taught as skills: Chess and Music are
commented on, never marked. `subjects.graded` (default true) marks these. It is
orthogonal to `stage` — only Standard subjects choose, since Early Years is
already all comments.

Skills reuse the `marks` table, storing only a comment. They are filtered out of
the marks table on the report and printed in their own Skills block beneath it,
styled like the Character panel; a skill left blank stays off the sheet
entirely. The marks ledger likewise splits them into a separate card with just a
comment box.

`markSkillSubjects` converts Music rather than duplicating it, leaving its marks
in place so they reappear if the school switches it back to graded, and adds
Chess as an optional skill.

### Migration safety

`applySchema` in `lib/db.ts` early-returns when the `settings` table already
exists, so anything written into its tail never runs on the deployed database.
All four changes above go into a new `ensureUpgrades()` invoked on **both**
branches of `applySchema`, alongside the existing `ensureClassesTable()`.

`ensureSchema()` is already awaited by every data accessor, so the upgrade lands
on the first request after deploy with no manual step.

Schema changes are written to be safe to re-run. One-off **data** changes are
not, so they go through `once(key, fn)`, backed by an `applied_migrations`
table: re-running would otherwise overwrite whatever the school has since
changed on the Subjects page, on every serverless cold start.

### Subject resolution

`subjectsForStudent` is the single place that resolves a learner's list. It
becomes stage-aware and exclusion-aware:

```
stage = the level of the class the learner belongs to
AND (compulsory OR chosen as an optional for this learner)
AND NOT excluded for this learner
```

The learner's class level comes from matching `students.grade` to `classes.name`,
defaulting to `standard` when no class row matches — an unmatched name must not
strand a learner without subjects.

## Components

`report-chrome.tsx` (new) holds the shared palette, `ReportHeader`, `ReportMeta`,
`ReportFooter`, and the panel styles. The existing card's markup moves verbatim so
its rendered output is unchanged; both sheets then import from one place and
cannot drift apart when one is edited.

`early-years-report.tsx` (new) — chrome, plus:

- Banner: EARLY YEARS PROGRESS REPORT
- Table: AREA TRACKED · PROGRESS · AWARD, rows sized to fill the sheet
- KEY WORD strip: GOOD · VERY GOOD · IMPRESSIVE
- Teacher's remarks panel, term dates
- Teacher's signature line beside the Principal's

Award chips reuse the grade seal tones: Impressive green, Very Good navy, Good
brass.

`early-years-form.tsx` (new) mirrors the marks ledger — one row per area with an
award dropdown and a progress text box, a remarks field, and the same Generate
with AI action, extended to draft progress notes rather than grade remarks.

## Flow

Three pages and one route branch on class level:

| Location | Standard | Early Years |
|---|---|---|
| `app/marks/[studentId]` | `MarksForm` | `EarlyYearsForm` |
| `app/reports/print/[studentId]` | `ReportCard` | `EarlyYearsReport` |
| `app/reports/print/class` | `ReportCard` | `EarlyYearsReport` |
| `app/api/marks` | `saveAssessmentBundle` | `saveEarlyYearsBundle` |

The API branches on a hidden `mode` field posted by the form.

`assessments` and its `teacher_comment` are reused as-is for both report types;
only the per-area rows live in the new table.

## Screens

- **Classes** — modal gains Standard / Early Years; the list badges Early Years rows.
- **Subjects** — splits into two labelled groups; modal picks the group.
- **Edit student** — a "Not taken by this learner" fieldset lists that class's
  compulsory subjects as tick-boxes, re-filtering live when the class dropdown
  changes so a learner never sees the other stage's list.

## Testing

The repo has no test harness, so verification is: `npm run build` clean,
`npx tsc --noEmit` clean, `npm run lint` clean, then against a local Postgres —
create an Early Years class, enrol a learner, enter progress, print; and confirm
an existing Grade 7 learner's report renders byte-identically to before the
chrome extraction.

## Risks

- **Chrome extraction regressing the live report.** Mitigated by moving markup
  verbatim and diffing a Grade 7 report before and after.
- **A class renamed away from its students' `grade` value** would silently fall
  back to `standard`. `updateClass` already cascades renames to students, so this
  only bites on direct DB edits.
