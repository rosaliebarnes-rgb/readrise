"use client";

import { useState } from "react";
import { splitTitle } from "@/lib/parse";
import { packetHtml, packetText, rosterPackHtml } from "@/lib/packet";
import { readingStyle, type ReaderSettings } from "@/lib/reader";
import type { RosterResult } from "@/lib/types";
import { Paragraph, Questions } from "./TextRender";
import ReaderControls from "./ReaderControls";

export default function RosterOutput({
  results,
  reader,
  onReaderChange,
}: {
  results: RosterResult[];
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
  function printWindow(html: string) {
    const w = window.open("", "_blank", "width=860,height=1000");
    if (!w) {
      window.print();
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 400);
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
            onClick={() => printWindow(packetHtml(cur.parsed, window.location.origin))}
            className="rounded-lg border border-pine px-3.5 py-2 text-[13px] font-medium text-pine hover:bg-pine-soft"
          >
            Print this text
          </button>
          <button
            type="button"
            onClick={() => printWindow(rosterPackHtml(results, window.location.origin))}
            className="rounded-lg bg-pine px-3.5 py-2 text-[13px] font-medium text-white hover:brightness-110"
          >
            Print all {results.length}
          </button>
        </div>
      </div>

      <p className="print-hide mb-4 text-[12.5px] text-ink-soft">
        {results.length} texts generated — one per student. No student data is stored.
      </p>

      {/* student switcher */}
      <div className="print-hide mb-4 flex flex-wrap gap-1.5">
        {results.map((r, i) => (
          <button
            key={`${r.id}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
              i === active
                ? "border-pine bg-pine text-white"
                : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
            }`}
          >
            {r.id || `Student ${i + 1}`}
            {r.level ? <span className="opacity-70"> · {r.level}</span> : null}
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
    </div>
  );
}
