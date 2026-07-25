"use client";

import { useRef, useState } from "react";
import { LENGTHS } from "@/lib/domain";
import type { SetConfig } from "@/lib/types";
import DictateButton from "./DictateButton";
import SetGoalPicker from "./SetGoalPicker";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";
const missingCls = "border-ochre ring-2 ring-ochre/30";

/* Describe-first class set: one free-text field drives the whole set (the model
   derives the anchor, the vary-axis, and the shared vocabulary from it). The one
   thing kept structured is the level spread — it can't be inferred from prose,
   and the spread across levels is what makes it a set. */
export default function DescribeSetPanel({
  cfg,
  onChange,
  onPlan,
  busy,
}: {
  cfg: SetConfig;
  onChange: (patch: Partial<SetConfig>) => void;
  onPlan: () => void;
  busy: boolean;
}) {
  const [lo, setLo] = useState("");
  const [hi, setHi] = useState("");
  const [showEach, setShowEach] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const describeRef = useRef<HTMLTextAreaElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);

  const n = cfg.levels.length;
  const missingLevels = cfg.levels.filter((l) => !l.trim()).length;
  const needsDescribe = !cfg.describe.trim();

  function setLevel(i: number, v: string) {
    const levels = [...cfg.levels];
    levels[i] = v;
    onChange({ levels });
  }
  /* Even spread across `count` texts from the two endpoints. Numeric levels
     (Lexile / grade / WCPM) interpolate; anything non-numeric just fills first and
     last (and the teacher fine-tunes the middle by hand). Recomputed live as the
     lowest / highest / count change, so the per-text grid isn't needed up front. */
  function applySpread(loV: string, hiV: string, count: number) {
    if (!loV.trim() || !hiV.trim()) {
      onChange({ levels: Array.from({ length: count }, (_, i) => cfg.levels[i] ?? "") });
      return;
    }
    const nLo = parseFloat(loV.replace(/[^\d.]/g, ""));
    const nHi = parseFloat(hiV.replace(/[^\d.]/g, ""));
    const suffix = /L\s*$/i.test(loV) || /L\s*$/i.test(hiV) ? "L" : "";
    const levels = Array.from({ length: count }, (_, i) => {
      if (!isNaN(nLo) && !isNaN(nHi) && count > 1) {
        return `${Math.round(nLo + ((nHi - nLo) * i) / (count - 1))}${suffix}`;
      }
      return i === 0 ? loV : i === count - 1 ? hiV : cfg.levels[i] ?? "";
    });
    onChange({ levels });
  }

  function attemptPlan() {
    if (needsDescribe) {
      setAttempted(true);
      describeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      describeRef.current?.focus();
      return;
    }
    if (missingLevels) {
      setAttempted(true);
      setShowEach(true); // reveal the per-text fields so a gap can actually be fixed
      levelsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setAttempted(false);
    onPlan();
  }

  return (
    <div className="pb-4">
      <p className="mb-1 text-[12.5px] leading-snug text-ink-soft">
        Say what you want the set to do — the topic, how the texts should differ, the tone, any
        vocabulary to carry across. Type or dictate. Then set the lowest and highest reading level;
        that spread is what makes it a set.
      </p>

      <div className="mt-4">
        <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium tracking-wide text-pine">
          Describe the set
          <span className="rounded-full bg-ochre/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ochre uppercase">
            Required
          </span>
        </span>
        <textarea
          ref={describeRef}
          className={`${inputCls} min-h-[150px] resize-y leading-relaxed ${attempted && needsDescribe ? missingCls : ""}`}
          placeholder="e.g. A set on the Great Migration where each text follows a different city Black families moved to — Chicago, Detroit, Harlem, Oakland — and centers the churches, music, and businesses they built. Keep the same handful of words about community and migration across all of them. Celebratory in tone."
          value={cfg.describe}
          onChange={(e) => onChange({ describe: e.target.value })}
        />
        <div className="mt-1.5">
          <DictateButton onText={(t) => onChange({ describe: cfg.describe ? `${cfg.describe} ${t}` : t })} />
        </div>
        <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
          The planner derives the anchor, how the texts vary, and the shared vocabulary from this —
          all inside the constitution and the levels. You review the plan before any text is written.
        </span>
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">How many texts</span>
        <div className="flex gap-1.5">
          {[3, 4, 5, 6].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applySpread(lo, hi, c)}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                n === c
                  ? "border-pine bg-pine text-white"
                  : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4" ref={levelsRef}>
        <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium tracking-wide text-pine">
          Reading levels — lowest & highest
          <span className="rounded-full bg-ochre/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ochre uppercase">
            Required
          </span>
        </span>
        <div className="flex gap-1.5">
          <input
            className={`${inputCls} ${attempted && missingLevels ? missingCls : ""}`}
            placeholder="lowest e.g. 300L"
            value={lo}
            onChange={(e) => {
              setLo(e.target.value);
              applySpread(e.target.value, hi, n);
            }}
          />
          <input
            className={`${inputCls} ${attempted && missingLevels ? missingCls : ""}`}
            placeholder="highest e.g. 900L"
            value={hi}
            onChange={(e) => {
              setHi(e.target.value);
              applySpread(lo, e.target.value, n);
            }}
          />
        </div>

        {cfg.levels.some((l) => l.trim()) ? (
          <p className="mt-1.5 text-[11.5px] leading-snug text-ink-soft">
            Even spread across {n}:{" "}
            <span className="font-medium text-ink">
              {cfg.levels.map((l) => l.trim() || "—").join(" · ")}
            </span>
          </p>
        ) : (
          <p className="mt-1.5 text-[11.5px] leading-snug text-ink-soft">
            Set a lowest and highest — the {n} texts spread evenly between them.
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowEach((v) => !v)}
          className="mt-1.5 text-[12px] font-medium text-pine hover:underline"
        >
          {showEach ? "Hide per-text levels" : "Fine-tune each level"}
        </button>

        {showEach && (
          <div className="mt-2 space-y-1.5">
            {cfg.levels.map((lv, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 flex-none text-[11.5px] text-ink-soft">Text {i + 1}</span>
                <input
                  className={`${inputCls} ${attempted && !lv.trim() ? missingCls : ""}`}
                  placeholder="level"
                  value={lv}
                  onChange={(e) => setLevel(i, e.target.value)}
                />
              </div>
            ))}
            <p className="text-[11.5px] leading-snug text-ink-soft">
              You can also adjust any level when you review the plan, before texts are written.
            </p>
          </div>
        )}
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

      <div className="mt-4">
        <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">
          Include with each text
        </span>
        <p className="mb-1.5 text-[11.5px] leading-snug text-ink-soft">
          These attach to every text, so each student has the same pieces — which is what makes group
          compare-and-contrast possible.
        </p>
        <div className="space-y-1.5">
          {(
            [
              ["comprehension", "Comprehension questions"],
              ["summary", "Summary — write a summary of this text"],
              ["vocabDefs", "Vocabulary — define the shared words as used in this text"],
            ] as ["comprehension" | "summary" | "vocabDefs", string][]
          ).map(([k, lbl]) => (
            <label key={k} className="flex items-start gap-2.5 text-[13.5px] text-ink">
              <input
                type="checkbox"
                checked={cfg[k]}
                onChange={(e) => onChange({ [k]: e.target.checked })}
                className="mt-0.5 h-4 w-4 flex-none accent-pine"
              />
              {lbl}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={attemptPlan}
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Planning…" : "Plan the set"}
      </button>

      {attempted && (needsDescribe || missingLevels > 0) ? (
        <p className="mt-2 rounded-lg bg-ochre/15 px-3 py-2 text-[12px] leading-snug text-ochre">
          {needsDescribe
            ? "Describe the set first — it's what every text is built from."
            : `${missingLevels} of ${n} texts still ${missingLevels === 1 ? "needs a" : "need a"} reading level. They're highlighted above.`}
        </p>
      ) : (
        <p className="mt-1.5 text-[11.5px] text-ink-soft">
          You review the plan before any text is written.
        </p>
      )}
    </div>
  );
}
