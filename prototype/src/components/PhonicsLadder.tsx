"use client";

import { STAGES } from "@/lib/domain";

export default function PhonicsLadder({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const selectedIndex = STAGES.findIndex((s) => s.id === value);

  return (
    <div className="rounded-xl border border-hair bg-panel p-1.5">
      {STAGES.map((stage, i) => {
        const isSelected = i === selectedIndex;
        const included = selectedIndex >= 0 && i < selectedIndex;
        const above = selectedIndex >= 0 && i > selectedIndex;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onChange(stage.id)}
            aria-pressed={isSelected}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
              isSelected ? "bg-pine-soft" : "hover:bg-pine-soft/50"
            }`}
          >
            <span className="relative flex h-4 w-4 flex-none items-center justify-center">
              {i < STAGES.length - 1 && (
                <span
                  className="absolute top-1/2 left-1/2 h-[calc(100%+16px)] w-px -translate-x-1/2"
                  style={{ background: above ? "#e0d8c6" : "#c9bfa6" }}
                />
              )}
              <span
                className="relative h-3 w-3 rounded-full"
                style={{
                  background: isSelected ? "#c8862b" : included ? "#1f5c46" : "#d3cab4",
                }}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[13.5px] leading-tight ${
                  above ? "text-ink-soft" : "text-ink"
                } ${isSelected ? "font-medium" : ""}`}
              >
                {stage.label}
                {isSelected && <span className="ml-2 text-[11px] font-normal text-ochre">set here</span>}
              </span>
              <span className="block text-[11px] text-ink-soft">
                {stage.decodable} · {stage.ufli}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
