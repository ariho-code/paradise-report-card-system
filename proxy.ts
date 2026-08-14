import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";

const PUBLIC = new Set(["/", "/favicon.ico"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pcs_session")?.value;
  const session = await readSessionToken(token);

  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isPublic =
    PUBLIC.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/api/auth/");
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
