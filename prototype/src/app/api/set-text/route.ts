import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "@/lib/model";
import { buildSetTextPrompt } from "@/lib/prompt";
import { parseSections } from "@/lib/parse";
import type { PlannedText, SetConfig } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-sonnet-5", "claude-opus-4-8"]);

/* Stage 2 of a class set: write ONE text from the reviewed plan. The client
   calls this once per text so each gets the full prompt and stays inside the
   function timeout. */
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "The server has no ANTHROPIC_API_KEY." }, { status: 500 });
  }

  let body: {
    config?: SetConfig;
    planned?: PlannedText;
    vocab?: string[];
    total?: number;
    model?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { config: cfg, planned, vocab, total } = body;
  if (!cfg?.anchor || !planned?.title) {
    return NextResponse.json({ error: "Missing set config or planned text." }, { status: 400 });
  }

  const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : MODEL;
  const client = new Anthropic({ apiKey: key });

  try {
    const message = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: buildSetTextPrompt(cfg, planned, vocab || [], total || 1),
        },
      ],
    });

    let text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    if (!text) {
      return NextResponse.json({ error: "The model returned an empty text." }, { status: 502 });
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
