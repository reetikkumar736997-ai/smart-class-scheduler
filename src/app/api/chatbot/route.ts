import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { generateStudyAssistantAnswer } from "@/lib/study-assistant";

const requestSchema = z.object({
  question: z.string().trim().min(1).max(3000),
  contextSummary: z.string().trim().max(1000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(3000),
      }),
    )
    .max(6)
    .optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chatbot request." }, { status: 400 });
  }

  const { question, contextSummary, history } = parsed.data;
  const answer = generateStudyAssistantAnswer({
    question,
    contextSummary,
    history,
    role: session.role,
  });

  return NextResponse.json({ answer });
}
