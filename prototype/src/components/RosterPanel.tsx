"use client";

import { useRef, useState } from "react";
import { LENGTHS, MODES } from "@/lib/domain";
import type { RosterConfig, RosterStudent } from "@/lib/types";
import SetGoalPicker from "./SetGoalPicker";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";
const smallCls =
  "rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-soft/60 focus:border-pine";
const missingCls = "border-ochre ring-2 ring-ochre/30";

function emptyStudent(): RosterStudent {
  return { id: "", level: "", interests: "", culture: "" };
}

/* Parse a pasted spreadsheet block: one student per line, columns separated by
   TAB (how a spreadsheet paste comes through) or comma. Column order:
   ID, Level, Interests, Culture. A header row (first cell looks like a label) is
   skipped. */
function parseRoster(text: string): RosterStudent[] {
  const rows: RosterStudent[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const cells = (line.includes("\t") ? line.split("\t") : line.split(",")).map((c) => c.trim());
    const [id = "", level = "", interests = "", culture = ""] = cells;
    if (/^(id|name|student|pseudonym|code)$/i.test(id) && /^(level|lexile|grade|reading)/i.test(level)) {
      continue; // header row
    }
    if (!id && !level && !interests) continue;
    rows.push({ id, level, interests, culture });
  }
  return rows;
}

