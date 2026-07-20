"use client";

import { numberedLines, segment, splitTitle, type Seg } from "@/lib/parse";
import { readingStyle, type ReaderSettings } from "@/lib/reader";
import type { ParsedSections } from "@/lib/types";
import ReaderControls from "./ReaderControls";

function Segment({ seg }: { seg: Seg }) {
  if (seg.layer === "proper") return <span className="layer-proper">{seg.t}</span>;
  if (seg.layer === "academic") return <span className="layer-academic">{seg.t}</span>;
  return <>{seg.t}</>;
}

function Line({ str }: { str: string }) {
  return (
    <>
      {segment(str).map((s, i) => (
        <Segment key={i} seg={s} />
      ))}
    </>
  );
}

function Paragraph({ para }: { para: string }) {
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

/* A blank the student writes on — forced by the renderer, never filled from
   model output. */
function Rule() {
  return <div className="my-2 h-6 border-b border-black/25" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 border-b border-hair pb-1.5 font-display text-[13px] font-bold tracking-wide text-pine uppercase">
      {children}
    </h3>
  );
}

function Questions({ block, label }: { block: string; label: string }) {
  const qs = numberedLines(block);
  if (!qs.length) return null;
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <ol className="space-y-4">
        {qs.map((q, i) => (
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

function TWR({ block }: { block: string }) {
  const chunks = block.split(/\n(?=[A-D]\.\s)/);
  return (
    <>
      <SectionLabel>Writing</SectionLabel>
      {chunks.map((chunk, ci) => {
        const lines = chunk
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!lines.length) return null;
        const letter = (lines[0].match(/^([A-D])\./) || [])[1];
        const header = lines[0].replace(/^[A-D]\.\s*/, "");
        const rest = lines.slice(1);

        const parts: React.ReactNode[] = [
          <div key="h" className="mt-4 mb-1.5 text-[15px] font-medium text-ink">
            {header}
          </div>,
        ];

        if (letter === "C") {
          const claim = rest.find((l) => /^CLAIM:/i.test(l));
          const details = rest.filter((l) => /^-\s*/.test(l)).map((l) => l.replace(/^-\s*/, ""));
          if (claim)
            parts.push(
              <p key="claim" className="text-[15px]">
                <strong>Claim:</strong> <Line str={claim.replace(/^CLAIM:\s*/i, "")} />
              </p>,
            );
          parts.push(
            <p key="hint" className="mt-1 mb-2 text-[13px] text-ink-soft italic">
              Number these details in the best order:
            </p>,
          );
          details.forEach((d, i) => {
            parts.push(
              <div key={`d${i}`} className="my-2 flex items-center gap-2.5 text-[15px]">
                <span className="h-6 w-6 flex-none rounded border border-black/25" />
                <span>
                  <Line str={d} />
                </span>
              </div>,
            );
          });
          parts.push(
            <p key="concl" className="mt-3 text-[15px]">
              <strong>Conclusion:</strong>
            </p>,
            <Rule key="conclrule" />,
          );
        } else if (letter === "D") {
          const focus = rest.find((l) => /^FOCUS:/i.test(l));
          if (focus)
            parts.push(
              <p key="focus" className="text-[15px]">
                <strong>Focus:</strong> <Line str={focus.replace(/^FOCUS:\s*/i, "")} />
              </p>,
            );
          ["Who", "What", "Where", "When", "Why"].forEach((w) => {
            parts.push(
              <p key={w} className="mt-2 text-[15px]">
                <strong>{w}:</strong>
              </p>,
              <Rule key={`${w}r`} />,
            );
          });
          parts.push(
            <p key="combine" className="mt-3 text-[15px]">
              Combine your answers into one topic sentence:
            </p>,
            <Rule key="combiner" />,
          );
        } else {
          rest.forEach((l, i) => {
            const kernel = l.match(/^KERNEL:\s*(.*)$/i);
            if (kernel) {
              parts.push(
                <p key={`k${i}`} className="mb-2 text-[15px] font-medium text-ink-soft">
                  {kernel[1]}
                </p>,
              );
            } else {
              parts.push(
                <p key={`l${i}`} className="mt-2 text-[15px]">
                  <Line str={l.replace(/^-\s*/, "")} />
                </p>,
                <Rule key={`lr${i}`} />,
              );
            }
          });
        }

        return (
          <div key={ci} className="avoid-break mb-2">
            {parts}
          </div>
        );
      })}
    </>
  );
}

function TeacherNote({ note }: { note: string }) {
  const lines = note
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div className="print-hide mb-7 rounded-xl border border-hair border-l-4 border-l-pine bg-pine-soft/60 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-pine uppercase">Teacher note</span>
        <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[10.5px] text-pine">
          screen only · not printed for students
        </span>
      </div>
      <dl className="space-y-1.5">
        {lines.map((l, i) => {
          const m = l.match(/^(FORM|FRONT-LOAD|WATCH|VERIFY|PRECISION):\s*(.*)$/i);
          return (
            <div key={i} className="text-[13px] leading-snug">
              {m ? (
                <>
                  <dt className="inline font-medium text-ink">{m[1].toUpperCase()}. </dt>
                  <dd className="inline text-ink-soft">{m[2]}</dd>
                </>
              ) : (
                <dd className="text-ink-soft">{l}</dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default function OutputPanel({
  parsed,
  subtitle,
  reader,
  onReaderChange,
  onAdjust,
  busy,
  phonicsOn,
}: {
  parsed: ParsedSections;
  subtitle: string;
  reader: ReaderSettings;
  onReaderChange: (s: ReaderSettings) => void;
  onAdjust: (a: "simpler" | "tighter") => void;
  busy: boolean;
  phonicsOn: boolean;
}) {
  const { title, paras } = splitTitle(parsed.text);
  const wordBank = numberedLines(parsed.wordgrid);

  return (
    <div className="fade-in">
      <div className="print-hide mb-6 flex flex-wrap items-center gap-3">
        <ReaderControls value={reader} onChange={onReaderChange} />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => onAdjust("simpler")}
            disabled={busy}
            className="rounded-lg border border-hair px-3 py-2 text-[13px] text-ink-soft hover:bg-pine-soft disabled:opacity-50"
          >
            Simpler sentences
          </button>
          {phonicsOn && (
            <button
              type="button"
              onClick={() => onAdjust("tighter")}
              disabled={busy}
              className="rounded-lg border border-hair px-3 py-2 text-[13px] text-ink-soft hover:bg-pine-soft disabled:opacity-50"
            >
              Tighter phonics
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-pine px-3.5 py-2 text-[13px] font-medium text-pine hover:bg-pine-soft"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {subtitle && <div className="print-hide mb-4 text-[12.5px] text-ink-soft">{subtitle}</div>}

      {parsed.teachernote && <TeacherNote note={parsed.teachernote} />}

      <div className="reading rounded-2xl border border-hair p-7 shadow-sm" style={readingStyle(reader)}>
        {title && <h2 className="mb-5 font-display text-[26px] font-bold">{title}</h2>}
        {paras.map((para, i) => (
          <Paragraph key={i} para={para} />
        ))}
        <div className="print-hide mt-7 border-t border-black/10 pt-4 text-[13px]" style={{ fontFamily: '"Lexend", sans-serif' }}>
          <span className="mr-4 inline-flex items-center gap-1.5">
            <span className="layer-proper">name</span>
            <span className="opacity-70">real name or place</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="layer-academic">word</span>
            <span className="opacity-70">practice word</span>
          </span>
        </div>
      </div>

      {wordBank.length > 0 && (
        <>
          <SectionLabel>Word bank</SectionLabel>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {wordBank.map((w, i) => (
              <li key={i} className="text-[14px] leading-snug">
                <span className="mr-1 text-ink-soft">{i + 1}.</span>
                <span className="layer-academic">{w}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {parsed.comprehension && <Questions block={parsed.comprehension} label="Comprehension" />}
      {parsed.inference && <Questions block={parsed.inference} label="Inference" />}
      {parsed.twr && <TWR block={parsed.twr} />}
    </div>
  );
}
