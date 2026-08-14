import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";
import { getPasswordHash } from "@/lib/db";
import { requestOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const username = String(form.get("username") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  const origin = requestOrigin(request);
  const fail = NextResponse.redirect(new URL("/?error=1", origin), 303);

  if (username !== "admin" && username !== "teacher") return fail;

  try {
    const hash = await getPasswordHash();
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return fail;

    const token = await createSessionToken(username);
    const res = NextResponse.redirect(new URL("/dashboard", origin), 303);
    res.cookies.set("pcs_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch {
    return fail;
  }
}
