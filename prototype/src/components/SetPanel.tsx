"use client";

import { useRef, useState } from "react";
import { AXES, BROAD_THEME, LENGTHS, MODES } from "@/lib/domain";
import type { SetConfig } from "@/lib/types";
import DictateButton from "./DictateButton";
import SetGoalPicker from "./SetGoalPicker";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";
const missingCls = "border-ochre ring-2 ring-ochre/30";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium tracking-wide text-pine">
        {label}
        {required && (
          <span className="rounded-full bg-ochre/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ochre uppercase">
            Required
          </span>
        )}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">{hint}</span>}
    </div>
  );
}

export default function SetPanel({
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
  const anchorRef = useRef<HTMLInputElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);

  const axis = AXES.find((a) => a.id === cfg.axis) || AXES[0];
  const broad = BROAD_THEME.test(cfg.anchor.trim());
  const n = cfg.levels.length;
  const missingLevels = cfg.levels.filter((l) => !l.trim()).length;
  const needsAnchor = !cfg.anchor.trim();

  function setLevel(i: number, v: string) {
    const levels = [...cfg.levels];
    levels[i] = v;
    onChange({ levels });
  }

  /* Even spread across `count` texts from the two endpoints, recomputed live as
     lowest / highest / count change. Numeric levels (Lexile / grade / WCPM)
     interpolate; anything non-numeric just fills first and last and the teacher
     fine-tunes the middle by hand. */
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

  /* Button stays enabled — clicking with gaps takes you to the problem instead
     of silently doing nothing. */
  function attemptPlan() {
    if (needsAnchor) {
      setAttempted(true);
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      anchorRef.current?.focus();
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
        One anchor, several texts at different levels, sharing a vocabulary spine — so the whole class
        reads about the same thing and can talk together. No student details are collected here.
      </p>

      <Field
        label="Anchor topic"
        required
        hint={
          broad
            ? "That reads like a broad theme. Tight topics build vocabulary better — the words repeat because the content repeats."
            : "Tight topics build vocabulary better than broad themes."
        }
      >
        <input
          ref={anchorRef}
          className={`${inputCls} ${attempted && needsAnchor ? missingCls : ""}`}
          placeholder="e.g. lowriders in East L.A., the Great Migration, coral reefs"
          value={cfg.anchor}
          onChange={(e) => onChange({ anchor: e.target.value })}
        />
        <div className="mt-1.5">
          <DictateButton onText={(t) => onChange({ anchor: cfg.anchor ? `${cfg.anchor} ${t}` : t })} />
        </div>
      </Field>

      <Field label="What varies across the texts" hint={axis.hint}>
        <select className={inputCls} value={cfg.axis} onChange={(e) => onChange({ axis: e.target.value })}>
          {AXES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Vocabulary to hold constant — optional"
        hint="Left blank, the planner picks 5–6 words that recur across every angle."
      >
        <input
          className={inputCls}
          placeholder="comma separated"
          value={cfg.sharedVocab}
          onChange={(e) => onChange({ sharedVocab: e.target.value })}
        />
      </Field>

      <Field label="How many texts">
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
      </Field>

      <Field label="Reading levels — lowest & highest" required>
        <div ref={levelsRef} className="flex gap-1.5">
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
            Set a lowest and highest — the {n} texts spread evenly between them. That spread is what
            makes it a set.
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
      </Field>

      <Field label="Mode">
        <select className={inputCls} value={cfg.mode} onChange={(e) => onChange({ mode: e.target.value })}>
          {MODES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </Field>

      <Field label="Length (each text)">
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
      </Field>

      <Field
        label="Notes for the writer — optional"
        hint="Steer the whole set in your own words — a framing, an era, a constraint, a topic to avoid across every text. Type or dictate. It works within the rules; it can't override the levels or the constitution."
      >
        <textarea
          className={`${inputCls} min-h-[72px] resize-y`}
          placeholder="e.g. tie every text to our resistance unit; keep the tone celebratory; no texts about incarceration"
          value={cfg.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
        <div className="mt-1.5">
          <DictateButton onText={(t) => onChange({ notes: cfg.notes ? `${cfg.notes} ${t}` : t })} />
        </div>
      </Field>

      <SetGoalPicker cfg={cfg} onChange={onChange} />

      <Field
        label="Include with each text"
        hint="These attach to every text, so each student has the same pieces for their own text — which is what makes group compare-and-contrast possible."
      >
        <div className="space-y-1.5">
          {(
            [
              ["comprehension", "Comprehension questions"],
              ["vocabDefs", "Vocabulary — define the shared words as used in this text"],
            ] as ["comprehension" | "vocabDefs", string][]
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
      </Field>

      <button
        type="button"
        onClick={attemptPlan}
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Planning…" : "Plan the set"}
      </button>

      {attempted && (needsAnchor || missingLevels > 0) ? (
        <p className="mt-2 rounded-lg bg-ochre/15 px-3 py-2 text-[12px] leading-snug text-ochre">
          {needsAnchor
            ? "Add an anchor topic — it's what every text in the set is about."
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
