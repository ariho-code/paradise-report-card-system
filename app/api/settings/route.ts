import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readSessionToken } from "@/lib/auth";
import {
  addTerm,
  addYear,
  getPasswordHash,
  removeTerm,
  removeYear,
  updatePassword,
  updateSettings,
} from "@/lib/db";
import { requestOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/", origin), 303);

  const form = await request.formData();
  const intent = String(form.get("intent") || "school");

  if (intent === "school") {
    await updateSettings({
      school_name: String(form.get("school_name") || "").trim(),
      principal: String(form.get("principal") || "").trim(),
      motto: String(form.get("motto") || "").trim(),
      term_open: String(form.get("term_open") || "").trim(),
      term_end: String(form.get("term_end") || "").trim(),
      current_year: String(form.get("current_year") || "2026"),
      current_term: String(form.get("current_term") || "Term 2"),
    });
    return NextResponse.redirect(new URL("/settings?saved=1", origin), 303);
  }

  if (intent === "add-term") {
    const name = String(form.get("name") || "").trim();
    if (name) await addTerm(name);
    return NextResponse.redirect(new URL("/settings", origin), 303);
  }
  if (intent === "remove-term") {
    const name = String(form.get("name") || "");
    if (name) await removeTerm(name);
    return NextResponse.redirect(new URL("/settings", origin), 303);
  }
  if (intent === "add-year") {
    const name = String(form.get("name") || "").trim();
    if (name) await addYear(name);
    return NextResponse.redirect(new URL("/settings", origin), 303);
  }
  if (intent === "remove-year") {
    const name = String(form.get("name") || "");
    if (name) await removeYear(name);
    return NextResponse.redirect(new URL("/settings", origin), 303);
  }
  if (intent === "password") {
    const current = String(form.get("current") || "");
    const next = String(form.get("next") || "");
    const hash = await getPasswordHash();
    const ok = await bcrypt.compare(current, hash);
    if (!ok) return NextResponse.redirect(new URL("/settings?pw=bad", origin), 303);
    if (next.length < 4) return NextResponse.redirect(new URL("/settings?pw=short", origin), 303);
    await updatePassword(await bcrypt.hash(next, 10));
    return NextResponse.redirect(new URL("/settings?pw=ok", origin), 303);
  }

  return NextResponse.redirect(new URL("/settings", origin), 303);
}
