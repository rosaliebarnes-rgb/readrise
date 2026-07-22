"use client";

import { useState } from "react";
import { splitTitle } from "@/lib/parse";
import { packHtml, packetText } from "@/lib/packet";
import { readingStyle, type ReaderSettings } from "@/lib/reader";
import type { SetConfig, SetPlan, SetTextResult } from "@/lib/types";
import { Paragraph, Questions, Rule, SectionLabel } from "./TextRender";
import ReaderControls from "./ReaderControls";

function VocabSpine({ vocab }: { vocab: string[] }) {
  if (!vocab.length) return null;
  return (
    <div className="mb-5 rounded-xl border border-hair bg-panel p-4">
      <div className="mb-2 text-[11px] font-semibold tracking-wide text-pine uppercase">
        Shared vocabulary — held constant across every text
      </div>
      <div className="flex flex-wrap gap-1.5">
        {vocab.map((w) => (
          <span key={w} className="layer-academic text-[13.5px]">
            {w}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] leading-snug text-ink-soft">
        Every student meets these same words, each at their own level. The repetition is the mechanism.
      </p>
    </div>
  );
}

/* Stage 1 output: the plan, editable, before any text is written. */
function PlanReview({
  plan,
  onChange,
  onWrite,
  busy,
}: {
  plan: SetPlan;
  onChange: (p: SetPlan) => void;
  onWrite: () => void;
  busy: boolean;
}) {
  function edit(i: number, patch: Partial<SetPlan["texts"][number]>) {
    const texts = plan.texts.map((t, j) => (j === i ? { ...t, ...patch } : t));
    onChange({ ...plan, texts });
  }
  const inputCls =
    "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink focus:border-pine";

  return (
    <div className="fade-in">
      <h2 className="font-display text-[22px] font-bold text-pine">Review the plan</h2>
      <p className="mt-1 mb-5 max-w-[62ch] text-[14px] text-ink-soft">
        Nothing has been written yet. Edit any title, angle, or level — then write the set.
      </p>

      <VocabSpine vocab={plan.vocab} />

      <div className="space-y-3">
        {plan.texts.map((t, i) => (
          <div key={t.n} className="rounded-xl border border-hair bg-panel p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-pine text-[12px] font-semibold text-white">
                {t.n}
              </span>
              <input
                className={`${inputCls} font-medium`}
                value={t.title}
                onChange={(e) => edit(i, { title: e.target.value })}
              />
              <input
                className="w-28 flex-none rounded-lg border border-hair bg-white px-2 py-2 text-[13px] text-ink-soft focus:border-pine"
                value={t.level}
                placeholder="level"
                onChange={(e) => edit(i, { level: e.target.value })}
              />
            </div>
            <textarea
              className={`${inputCls} min-h-[52px] resize-y text-[13.5px]`}
              value={t.angle}
              onChange={(e) => edit(i, { angle: e.target.value })}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onWrite}
        disabled={busy}
        className="mt-6 rounded-lg bg-pine px-5 py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Writing the texts…" : `Write all ${plan.texts.length} texts`}
      </button>
    </div>
  );
}

/* Student-completed scaffolds — renderer-enforced blanks, no model call. */
function VocabDefs({ vocab }: { vocab: string[] }) {
  if (!vocab.length) return null;
  return (
    <>
      <SectionLabel>Vocabulary</SectionLabel>
      <p className="mb-3 text-[13px] leading-snug text-ink-soft italic">
        What does each word mean in this text?
      </p>
      <div className="space-y-3">
        {vocab.map((w) => (
          <div key={w} className="flex items-baseline gap-3">
            <span className="layer-academic w-32 flex-none text-[14px]">{w}</span>
            <span className="h-6 flex-1 border-b border-black/25" />
          </div>
        ))}
      </div>
    </>
  );
}

function SummaryTask() {
  return (
    <>
      <SectionLabel>Summary</SectionLabel>
      <p className="mb-1 text-[15px]">Write a summary of this text in your own words.</p>
      <Rule />
      <Rule />
      <Rule />
      <Rule />
    </>
  );
}

/* Stage 2 output: the finished pack. */
function Pack({
  plan,
  results,
  anchor,
  cfg,
  reader,
  onReaderChange,
}: {
  plan: SetPlan;
  results: SetTextResult[];
  anchor: string;
  cfg: SetConfig;
  reader: ReaderSettings;
  onReaderChange: (s: ReaderSettings) => void;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const cur = results[Math.min(active, results.length - 1)];
  if (!cur) return null;
  const { title, paras } = splitTitle(cur.parsed.text);

  async function copyOne() {
    try {
      await navigator.clipboard.writeText(packetText(cur.parsed));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  function printPack() {
    const w = window.open("", "_blank", "width=880,height=1000");
    if (!w) {
      window.print();
      return;
    }
    w.document.open();
    w.document.write(packHtml(anchor, plan.vocab, results, window.location.origin, cfg));
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 400);
  }

  function printOne() {
    const w = window.open("", "_blank", "width=820,height=1000");
    if (!w) {
      window.print();
      return;
    }
    w.document.open();
    w.document.write(packHtml(anchor, plan.vocab, [cur], window.location.origin, cfg));
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 350);
  }

  return (
    <div className="fade-in">
      <div className="print-hide mb-5 flex flex-wrap items-center gap-3">
        <ReaderControls value={reader} onChange={onReaderChange} />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={copyOne}
            className="rounded-lg border border-hair px-3.5 py-2 text-[13px] font-medium text-ink-soft hover:bg-pine-soft"
          >
            {copied ? "Copied ✓" : "Copy this text"}
          </button>
          <button
            type="button"
            onClick={printOne}
            className="rounded-lg border border-pine px-3.5 py-2 text-[13px] font-medium text-pine hover:bg-pine-soft"
          >
            Print this text
          </button>
          <button
            type="button"
            onClick={printPack}
            className="rounded-lg bg-pine px-3.5 py-2 text-[13px] font-medium text-white hover:brightness-110"
          >
            Print whole pack
          </button>
        </div>
      </div>

      <VocabSpine vocab={plan.vocab} />

      <div className="print-hide mb-4 flex flex-wrap gap-1.5">
        {results.map((r, i) => (
          <button
            key={r.n}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
              i === active
                ? "border-pine bg-pine text-white"
                : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
            }`}
          >
            {r.n}. {r.level || "—"}
          </button>
        ))}
      </div>

      <div className="reading rounded-2xl border border-hair p-7 shadow-sm" style={readingStyle(reader)}>
        {title && <h2 className="mb-5 font-display text-[26px] font-bold">{title}</h2>}
        {paras.map((p, i) => (
          <Paragraph key={i} para={p} />
        ))}
      </div>

      {cur.parsed.comprehension && <Questions block={cur.parsed.comprehension} label="Comprehension" />}
      {cfg.vocabDefs && <VocabDefs vocab={plan.vocab} />}
      {cfg.summary && <SummaryTask />}
    </div>
  );
}

export default function SetOutput({
  plan,
  onPlanChange,
  results,
  anchor,
  cfg,
  busy,
  progress,
  onWrite,
  reader,
  onReaderChange,
}: {
  plan: SetPlan;
  onPlanChange: (p: SetPlan) => void;
  results: SetTextResult[];
  anchor: string;
  cfg: SetConfig;
  busy: boolean;
  progress: string;
  onWrite: () => void;
  reader: ReaderSettings;
  onReaderChange: (s: ReaderSettings) => void;
}) {
  if (results.length) {
    return (
      <Pack plan={plan} results={results} anchor={anchor} cfg={cfg} reader={reader} onReaderChange={onReaderChange} />
    );
  }
  return (
    <>
      {busy && progress && (
        <div className="mb-4 flex items-center gap-3 text-[14px] text-ink-soft">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-hair border-t-pine" />
          {progress}
        </div>
      )}
      <PlanReview plan={plan} onChange={onPlanChange} onWrite={onWrite} busy={busy} />
    </>
  );
}