export default function RosterPanel({
  cfg,
  onChange,
  onGenerate,
  busy,
}: {
  cfg: RosterConfig;
  onChange: (patch: Partial<RosterConfig>) => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  const [paste, setPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const students = cfg.students;
  const ready = students.filter((s) => s.id.trim() && s.level.trim()).length;
  const incomplete = students.some((s) => (s.id.trim() || s.interests.trim()) && !s.level.trim());

  function setStudent(i: number, patch: Partial<RosterStudent>) {
    onChange({ students: students.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  }
  function addRow() {
    onChange({ students: [...students, emptyStudent()] });
  }
  function removeRow(i: number) {
    const next = students.filter((_, j) => j !== i);
    onChange({ students: next.length ? next : [emptyStudent()] });
  }
  function loadPaste() {
    const parsed = parseRoster(paste);
    if (!parsed.length) return;
    // Replace the roster if it's just the empty starter row; otherwise append.
    const base = students.filter((s) => s.id.trim() || s.level.trim() || s.interests.trim());
    onChange({ students: [...base, ...parsed] });
    setPaste("");
    setShowPaste(false);
  }

  function attemptGenerate() {
    if (!ready) {
      setAttempted(true);
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setAttempted(false);
    onGenerate();
  }

  return (
    <div className="pb-4">
      <p className="mb-1 text-[12.5px] leading-snug text-ink-soft">
        A class list of students — pseudonyms only, no names. Each gets a text at their level, built
        from their interests. Paste your roster, or add rows by hand. Nothing here is stored.
      </p>

      {/* paste-from-spreadsheet */}
      <div className="mt-3">
        {showPaste ? (
          <div className="rounded-xl border border-hair bg-panel p-3">
            <div className="mb-1.5 text-[12px] font-medium tracking-wide text-pine">
              Paste from a spreadsheet
            </div>
            <textarea
              className={`${inputCls} min-h-[96px] resize-y font-mono text-[12.5px]`}
              placeholder={"One student per line. Columns: ID, Level, Interests, Culture\n\nA3F2\t2nd grade\tlowriders, drawing\tMexican American — East L.A.\nB7K9\t400L\tmarching band\nC1M4\t5th grade\tbasketball, sneakers\tBlack — Houston"}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={loadPaste}
                disabled={!paste.trim()}
                className="rounded-lg bg-pine px-3 py-1.5 text-[12.5px] font-medium text-white hover:brightness-110 disabled:opacity-50"
              >
                Load rows
              </button>
              <button
                type="button"
                onClick={() => setShowPaste(false)}
                className="text-[12px] text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <span className="ml-auto text-[11px] text-ink-soft">tab or comma separated</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPaste(true)}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:underline"
          >
            <span className="text-[15px] leading-none">⊞</span> Paste from a spreadsheet
          </button>
        )}
      </div>

      {/* the roster rows */}
      <div ref={listRef} className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium tracking-wide text-pine">
            Students <span className="text-ink-soft">({ready} ready)</span>
          </span>
        </div>
        <div className="space-y-2">
          {students.map((s, i) => {
            const needsLevel = attempted && (s.id.trim() || s.interests.trim()) && !s.level.trim();
            return (
              <div key={i} className="rounded-xl border border-hair bg-panel p-2.5">
                <div className="flex items-center gap-1.5">
                  <input
                    className={`${smallCls} w-20 flex-none`}
                    placeholder="ID"
                    value={s.id}
                    onChange={(e) => setStudent(i, { id: e.target.value })}
                  />
                  <input
                    className={`${smallCls} flex-1 ${needsLevel ? missingCls : ""}`}
                    placeholder="level (e.g. 2nd grade, 400L)"
                    value={s.level}
                    onChange={(e) => setStudent(i, { level: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remove student"
                    className="flex-none rounded-md px-1.5 py-1 text-[13px] text-ink-soft hover:bg-coral-bg hover:text-coral-ink"
                  >
                    ✕
                  </button>
                </div>
                <input
                  className={`${smallCls} mt-1.5 w-full`}
                  placeholder="interests (e.g. lowriders, drawing)"
                  value={s.interests}
                  onChange={(e) => setStudent(i, { interests: e.target.value })}
                />
                <input
                  className={`${smallCls} mt-1.5 w-full text-ink-soft`}
                  placeholder="cultural background — optional, keeps it specific"
                  value={s.culture}
                  onChange={(e) => setStudent(i, { culture: e.target.value })}
                />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:underline"
        >
          <span className="text-[15px] leading-none">+</span> Add a student
        </button>
      </div>

      {/* shared batch settings */}
      <div className="mt-5 border-t border-hair pt-4">
        <div className="mb-1.5 text-[12px] font-semibold tracking-wide text-pine uppercase">
          For the whole batch
        </div>

        <div className="mt-3">
          <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">
            Shared topic — optional
          </span>
          <input
            className={inputCls}
            placeholder="Blank = each student's own interests. Filled = everyone gets this topic, at their level."
            value={cfg.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">Reading target</span>
          <div className="flex gap-1.5">
            {(["Instructional", "Independent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ target: t })}
                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  cfg.target === t
                    ? "border-pine bg-pine text-white"
                    : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
            {cfg.target === "Independent"
              ? "~90% decodable cold. Estimated from each level (no decoding stage in batch mode)."
              : "Read with teacher support. Stretch words and longer sentences allowed."}
          </span>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">Mode</span>
          <select className={inputCls} value={cfg.mode} onChange={(e) => onChange({ mode: e.target.value })}>
            {MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">Length (each text)</span>
          <div className="flex flex-wrap gap-1.5">
            {LENGTHS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onChange({ length: l.id })}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                  cfg.length === l.id
                    ? "border-pine bg-pine text-white"
                    : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                }`}
              >
                {l.label} <span className="opacity-70">{l.words}</span>
              </button>
            ))}
          </div>
        </div>

        <SetGoalPicker cfg={cfg} onChange={onChange} />
      </div>

      <button
        type="button"
        onClick={attemptGenerate}
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Writing…" : `Generate ${ready || ""} text${ready === 1 ? "" : "s"}`.replace("  ", " ")}
      </button>
      {attempted && !ready ? (
        <p className="mt-2 rounded-lg bg-ochre/15 px-3 py-2 text-[12px] leading-snug text-ochre">
          Add at least one student with an ID and a reading level.
        </p>
      ) : incomplete ? (
        <p className="mt-1.5 text-[11.5px] text-ink-soft">
          Students missing a level are skipped. One tailored text + questions per ready student.
        </p>
      ) : (
        <p className="mt-1.5 text-[11.5px] text-ink-soft">One tailored text + questions per student.</p>
      )}
    </div>
  );
}
