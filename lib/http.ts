import { NextRequest } from "next/server";

export function requestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function redirectTo(request: NextRequest, path: string, status = 303) {
  return Response.redirect(new URL(path, requestOrigin(request)), status);
}
