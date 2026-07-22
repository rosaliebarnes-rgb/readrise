"use client";

import { useRef, useState } from "react";
import { AXES, BROAD_THEME, CCSS, LENGTHS, MODES, SKILLS } from "@/lib/domain";
import type { SetConfig } from "@/lib/types";

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
  const [attempted, setAttempted] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);

  const axis = AXES.find((a) => a.id === cfg.axis) || AXES[0];
  const broad = BROAD_THEME.test(cfg.anchor.trim());
  const n = cfg.levels.length;
  const missingLevels = cfg.levels.filter((l) => !l.trim()).length;
  const needsAnchor = !cfg.anchor.trim();

  function setCount(next: number) {
    onChange({ levels: Array.from({ length: next }, (_, i) => cfg.levels[i] ?? "") });
  }
  function setLevel(i: number, v: string) {
    const levels = [...cfg.levels];
    levels[i] = v;
    onChange({ levels });
  }

  /* Interpolate evenly between two endpoints. Numeric levels (Lexile / grade)
     interpolate; anything else just fills first and last. */
  function spread(loV = lo, hiV = hi) {
    if (!loV.trim() || !hiV.trim()) return;
    const nLo = parseFloat(loV.replace(/[^\d.]/g, ""));
    const nHi = parseFloat(hiV.replace(/[^\d.]/g, ""));
    const suffix = /L\s*$/i.test(loV) || /L\s*$/i.test(hiV) ? "L" : "";
    const levels = Array.from({ length: n }, (_, i) => {
      if (!isNaN(nLo) && !isNaN(nHi) && n > 1) {
        return `${Math.round(nLo + ((nHi - nLo) * i) / (n - 1))}${suffix}`;
      }
      return i === 0 ? loV : i === n - 1 ? hiV : cfg.levels[i] ?? "";
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
      levelsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      levelsRef.current?.querySelector<HTMLInputElement>("input[data-empty='1']")?.focus();
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
              onClick={() => setCount(c)}
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

      <Field label="Reading level for each text" required>
        <p className="mb-2 text-[11.5px] leading-snug text-ink-soft">
          Every text needs a level — the spread across levels is what makes it a set. Without them,
          every text lands at the same level.
        </p>

        <div ref={levelsRef}>
          <div className="mb-1 flex gap-1.5">
            <input
              className={inputCls}
              placeholder="lowest e.g. 300L"
              value={lo}
              onChange={(e) => setLo(e.target.value)}
              onBlur={() => spread()}
            />
            <input
              className={inputCls}
              placeholder="highest e.g. 900L"
              value={hi}
              onChange={(e) => setHi(e.target.value)}
              onBlur={() => spread()}
            />
            <button
              type="button"
              onClick={() => spread()}
              className="flex-none rounded-lg border border-pine px-3 text-[12.5px] font-medium text-pine hover:bg-pine-soft"
            >
              Fill
            </button>
          </div>
          <p className="mb-2.5 text-[11.5px] text-ink-soft">
            Type your lowest and highest — the rest fill in automatically. Edit any of them below.
          </p>

          <div className="space-y-1.5">
            {cfg.levels.map((lv, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 flex-none text-[11.5px] text-ink-soft">Text {i + 1}</span>
                <input
                  data-empty={lv.trim() ? "0" : "1"}
                  className={`${inputCls} ${attempted && !lv.trim() ? missingCls : ""}`}
                  placeholder="level"
                  value={lv}
                  onChange={(e) => setLevel(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
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

      <div className="mt-4">
        <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">
          Align to a goal — optional
        </span>
        <div className="mb-2 flex gap-1.5">
          {([["skill", "Skill"], ["standard", "Standard"]] as ["skill" | "standard", string][]).map(
            ([m, lbl]) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ goalMode: m })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
                  cfg.goalMode === m
                    ? "border-pine bg-pine text-white"
                    : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                }`}
              >
                {lbl}
              </button>
            ),
          )}
        </div>
        {cfg.goalMode === "skill" ? (
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((sk) => {
              const on = cfg.skillChips.includes(sk);
              return (
                <button
                  key={sk}
                  type="button"
                  onClick={() =>
                    onChange({
                      skillChips: on ? cfg.skillChips.filter((x) => x !== sk) : [...cfg.skillChips, sk],
                    })
                  }
                  className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                    on
                      ? "border-pine bg-pine text-white"
                      : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                  }`}
                >
                  {sk}
                </button>
              );
            })}
          </div>
        ) : (
          <select className={inputCls} value={cfg.ccss} onChange={(e) => onChange({ ccss: e.target.value })}>
            <option value="">Choose a standard…</option>
            {CCSS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.summary}
              </option>
            ))}
          </select>
        )}
        <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
          Shapes the comprehension questions on every text in the set.
        </span>
      </div>

      <Field
        label="Include with each text"
        hint="These attach to every text, so each student has the same pieces for their own text — which is what makes group compare-and-contrast possible."
      >
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
