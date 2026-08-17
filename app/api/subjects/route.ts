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
  if (!name) return NextResponse.redirect(new URL("/subjects/new?error=1", origin), 303);

  if (id) await updateSubject(id, { name, compulsory, stage });
  else await createSubject({ name, compulsory, stage });

  return NextResponse.redirect(new URL("/subjects", origin), 303);
}
