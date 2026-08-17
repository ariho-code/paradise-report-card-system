import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { createClass, deleteClass, updateClass } from "@/lib/db";
import { requestOrigin } from "@/lib/http";
import type { Stage } from "@/lib/types";

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/", origin), 303);

  const form = await request.formData();
  const intent = String(form.get("intent") || "save");
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim();
  const level: Stage = form.get("level") === "early_years" ? "early_years" : "standard";
  // Absent when the form never rendered the picker; null leaves the class on
  // the curriculum default rather than silently dropping every subject.
  const taken = form.has("subjectsPicked") ? form.getAll("taken").map(String) : null;

  try {
    if (intent === "delete") {
      if (id) await deleteClass(id);
      return NextResponse.redirect(new URL("/classes", origin), 303);
    }
    if (!name) return NextResponse.redirect(new URL("/classes?error=name", origin), 303);
    if (id) await updateClass(id, name, level, taken);
    else await createClass(name, level, taken);
    return NextResponse.redirect(new URL("/classes", origin), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save class.";
    return NextResponse.redirect(
      new URL(`/classes?error=${encodeURIComponent(message)}`, origin),
      303,
    );
  }
}
