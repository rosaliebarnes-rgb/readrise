import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "@/lib/model";
import { buildDescribePrompt } from "@/lib/prompt";
import { parseSections } from "@/lib/parse";
import type { ParsedSections } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-sonnet-5", "claude-opus-4-8"]);

/* Rebuild the previous output into the marked-section form the model emits, so a
   refine pass can be told exactly what it wrote and change only what's asked. */
function reassemble(p: ParsedSections): string {
  const parts = [`===TEXT===\n${p.text || ""}`];
  if (p.comprehension) parts.push(`===COMPREHENSION===\n${p.comprehension}`);
  if (p.teachernote) parts.push(`===TEACHERNOTE===\n${p.teachernote}`);
  return parts.join("\n\n");
}

/* Describe mode: the teacher's free-text description + a reading level, straight
   to a text. Reuses the same parse/return shape as /api/generate. */
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "The server has no ANTHROPIC_API_KEY." }, { status: 500 });
  }

  let body: {
    description?: string;
    level?: string;
    target?: string;
    model?: string;
    refine?: string;
    previous?: ParsedSections;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const description = (body.description || "").trim();
  if (!description) {
    return NextResponse.json({ error: "Describe what you need first." }, { status: 400 });
  }
  const target = body.target === "Independent" ? "Independent" : "Instructional";
  const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : MODEL;
  const client = new Anthropic({ apiKey: key });

  // A refine pass carries the change + the prior output; a first pass carries neither.
  const opts =
    body.refine?.trim() && body.previous
      ? { refine: body.refine, previousText: reassemble(body.previous) }
      : undefined;

  try {
    const message = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "user", content: buildDescribePrompt(description, body.level || "", target, opts) },
      ],
    });

    let text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    if (!text) {
      return NextResponse.json({ error: "The model returned an empty response." }, { status: 502 });
    }
    const cut = text.indexOf("===TEXT===");
    if (cut > 0) text = text.slice(cut);
    else if (cut < 0) text = "===TEXT===\n" + text;

    return NextResponse.json({ parsed: parseSections(text), model });
  } catch (e) {
    const error =
      e instanceof Anthropic.APIError
        ? `Model error (${e.status}): ${e.message}`
        : e instanceof Error
          ? e.message
          : "Generation failed.";
    return NextResponse.json({ error }, { status: 502 });
  }
}
