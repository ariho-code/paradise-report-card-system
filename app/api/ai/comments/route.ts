import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { generateComments, generateEarlyYearsComments } from "@/lib/deepseek";

export async function POST(request: NextRequest) {
  const session = await readSessionToken(request.cookies.get("pcs_session")?.value);
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY on the server." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    mode?: string;
    studentName?: string;
    studentClass?: string;
    year?: string;
    term?: string;
    summary?: string;
    marks?: Array<{ subject: string; test: string; eot: string; grade: string }>;
    skills?: string[];
    areas?: Array<{ area: string; award: string }>;
  };

  try {
    if (body.mode === "early_years") {
      const draft = await generateEarlyYearsComments({
        studentName: String(body.studentName || "Learner"),
        studentClass: String(body.studentClass || ""),
        year: String(body.year || ""),
        term: String(body.term || ""),
        summary: String(body.summary || ""),
        areas: body.areas || [],
      });
      return NextResponse.json(draft);
    }

    const draft = await generateComments({
      studentName: String(body.studentName || "Learner"),
      studentClass: String(body.studentClass || ""),
      year: String(body.year || ""),
      term: String(body.term || ""),
      summary: String(body.summary || ""),
      marks: body.marks || [],
      skills: body.skills || [],
    });
    return NextResponse.json(draft);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate comments.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
