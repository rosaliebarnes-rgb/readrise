"use client";

import {
  FONT_LABEL,
  READER_DEFAULT,
  TINT,
  type ReaderFont,
  type ReaderSettings,
  type ReaderTint,
} from "@/lib/reader";

const SIZES = [17, 19, 22];
const LEADINGS: { value: number; label: string }[] = [
  { value: 1.5, label: "Compact" },
  { value: 1.62, label: "Roomy" },
  { value: 1.85, label: "Airy" },
];
const FONTS: ReaderFont[] = ["lexend", "atkinson", "opendyslexic"];
const TINTS: ReaderTint[] = ["cream", "white", "blue", "dark"];

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-wide text-ink-soft">{label}</span>
      <div className="flex overflow-hidden rounded-lg border border-hair">{children}</div>
    </div>
  );
}

function Seg({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={on}
      className={`px-2.5 py-1 text-[13px] leading-none transition-colors ${
        on ? "bg-pine text-white" : "bg-panel text-ink-soft hover:bg-pine-soft"
      }`}
    >
      {children}
    </button>
  );
}

export default function ReaderControls({
  value,
  onChange,
}: {
  value: ReaderSettings;
  onChange: (s: ReaderSettings) => void;
}) {
  const set = (patch: Partial<ReaderSettings>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-hair bg-panel/70 px-4 py-3">
      <span className="text-[12px] font-medium text-ink">Reader</span>

      <Group label="Size">
        {SIZES.map((s, i) => (
          <Seg key={s} on={value.size === s} onClick={() => set({ size: s })} title={`${s}px`}>
            <span style={{ fontSize: 11 + i * 2 }}>A</span>
          </Seg>
        ))}
      </Group>

      <Group label="Spacing">
        {LEADINGS.map((l) => (
          <Seg key={l.value} on={value.leading === l.value} onClick={() => set({ leading: l.value })}>
            {l.label}
          </Seg>
        ))}
      </Group>

      <Group label="Font">
        {FONTS.map((f) => (
          <Seg key={f} on={value.font === f} onClick={() => set({ font: f })}>
            {FONT_LABEL[f]}
          </Seg>
        ))}
      </Group>

      <Group label="Paper">
        {TINTS.map((t) => (
          <button
            key={t}
            type="button"
            title={TINT[t].label}
            aria-pressed={value.tint === t}
            onClick={() => set({ tint: t })}
            className={`h-6 w-6 border-l border-hair first:border-l-0 ${
              value.tint === t ? "ring-2 ring-inset ring-pine" : ""
            }`}
            style={{ background: TINT[t].bg }}
          >
            <span className="sr-only">{TINT[t].label}</span>
          </button>
        ))}
      </Group>

      <button
        type="button"
        onClick={() => onChange(READER_DEFAULT)}
        className="ml-auto text-[12px] text-ink-soft underline underline-offset-2 hover:text-pine"
      >
        Reset
      </button>
    </div>
  );
}
