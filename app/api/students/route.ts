import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { createStudent, deleteStudent, updateStudent } from "@/lib/db";
import { requestOrigin } from "@/lib/http";

async function requireUser(request: NextRequest) {
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return null;
  return session;
}

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  if (!(await requireUser(request))) {
    return NextResponse.redirect(new URL("/", origin), 303);
  }

  const form = await request.formData();
  const intent = String(form.get("intent") || "save");
  const id = String(form.get("id") || "");

  if (intent === "delete") {
    if (id) await deleteStudent(id);
    return NextResponse.redirect(new URL("/students", origin), 303);
  }

  const name = String(form.get("name") || "").trim();
  const grade = String(form.get("grade") || "").trim();
  const section = String(form.get("section") || "").trim();
  const adviser = String(form.get("adviser") || "").trim();
  const optional = form.getAll("optional").map(String);

  if (!name || !grade) {
    return NextResponse.redirect(new URL("/students/new?error=1", origin), 303);
  }

  const payload = { name, grade, section, adviser, optional_subject_ids: optional };
  if (id) await updateStudent(id, payload);
  else await createStudent(payload);

  return NextResponse.redirect(new URL("/students", origin), 303);
}
