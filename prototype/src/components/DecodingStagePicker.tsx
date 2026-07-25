"use client";

import { STAGES } from "@/lib/domain";

/* The UFLI placement assessment (free PDF). Restored from the production app — it's
   how a teacher pins an exact decoding stage when they don't already know it. */
const UFLI_ASSESSMENT_URL =
  "https://ufli.education.ufl.edu/wp-content/uploads/2025/08/UFLIAssessment_081025_v2.pdf";

const selectCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink focus:border-pine";

/* Decoding stage as a dropdown (was a vertical ladder — dropped to reduce clutter).
   Stays unselected until the teacher picks one; choosing "No decoding stage set"
   clears it. Each option carries its UFLI range + examples so the picker is still
   self-explanatory. */
export default function DecodingStagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div>
      <select className={selectCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">No decoding stage set</option>
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label} — {s.ufli} (e.g. {s.examples})
          </option>
        ))}
      </select>
      <a
        href={UFLI_ASSESSMENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-block text-[11.5px] text-pine underline underline-offset-2 hover:brightness-110"
      >
        Not sure which stage? Free UFLI placement test →
      </a>
    </div>
  );
}
