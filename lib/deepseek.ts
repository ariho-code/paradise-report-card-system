import { AWARD_LEVELS, DEFAULT_TRAITS } from "./types";

export type CommentDraft = {
  characters: Record<string, string>;
  teacherComment: string;
  markComments: Record<string, string>;
};

export type EarlyYearsDraft = {
  areaProgress: Record<string, string>;
  awards: Record<string, string>;
  teacherComment: string;
};

async function askDeepSeek(prompt: string) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error("DEEPSEEK_API_KEY is not set.");
  }

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
  return JSON.parse(payload.choices?.[0]?.message?.content || "{}") as Record<string, unknown>;
}

export async function generateEarlyYearsComments(input: {
  studentName: string;
  studentClass: string;
  year: string;
  term: string;
  summary: string;
  areas: Array<{ area: string; award: string }>;
}): Promise<EarlyYearsDraft> {
  const areaLines = input.areas
    .map((row) => `- ${row.area}${row.award ? ` (teacher already chose: ${row.award})` : ""}`)
    .join("\n");

  const prompt = `You write Early Years report comments for Paradise Christian School, motto "Be The Light".
These are young children. There are no marks and no grades — only what the child can do and how they are growing.
Voice: warm, Christian, specific, honest, encouraging. Write about the child, never about scores.

Learner: ${input.studentName}
Class: ${input.studentClass}
Period: ${input.term} ${input.year}

Areas tracked:
${areaLines || "No areas listed."}

Teacher summary:
${input.summary.trim() || "No extra note. Write gentle, general progress notes."}

Return JSON only:
{
  "areaProgress": {},
  "awards": {},
  "teacherComment": ""
}

areaProgress: one sentence per area, 10-20 words, describing what the child does in that area. Keys must be the exact area names listed above.
awards: one of exactly "${AWARD_LEVELS.join('", "')}" per area. Keys must be the exact area names. Where the teacher already chose an award, repeat their choice.
teacherComment: 2-3 warm sentences to the parents, under 200 characters. Do not invent areas that are not listed.`;

  const parsed = await askDeepSeek(prompt);
  const rawProgress = (parsed.areaProgress || {}) as Record<string, unknown>;
  const rawAwards = (parsed.awards || {}) as Record<string, unknown>;

  const areaProgress: Record<string, string> = {};
  const awards: Record<string, string> = {};
  for (const row of input.areas) {
    const note = String(rawProgress[row.area] ?? "").trim();
    if (note) areaProgress[row.area] = note;
    const award = String(rawAwards[row.area] ?? "").trim();
    // Only accept the three words printed on the key strip.
    const match = AWARD_LEVELS.find((level) => level.toLowerCase() === award.toLowerCase());
    if (match) awards[row.area] = match;
  }

  return {
    areaProgress,
    awards,
    teacherComment: String(parsed.teacherComment ?? "").trim(),
  };
}

export async function generateComments(input: {
  studentName: string;
  studentClass: string;
  year: string;
  term: string;
  summary: string;
  marks: Array<{ subject: string; test: string; eot: string; grade: string }>;
  skills?: string[];
}): Promise<CommentDraft> {
  const skills = input.skills || [];
  const markLines = input.marks
    .map((row) => `${row.subject}: Test ${row.test || "—"}, EOT ${row.eot || "—"}, Grade ${row.grade}`)
    .join("\n");

  const subjectList = input.marks.map((row) => row.subject).join(", ");

  const prompt = `You write report-card comments for Paradise Christian School, motto "Be The Light".
Voice: warm, Christian, specific, honest, and encouraging. Write about this learner, in sentences a parent can act on. No averages. Do not invent extra subjects.

Learner: ${input.studentName}
Class: ${input.studentClass}
Period: ${input.term} ${input.year}

Marks:
${markLines || "No marks entered yet."}

Skills (taught and commented on, never marked or graded):
${skills.length ? skills.map((name) => `- ${name}`).join("\n") : "None."}

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

Each character remark is one or two full sentences (12–30 words) about what the learner actually does, not a locked slogan.
The teacherComment is the paragraph parents read first: 2-4 sentences, 250-400 characters, naming a strength, an area to grow and a next step.
markComments are the elaborate subject comments. They print on their own page, so each one is 1-3 sentences (20-45 words) about what the learner understands in that subject, what they can now do, and what to work on next. Never restate the grade or the mark — the report prints a band remark of its own beside the score — and never write a bare label like "Good work". Keys should be exact subject names from the marks list.
Also add one entry to markComments for each skill listed above, keyed by its exact name. A skill has no grade, so write 20-40 words on what the learner does in it — never mention marks, grades or scores for a skill.`;

  const parsed = (await askDeepSeek(prompt)) as {
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
