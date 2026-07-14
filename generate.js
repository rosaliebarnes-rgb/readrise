// api/generate.js
// Vercel serverless function (Node runtime).
// Holds the Anthropic key server-side so teachers never need one.
// The browser calls POST /api/generate with { messages, model, max_tokens }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  // Soft gate: if ALLOWED_ORIGIN is set (comma-separated), only accept those
  // origins. Leave it unset during early testing to allow any origin.
  const allowed = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.origin || "";
  if (allowed.length && origin && !allowed.includes(origin)) {
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY." });
    return;
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { messages, model, max_tokens } = body;

    if (!Array.isArray(messages) || !messages.length) {
      res.status(400).json({ error: "Missing messages." });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-6",
        max_tokens: Math.min(Number(max_tokens) || 8000, 8192),
        messages,
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Generation proxy failed." });
  }
}
