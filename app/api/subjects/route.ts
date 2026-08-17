import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { createSubject, deleteSubject, updateSubject } from "@/lib/db";
import { requestOrigin } from "@/lib/http";
import type { Stage } from "@/lib/types";

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/", origin), 303);

  const form = await request.formData();
  const intent = String(form.get("intent") || "save");
  const id = String(form.get("id") || "");

  if (intent === "delete") {
    if (id) await deleteSubject(id);
    return NextResponse.redirect(new URL("/subjects", origin), 303);
  }

  const name = String(form.get("name") || "").trim();
  const compulsory = form.get("compulsory") === "on";
  const stage: Stage = form.get("stage") === "early_years" ? "early_years" : "standard";
  // Early Years areas are always commented on, so only Standard subjects can
  // choose. A missing value means marks, keeping the old behaviour.
  const graded = stage === "early_years" ? false : form.get("graded") !== "comment";
  if (!name) return NextResponse.redirect(new URL("/subjects/new?error=1", origin), 303);

  if (id) await updateSubject(id, { name, compulsory, stage, graded });
  else await createSubject({ name, compulsory, stage, graded });

  return NextResponse.redirect(new URL("/subjects", origin), 303);
}
