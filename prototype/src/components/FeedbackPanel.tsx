"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";

/* Open, describe-first feedback. One free-text field plus a way to reach the
   teacher — no rating grid. Always available, not gated behind a generation.
   `context` is a short string (which tab/mode) attached automatically. */
export default function FeedbackPanel({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    if (!message.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, email, context }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || `Failed (${res.status}).`);
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Couldn't send.");
    }
  }

  return (
    <div className="print-hide mt-12 border-t border-hair pt-6">
      {!open ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[13px] text-ink-soft">
            Using the prototype? Tell us what worked and what didn&apos;t — we read every note.
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setStatus("idle");
            }}
            className="rounded-lg border border-pine px-3.5 py-2 text-[13px] font-medium text-pine hover:bg-pine-soft"
          >
            Share feedback
          </button>
        </div>
      ) : status === "sent" ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[14px] font-medium text-pine">Thank you — your feedback came through.</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-[13px] text-ink-soft underline hover:text-ink"
          >
            Send another
          </button>
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="mb-1.5 text-[12px] font-medium tracking-wide text-pine">Share feedback</div>
          <textarea
            className={`${inputCls} min-h-[96px] resize-y leading-relaxed`}
            placeholder="What worked? What fell short? What would you want next? Anything at all."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="email"
              className={`${inputCls} flex-1 min-w-[220px]`}
              placeholder="Email or contact — so we can follow up (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={send}
              disabled={status === "sending" || !message.trim()}
              className="rounded-lg bg-pine px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[13px] text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
          {status === "error" && (
            <p className="mt-2 text-[12.5px] text-coral-ink">{errorMsg} — please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
