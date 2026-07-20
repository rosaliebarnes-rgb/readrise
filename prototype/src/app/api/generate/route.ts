import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "@/lib/model";
import { buildPrompt } from "@/lib/prompt";
import { appendWordCounts, deriveWordBank, parseSections } from "@/lib/parse";
import type { GenConfig } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "The server has no ANTHROPIC_API_KEY. Add it to the readrise-prototype Vercel project (Settings → Environment Variables, Production) and to prototype/.env.local for local dev, then redeploy.",
      },
      { status: 500 },
    );
  }

  let body: { config?: GenConfig; adjustment?: string | null; model?: string; noThink?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }
  const cfg = body.config;
  const adjustment = body.adjustment ?? null;
  if (!cfg?.profile || !cfg.outputs) {
    return NextResponse.json({ error: "Missing generation config." }, { status: 400 });
  }

  // Model override is allowlisted (used by the model bake-off). Default is MODEL.
  const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-sonnet-5", "claude-opus-4-8"]);
  const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : MODEL;
  const thinking = body.noThink ? ({ type: "disabled" } as const) : undefined;

  const client = new Anthropic({ apiKey: key });
  const prompt = buildPrompt(cfg, adjustment);

  try {
    const message = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
      ...(thinking ? { thinking } : {}),
    });

    let text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    if (!text) {
      return NextResponse.json({ error: "The model returned an empty response." }, { status: 502 });
    }

    // Belt-and-suspenders: strip anything written before the first marker.
    const cut = text.indexOf("===TEXT===");
    if (cut > 0) text = text.slice(cut);
    else if (cut < 0) text = "===TEXT===\n" + text;

    if (message.stop_reason === "max_tokens" && !/===TEXT===/.test(text)) {
      return NextResponse.json(
        { error: "The model ran out of room before writing the text. Try a shorter length." },
        { status: 502 },
      );
    }

    const parsed = parseSections(text);
    if (cfg.outputs.wordGrid) parsed.wordgrid = deriveWordBank(parsed.text);
    if (cfg.outputs.wordCount) parsed.text = appendWordCounts(parsed.text);

    return NextResponse.json({ parsed, model, usage: message.usage });
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
