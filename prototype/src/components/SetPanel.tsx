"use client";

import { useState } from "react";
import { AXES, BROAD_THEME, CCSS, LENGTHS, MODES, SKILLS } from "@/lib/domain";
import type { SetConfig } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">{label}</span>
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
  const axis = AXES.find((a) => a.id === cfg.axis) || AXES[0];
  const broad = BROAD_THEME.test(cfg.anchor.trim());
  const n = cfg.levels.length;
  const levelsReady = cfg.levels.every((l) => l.trim().length > 0);

  function setCount(next: number) {
    onChange({ levels: Array.from({ length: next }, (_, i) => cfg.levels[i] ?? "") });
  }
  function setLevel(i: number, v: string) {
    const levels = [...cfg.levels];
    levels[i] = v;
    onChange({ levels });
  }
  /* Optional shortcut: interpolate evenly between two endpoints. Numeric levels
     (Lexile / grade) interpolate; anything else just fills first and last. */
  function spread() {
    if (!lo.trim() || !hi.trim()) return;
    const nLo = parseFloat(lo.replace(/[^\d.]/g, ""));
    const nHi = parseFloat(hi.replace(/[^\d.]/g, ""));
    const suffix = /L\s*$/i.test(lo) || /L\s*$/i.test(hi) ? "L" : "";
    const levels = Array.from({ length: n }, (_, i) => {
      if (!isNaN(nLo) && !isNaN(nHi) && n > 1) {
        return `${Math.round(nLo + ((nHi - nLo) * i) / (n - 1))}${suffix}`;
      }
      return i === 0 ? lo : i === n - 1 ? hi : cfg.levels[i] ?? "";
    });
    onChange({ levels });
  }

  return (
    <div className="pb-4">
      <p className="mb-1 text-[12.5px] leading-snug text-ink-soft">
        One anchor, several texts at different levels, sharing a vocabulary spine — so the whole class
        reads about the same thing and can talk together. No student details are collected here.
      </p>

      <Field
        label="Anchor topic"
        hint={
          broad
            ? "That reads like a broad theme. Tight topics build vocabulary better — the words repeat because the content repeats."
            : "Tight topics build vocabulary better than broad themes."
        }
      >
        <input
          className={inputCls}
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

      <Field
        label="Level for each text — required"
        hint="Lexile, grade equivalent, or however you record levels. Nothing is inferred — the spread across levels is the whole point of a set."
      >
        <p className="mb-1.5 text-[11.5px] text-ink-soft">
          Quickest way: type your lowest and highest, then Spread to fill the rest.
        </p>
        <div className="mb-2 flex gap-1.5">
          <input className={inputCls} placeholder="lowest e.g. 300L" value={lo} onChange={(e) => setLo(e.target.value)} />
          <input className={inputCls} placeholder="highest e.g. 900L" value={hi} onChange={(e) => setHi(e.target.value)} />
          <button
            type="button"
            onClick={spread}
            className="flex-none rounded-lg border border-pine px-3 text-[12.5px] font-medium text-pine hover:bg-pine-soft"
          >
            Spread
          </button>
        </div>
        <div className="space-y-1.5">
          {cfg.levels.map((lv, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 flex-none text-[11.5px] text-ink-soft">Text {i + 1}</span>
              <input className={inputCls} placeholder="level" value={lv} onChange={(e) => setLevel(i, e.target.value)} />
            </div>
          ))}
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
        onClick={onPlan}
        disabled={busy || !cfg.anchor.trim() || !levelsReady}
        className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Planning…" : "Plan the set"}
      </button>
      <p className="mt-1.5 text-[11.5px] text-ink-soft">
        {!cfg.anchor.trim()
          ? "Add an anchor topic to start."
          : !levelsReady
            ? `Set a level for all ${n} texts first — without them every text lands at the same level, which defeats the set.`
            : "You review the plan before any text is written."}
      </p>
    </div>
  );
}
