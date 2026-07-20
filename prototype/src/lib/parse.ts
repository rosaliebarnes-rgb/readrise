/* Parsing, word-bank derivation, and word counting — ported from index.html.
   All pure functions, safe on client or server. Plus segment(), which powers
   the two-layer highlight in the reader. */

import type { ParsedSections } from "./types";

const KEYS: Record<string, keyof ParsedSections> = {
  TEXT: "text",
  WORDGRID: "wordgrid",
  COMPREHENSION: "comprehension",
  INFERENCE: "inference",
  TWR: "twr",
  TEACHERNOTE: "teachernote",
};

export function parseSections(raw: string): ParsedSections {
  const out: ParsedSections = {
    text: "",
    wordgrid: "",
    comprehension: "",
    inference: "",
    twr: "",
    teachernote: "",
  };
  if (!raw) return out;
  const parts = raw.split(/===\s*([A-Z]+)\s*===/g);
  for (let i = 1; i < parts.length; i += 2) {
    const key = KEYS[parts[i].trim()];
    if (key) out[key] = (parts[i + 1] || "").trim();
  }
  if (!out.text && !out.comprehension && !out.inference && !out.twr) out.text = raw.trim();
  return out;
}

/* Word bank = the italicised words in the text. Derived in code so it can never
   drift from the passage. Proper-noun {{braces}} are stripped first so a name
   never leaks into the bank. */
export function deriveWordBank(textBlock: string): string {
  const cleaned = textBlock.replace(/\*\*/g, "").replace(/\{\{|\}\}/g, "");
  const seen: string[] = [];
  const re = /\*([^*\n]+)\*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const w = m[1].trim();
    const tokens = w.split(/\s+/);
    if (tokens.length > 2) continue;
    if (!/[A-Za-z]/.test(w)) continue;
    if (!seen.some((x) => x.toLowerCase() === w.toLowerCase())) seen.push(w);
  }
  return seen.map((w, i) => `${i + 1}. ${w}`).join("\n");
}

/* Word counts are counting. JavaScript counts; a model guesses. */
export function appendWordCounts(textBlock: string): string {
  const lines = textBlock.split("\n");
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      start = i + 1;
      break;
    }
  }
  const head = lines.slice(0, start).join("\n");
  const body = lines.slice(start).join("\n");
  const paras = body.split(/\n\s*\n/);
  const counted = paras.map((para) => {
    if (!para.trim()) return para;
    const n = (para.replace(/[*{}]/g, "").match(/[A-Za-z'-]+/g) || []).length;
    return para.trimEnd() + ` (${n} words)`;
  });
  return head + "\n" + counted.join("\n\n");
}

export function numberedLines(block: string): string[] {
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\s*\d+[.)]\s*/, ""));
}

/* Pull the title off the top and return the body paragraphs (verse-aware:
   internal single newlines are preserved by the caller). */
export function splitTitle(text: string): { title: string; paras: string[] } {
  const lines = text.split("\n");
  let title = "";
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      title = lines[i].replace(/^#+\s*/, "").replace(/\{\{|\}\}/g, "").replace(/\*/g, "").trim();
      start = i + 1;
      break;
    }
  }
  const paras = lines
    .slice(start)
    .join("\n")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  return { title, paras };
}

export type Layer = "proper" | "academic";
export interface Seg {
  t: string;
  layer?: Layer;
}

/* Tokenize a run of text into plain / *academic* / {{proper}} segments,
   preserving order. Internal newlines are kept as their own plain segments so
   verse lines survive. */
export function segment(str: string): Seg[] {
  const out: Seg[] = [];
  const re = /(\*[^*\n]+\*|\{\{[^}\n]+\}\})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) out.push({ t: str.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("*")) out.push({ t: tok.slice(1, -1), layer: "academic" });
    else out.push({ t: tok.slice(2, -2), layer: "proper" });
    last = re.lastIndex;
  }
  if (last < str.length) out.push({ t: str.slice(last) });
  return out;
}
