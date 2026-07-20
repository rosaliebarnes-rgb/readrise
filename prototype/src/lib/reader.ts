import type { CSSProperties } from "react";

export type ReaderFont = "lexend" | "atkinson" | "opendyslexic";
export type ReaderTint = "cream" | "white" | "blue" | "dark";

export interface ReaderSettings {
  size: number; // px
  leading: number; // unitless
  font: ReaderFont;
  tint: ReaderTint;
}

export const READER_DEFAULT: ReaderSettings = {
  size: 19,
  leading: 1.62,
  font: "lexend",
  tint: "cream",
};

export const FONT_STACK: Record<ReaderFont, string> = {
  lexend: '"Lexend", system-ui, sans-serif',
  atkinson: '"Atkinson Hyperlegible", system-ui, sans-serif',
  opendyslexic: '"OpenDyslexic", system-ui, sans-serif',
};

export const FONT_LABEL: Record<ReaderFont, string> = {
  lexend: "Lexend",
  atkinson: "Atkinson",
  opendyslexic: "OpenDyslexic",
};

export const TINT: Record<ReaderTint, { bg: string; ink: string; label: string }> = {
  cream: { bg: "#f6f0e2", ink: "#26241d", label: "Cream" },
  white: { bg: "#ffffff", ink: "#26241d", label: "White" },
  blue: { bg: "#e8f1f6", ink: "#1c3a4a", label: "Blue" },
  dark: { bg: "#2a2822", ink: "#f2ecdd", label: "Dark" },
};

export function readingStyle(s: ReaderSettings): CSSProperties {
  return {
    "--rd-size": `${s.size}px`,
    "--rd-leading": `${s.leading}`,
    "--rd-family": FONT_STACK[s.font],
    "--rd-paper": TINT[s.tint].bg,
    "--rd-paper-ink": TINT[s.tint].ink,
  } as CSSProperties;
}
