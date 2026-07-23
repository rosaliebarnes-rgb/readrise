"use client";

import type { Dispatch, SetStateAction } from "react";
import { CCSS, SKILLS } from "@/lib/domain";

export type GoalMode = "skill" | "iep" | "standard";

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";

/* Shared "Align to a goal" control — used by both the Guided steps and Describe it
   flows so they can't drift. When a goal is set it does real work: the resolved
   goal text drives the comprehension-question frames (evidence → DIRECTIONS line +
   varied phrasings, main idea → central idea, vocabulary → word-in-context). */
export default function GoalPicker({
  goalMode,
  setGoalMode,
  skillChips,
  setSkillChips,
  iepText,
  setIepText,
  ccss,
  setCcss,
}: {
  goalMode: GoalMode;
  setGoalMode: (m: GoalMode) => void;
  skillChips: string[];
  setSkillChips: Dispatch<SetStateAction<string[]>>;
  iepText: string;
  setIepText: (v: string) => void;
  ccss: string;
  setCcss: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">
        Align to a goal — optional
      </span>
      <div className="mb-2 flex gap-1.5">
        {(
          [
            ["skill", "Skill"],
            ["iep", "IEP goal"],
            ["standard", "Standard"],
          ] as [GoalMode, string][]
        ).map(([m, lbl]) => (
          <button
            key={m}
            type="button"
            onClick={() => setGoalMode(m)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
              goalMode === m
                ? "border-pine bg-pine text-white"
                : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {goalMode === "skill" && (
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map((s) => {
            const on = skillChips.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSkillChips((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                  on
                    ? "border-pine bg-pine text-white"
                    : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {goalMode === "iep" && (
        <div>
          <textarea
            className={`${inputCls} min-h-[80px] resize-y`}
            placeholder="Paste the IEP goal — e.g. 'Given a text at instructional level, [student] will identify the main idea and two supporting details with 80% accuracy across 3 trials.'"
            value={iepText}
            onChange={(e) => setIepText(e.target.value)}
          />
          <p className="mt-1.5 rounded-md bg-pine-soft/70 px-2.5 py-1.5 text-[11.5px] leading-snug text-pine">
            Sent to the writer to shape the activity, then discarded. Never stored — no name or IEP
            text is kept.
          </p>
        </div>
      )}

      {goalMode === "standard" && (
        <select className={inputCls} value={ccss} onChange={(e) => setCcss(e.target.value)}>
          <option value="">Choose a standard…</option>
          {CCSS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.summary}
            </option>
          ))}
        </select>
      )}

      <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
        Shapes the comprehension questions and the activity.
      </span>
    </div>
  );
}
