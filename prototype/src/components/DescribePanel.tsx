"use client";

import DictateButton from "./DictateButton";

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

export default function DescribePanel({
  text,
  level,
  target,
  onText,
  onLevel,
  onTarget,
  onGenerate,
  busy,
}: {
  text: string;
  level: string;
  target: "Independent" | "Instructional";
  onText: (t: string) => void;
  onLevel: (l: string) => void;
  onTarget: (t: "Independent" | "Instructional") => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  return (
    <div className="pb-4">
      <p className="mb-1 text-[12.5px] leading-snug text-ink-soft">
        Just say what you need — topic, the student, the goal, any framing. Type or dictate. The reading
        level is the one thing to set exactly.
      </p>

      <Field
        label="Describe what you need"
        hint="Everything except the reading level is pulled from this — topic, culture, interests, goal, framing, a topic to avoid."
      >
        <textarea
          className={`${inputCls} min-h-[160px] resize-y leading-relaxed`}
          placeholder="e.g. A short nonfiction text about the Great Migration for a 7th grader named Andre who reads around a 2nd-grade level and loves marching band. Focus on the main idea, and give me comprehension questions. He won't read anything about violence."
          value={text}
          onChange={(e) => onText(e.target.value)}
        />
        <div className="mt-1.5">
          <DictateButton onText={(t) => onText(text ? `${text} ${t}` : t)} />
        </div>
      </Field>

      <Field label="Reading level" hint="Lexile, grade equivalent, or WCPM — the one input that must be exact.">
        <input
          className={inputCls}
          placeholder="e.g. 420L, 2nd grade, 60 WCPM"
          value={level}
          onChange={(e) => onLevel(e.target.value)}
        />
      </Field>

      <Field label="Reading target">
        <div className="flex gap-1.5">
          {(["Instructional", "Independent"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTarget(t)}
              className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                target === t
                  ? "border-pine bg-pine text-white"
                  : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
          {target === "Independent"
            ? "Decodable ~90% cold. Without a decoding stage, decodability is estimated from the reading level — the teacher note says so."
            : "Read with teacher support. Stretch words and longer sentences allowed."}
        </span>
      </Field>

      <button
        type="button"
        onClick={onGenerate}
        disabled={busy || !text.trim()}
        className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Writing…" : "Generate text"}
      </button>
    </div>
  );
}
