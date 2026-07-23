import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

/* Feedback path: browser → this route → Google Apps Script → Google Sheet.
   Open-ended by design — one free-text message plus a way to reach the teacher.
   The Apps Script Web App URL lives in an env var (FEEDBACK_WEBHOOK_URL); it
   falls back to the existing production feedback endpoint so nothing is dropped
   if the env var isn't set. Routing through the server (not a browser no-cors
   POST) means we can actually confirm the write succeeded. */
const FALLBACK_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzHthL0NRJgFuEScjkODMiOj-U0614WE4V5hQ5KAeG_zex1AKDTPnoNa5_K2ekflsmH/exec";

export async function POST(req: Request) {
  let body: { message?: string; email?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Add a note before sending." }, { status: 400 });
  }
  const email = (body.email || "").trim();
  const context = (body.context || "").trim();

  const url = process.env.FEEDBACK_WEBHOOK_URL || FALLBACK_WEBHOOK;
  const payload = {
    source: "readrise-prototype",
    email,
    message,
    context,
    // Mirror into the production sheet's existing free-text column so the note
    // still lands even under the old fixed-column Apps Script mapping.
    whatWouldYouChange: message,
    submittedAt: new Date().toISOString(),
  };

  try {
    // Apps Script reads the raw body via e.postData.contents; text/plain avoids a
    // CORS preflight and is accepted all the same. redirect: follow handles the
    // 302 → script.googleusercontent.com hop Apps Script issues.
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Feedback endpoint returned ${res.status}.` }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the feedback endpoint." }, { status: 502 });
  }
}
