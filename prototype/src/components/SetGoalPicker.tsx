"use client";

import { CCSS, SKILLS } from "@/lib/domain";
import type { SetConfig } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";

/* Shared "Align to a goal" control for class sets — Skill or Standard only (no
   IEP goal on sets: a set serves a group, so nothing about one student is
   collected). Used by both the Guided and Describe set panels so they can't
   drift. When set, the resolved goal drives the comprehension-question frames on
   every text in the set (via comprehensionLogic in the set-text prompt). */
export default function SetGoalPicker({
  cfg,
  onChange,
}: {
  cfg: SetConfig;
  onChange: (patch: Partial<SetConfig>) => void;
}) {
  return (
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
  );
}
