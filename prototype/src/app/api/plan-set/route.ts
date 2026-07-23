import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "@/lib/model";
import { buildSetPlanPrompt } from "@/lib/prompt";
import { parseSetPlan } from "@/lib/parse";
import type { SetConfig } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-sonnet-5", "claude-opus-4-8"]);

/* Stage 1 of a class set: plan the angles + the shared vocabulary spine.
   The teacher reviews this before any text is written. */
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "The server has no ANTHROPIC_API_KEY." }, { status: 500 });
  }

  let body: { config?: SetConfig; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const cfg = body.config;
  if (!cfg?.anchor?.trim() && !cfg?.describe?.trim()) {
    return NextResponse.json({ error: "Describe the set, or give it an anchor topic first." }, { status: 400 });
  }
  if (!cfg.levels?.length || cfg.levels.some((l) => !l.trim())) {
    return NextResponse.json(
      { error: "Set a reading level for every text — without them every text lands at the same level." },
      { status: 400 },
    );
  }

  const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : MODEL;
  const client = new Anthropic({ apiKey: key });

  try {
    const message = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: buildSetPlanPrompt(cfg) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    if (!text) {
      return NextResponse.json({ error: "The model returned an empty plan." }, { status: 502 });
    }

    const plan = parseSetPlan(text, cfg.levels);
    if (!plan.texts.length) {
      return NextResponse.json(
        { error: "Couldn't read a plan back from the model. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ plan, model });
  } catch (e) {
    const error =
      e instanceof Anthropic.APIError
        ? `Model error (${e.status}): ${e.message}`
        : e instanceof Error
          ? e.message
          : "Planning failed.";
    return NextResponse.json({ error }, { status: 502 });
  }
}
