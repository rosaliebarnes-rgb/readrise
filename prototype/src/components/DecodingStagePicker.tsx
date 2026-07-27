"use client";

import { STAGES } from "@/lib/domain";

/* Decoding stage = where a student is in the phonics scope & sequence. This is
   program-agnostic — every structured-phonics curriculum (UFLI, Fundations,
   SIPPS, CKLA…) teaches the same code in nearly the same order. The stages are
   labeled with UFLI's numbering only because UFLI Foundations publishes its scope
   & sequence openly and free; the placement assessment is a free PDF for an exact
   stage. Don't imply a teacher must use UFLI — they don't. */
const UFLI_SITE_URL = "https://ufli.education.ufl.edu/foundations/";
const UFLI_ASSESSMENT_URL =
  "https://ufli.education.ufl.edu/wp-content/uploads/2025/08/UFLIAssessment_081025_v2.pdf";

const linkCls = "text-pine underline underline-offset-2 hover:brightness-110";

const selectCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink focus:border-pine";

/* Decoding stage as a dropdown (was a vertical ladder — dropped to reduce clutter).
   Stays unselected until the teacher picks one; choosing "No decoding stage set"
   clears it. Each option leads with the stage + examples (the universal concept)
   and shows the UFLI range as a reference. */
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
            {s.label} — {s.examples} · {s.ufli}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-[11.5px] leading-snug text-ink-soft">
        Where a student sits in the phonics scope &amp; sequence — nearly the same across programs
        (Fundations, SIPPS, CKLA…). The stages use{" "}
        <a href={UFLI_SITE_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
          UFLI Foundations
        </a>{" "}
        numbering because its scope &amp; sequence is published openly and free. Not sure of a stage?{" "}
        <a href={UFLI_ASSESSMENT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
          Free placement test →
        </a>
      </p>
    </div>
  );
}
