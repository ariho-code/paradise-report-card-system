import { DEFAULT_TRAITS } from "./types";

export type CommentDraft = {
  characters: Record<string, string>;
  teacherComment: string;
  markComments: Record<string, string>;
};

export async function generateComments(input: {
  studentName: string;
  studentClass: string;
  year: string;
  term: string;
  summary: string;
  marks: Array<{ subject: string; test: string; eot: string; grade: string }>;
}): Promise<CommentDraft> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error("DEEPSEEK_API_KEY is not set.");
  }

  const markLines = input.marks
    .map((row) => `${row.subject}: Test ${row.test || "—"}, EOT ${row.eot || "—"}, Grade ${row.grade}`)
    .join("\n");

  const subjectList = input.marks.map((row) => row.subject).join(", ");

  const prompt = `You write report-card comments for Paradise Christian School, motto "Be The Light".
Voice: warm, Christian, specific, honest, and encouraging. Short phrases for character. One paragraph for the class teacher comment. No averages. Do not invent extra subjects.

Learner: ${input.studentName}
Class: ${input.studentClass}
Period: ${input.term} ${input.year}

Marks:
${markLines || "No marks entered yet."}

Teacher summary:
${input.summary.trim() || "No extra note. Use the marks only."}

Return JSON only:
{
  "characters": {
    "Leadership": "",
    "Innovation": "",
    "Godly": "",
    "Hardworking": "",
    "Truthful": ""
  },
  "teacherComment": "",
  "markComments": {}
}

Each character remark is a short teacher-written phrase (3–8 words), not a locked slogan.
The teacherComment must be brief - exactly 2-3 sentences maximum, under 150 characters total. Keep it concise and impactful.
For markComments, provide a brief 2-4 word comment for each subject based on the grade. Keys should be exact subject names from the marks list.`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You write official school report comments. Reply with JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek request failed (${response.status}). ${text.slice(0, 180)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as {
    characters?: Record<string, string>;
    teacherComment?: string;
    markComments?: Record<string, string>;
  };

  const characters: Record<string, string> = {};
  for (const trait of DEFAULT_TRAITS) {
    characters[trait] = String(parsed.characters?.[trait] || "").trim();
  }

  const markComments: Record<string, string> = {};
  if (parsed.markComments) {
    for (const [subject, comment] of Object.entries(parsed.markComments)) {
      markComments[subject] = String(comment).trim();
    }
  }

  return {
    characters,
    teacherComment: String(parsed.teacherComment || "").trim(),
    markComments,
  };
}
