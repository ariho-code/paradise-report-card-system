import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { getOrCreateAssessment, saveAssessmentBundle, saveEarlyYearsBundle } from "@/lib/db";
import { parseMark, suggestedGradeFromPapers } from "@/lib/grades";
import { requestOrigin } from "@/lib/http";
import { DEFAULT_TRAITS } from "@/lib/types";

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/", origin), 303);

  const form = await request.formData();
  const studentId = String(form.get("studentId") || "");
  const year = String(form.get("year") || "");
  const term = String(form.get("term") || "");
  const teacherComment = String(form.get("teacherComment") || "");
  const subjectIds = form.getAll("subjectId").map(String);

  const assessment = await getOrCreateAssessment(studentId, year, term);
  const qs = new URLSearchParams({ year, term });

  if (String(form.get("mode") || "") === "early_years") {
    await saveEarlyYearsBundle({
      assessmentId: assessment.id,
      teacherComment,
      areas: subjectIds.map((subjectId) => ({
        subjectId,
        progress: String(form.get(`progress_${subjectId}`) || ""),
        award: String(form.get(`award_${subjectId}`) || ""),
      })),
    });
    return NextResponse.redirect(new URL(`/reports/print/${studentId}?${qs}`, origin), 303);
  }

  const marks = subjectIds.map((subjectId) => {
    const missed = form.get(`missed_${subjectId}`) === "on";
    const test = parseMark(form.get(`test_${subjectId}`));
    const eot = parseMark(form.get(`eot_${subjectId}`));
    const rawGrade = String(form.get(`grade_${subjectId}`) || "").toUpperCase();
    const grade = missed ? "U" : rawGrade || suggestedGradeFromPapers(test, eot, missed);
    const comment = String(form.get(`comment_${subjectId}`) || "");
    return { subjectId, test, eot, grade, missed, comment };
  });

  const characters = DEFAULT_TRAITS.map((trait) => ({
    trait,
    remark: String(form.get(`trait_${trait}`) || ""),
  }));

  await saveAssessmentBundle({
    assessmentId: assessment.id,
    teacherComment,
    marks,
    characters,
  });

  return NextResponse.redirect(new URL(`/reports/print/${studentId}?${qs}`, origin), 303);
}
