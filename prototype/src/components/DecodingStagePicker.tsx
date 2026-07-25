"use client";

import { STAGES } from "@/lib/domain";

/* UFLI Foundations — the University of Florida Literacy Institute's explicit,
   systematic phonics program, grounded in the science of reading. Its scope and
   sequence (what the stages below follow) is published free; the placement
   assessment is a free PDF for pinning a student's exact stage. */
const UFLI_SITE_URL = "https://ufli.education.ufl.edu/foundations/";
const UFLI_ASSESSMENT_URL =
  "https://ufli.education.ufl.edu/wp-content/uploads/2025/08/UFLIAssessment_081025_v2.pdf";

const linkCls = "text-pine underline underline-offset-2 hover:brightness-110";

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
      <p className="mt-1.5 text-[11.5px] leading-snug text-ink-soft">
        Stages follow the{" "}
        <a href={UFLI_SITE_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
          UFLI Foundations
        </a>{" "}
        scope &amp; sequence — a free, science-of-reading phonics progression. Not sure of a stage?{" "}
        <a href={UFLI_ASSESSMENT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
          Free placement test →
        </a>
      </p>
    </div>
  );
}
