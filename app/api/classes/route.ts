import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { createClass, deleteClass, updateClass } from "@/lib/db";
import { requestOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/", origin), 303);

  const form = await request.formData();
  const intent = String(form.get("intent") || "save");
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim();

  try {
    if (intent === "delete") {
      if (id) await deleteClass(id);
      return NextResponse.redirect(new URL("/classes", origin), 303);
    }
    if (!name) return NextResponse.redirect(new URL("/classes?error=name", origin), 303);
    if (id) await updateClass(id, name);
    else await createClass(name);
    return NextResponse.redirect(new URL("/classes", origin), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save class.";
    return NextResponse.redirect(
      new URL(`/classes?error=${encodeURIComponent(message)}`, origin),
      303,
    );
  }
}
