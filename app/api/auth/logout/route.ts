import { NextRequest, NextResponse } from "next/server";
import { requestOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", requestOrigin(request)), 303);
  res.cookies.delete("pcs_session");
  return res;
}
