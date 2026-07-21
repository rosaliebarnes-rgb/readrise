"use client";

import { segment, splitQuestions, type Seg } from "@/lib/parse";

/* Shared reading-surface pieces — used by the one-student output and by the
   class-set pack, so both render text identically. */

export function Segment({ seg }: { seg: Seg }) {
  if (seg.layer === "proper") return <span className="layer-proper">{seg.t}</span>;
  if (seg.layer === "academic") return <span className="layer-academic">{seg.t}</span>;
  return <>{seg.t}</>;
}

export function Line({ str }: { str: string }) {
  return (
    <>
      {segment(str).map((s, i) => (
        <Segment key={i} seg={s} />
      ))}
    </>
  );
}

export function Paragraph({ para }: { para: string }) {
  const lines = para.split("\n");
  return (
    <p className="mb-4">
      {lines.map((ln, i) => (
        <span key={i}>
          <Line str={ln} />
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

/* A blank the student writes on — forced by the renderer, never model output. */
export function Rule() {
  return <div className="my-2 h-6 border-b border-black/25" />;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 border-b border-hair pb-1.5 font-display text-[13px] font-bold tracking-wide text-pine uppercase">
      {children}
    </h3>
  );
}

export function Questions({ block, label }: { block: string; label: string }) {
  const { directions, questions } = splitQuestions(block);
  if (!questions.length) return null;
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      {directions && <p className="mb-3 text-[13px] leading-snug text-ink-soft italic">{directions}</p>}
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="border-b border-hair pb-3">
            <p className="text-[15px] leading-snug">
              <span className="mr-1.5 text-ink-soft">{i + 1}.</span>
              <Line str={q} />
            </p>
            <Rule />
            <Rule />
          </li>
        ))}
      </ol>
    </>
  );
}
