"use client";

import type { Para, SamplePacket, Seg } from "@/lib/domain";
import { readingStyle, type ReaderSettings } from "@/lib/reader";
import ReaderControls from "./ReaderControls";

function Segment({ seg }: { seg: Seg }) {
  if (seg.layer === "proper") return <span className="layer-proper">{seg.t}</span>;
  if (seg.layer === "academic") {
    return (
      <span className="group relative inline-block">
        <span tabIndex={0} className="layer-academic cursor-help underline decoration-coral-ink/40 decoration-dotted underline-offset-4">
          {seg.t}
        </span>
        {seg.def && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-[12.5px] leading-snug font-normal text-[#f2ecdd] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <span className="font-medium text-white">{seg.t}</span> — {seg.def}
          </span>
        )}
      </span>
    );
  }
  return <>{seg.t}</>;
}

function Paragraph({ para }: { para: Para }) {
  return (
    <p className="mb-4">
      {para.map((seg, i) => (
        <Segment key={i} seg={seg} />
      ))}
    </p>
  );
}

function Meter({ pct, stage }: { pct: number; stage: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
        <span className="text-ink-soft">Decodable cold</span>
        <span className="font-medium text-pine">~{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hair">
        <div className="h-full rounded-full bg-pine" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11.5px] text-ink-soft">{stage} · exact, a decoding stage was set</div>
    </div>
  );
}

function TeacherNote({ note }: { note: SamplePacket["teacherNote"] }) {
  return (
    <div className="mb-7 rounded-xl border border-hair border-l-4 border-l-pine bg-pine-soft/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-pine uppercase">
          Teacher note
        </span>
        <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[10.5px] text-pine">
          screen only · not printed for students
        </span>
      </div>
      <dl className="space-y-1.5">
        {note.map((n) => (
          <div key={n.label} className="text-[13px] leading-snug">
            <dt className="inline font-medium text-ink">{n.label}. </dt>
            <dd className="inline text-ink-soft">{n.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 border-b border-hair pb-1.5 font-display text-[13px] font-bold tracking-wide text-pine uppercase">
      {children}
    </h3>
  );
}

export default function OutputPanel({
  packet,
  reader,
  onReaderChange,
}: {
  packet: SamplePacket;
  reader: ReaderSettings;
  onReaderChange: (s: ReaderSettings) => void;
}) {
  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ReaderControls value={reader} onChange={onReaderChange} />
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto rounded-lg border border-pine px-3.5 py-2 text-[13px] font-medium text-pine hover:bg-pine-soft"
        >
          Print / Save as PDF
        </button>
      </div>

      <Meter pct={packet.decodability} stage={packet.stageLabel} />
      <TeacherNote note={packet.teacherNote} />

      {/* The student surface — this is the only part that prints for the student. */}
      <div className="reading rounded-2xl border border-hair p-7 shadow-sm" style={readingStyle(reader)}>
        <h2 className="mb-5 font-display text-[26px] font-bold">{packet.title}</h2>
        {packet.paragraphs.map((para, i) => (
          <Paragraph key={i} para={para} />
        ))}

        <div className="mt-7 border-t border-black/10 pt-4 text-[13px]" style={{ fontFamily: '"Lexend", sans-serif' }}>
          <span className="mr-4 inline-flex items-center gap-1.5">
            <span className="layer-proper">name</span>
            <span className="opacity-70">real name or place — free to use, carries culture</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="layer-academic">word</span>
            <span className="opacity-70">academic word — taught inline, hover to define</span>
          </span>
        </div>
      </div>

      <SectionLabel>Word bank</SectionLabel>
      <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {packet.wordBank.map((w, i) => (
          <li key={w.word} className="text-[14px] leading-snug">
            <span className="mr-1 text-ink-soft">{i + 1}.</span>
            <span className="layer-academic">{w.word}</span>
            <span className="text-ink-soft"> — {w.def}</span>
          </li>
        ))}
      </ul>

      <SectionLabel>Comprehension</SectionLabel>
      <ol className="space-y-4">
        {packet.questions.map((q) => (
          <li key={q.n} className="border-b border-hair pb-4">
            <p className="text-[15px] leading-snug">
              <span className="mr-1.5 text-ink-soft">{q.n}.</span>
              {q.text}
              {q.bonus && (
                <span className="ml-2 rounded-full bg-ochre/15 px-2 py-0.5 text-[10.5px] font-medium text-ochre">
                  bonus · graded for attempt
                </span>
              )}
            </p>
            <div className="mt-3 space-y-3">
              <div className="h-px bg-hair" />
              <div className="h-px bg-hair" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
