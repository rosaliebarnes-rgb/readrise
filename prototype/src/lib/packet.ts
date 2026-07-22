/* Student-packet exporters. These build the student-facing content from
   scratch — the teacher note is never referenced, so it can never leak into a
   copy or a PDF, independent of any screen CSS. */

import { numberedLines, splitQuestions, splitTitle } from "./parse";
import type { ParsedSections } from "./types";

/* Strip the markup conventions so the student sees plain words. */
function plain(s: string): string {
  return s.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\{\{|\}\}/g, "");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ---- plain text (for Copy) ---- */
export function packetText(p: ParsedSections): string {
  const out: string[] = [];
  const { title, paras } = splitTitle(p.text);
  if (title) out.push(title, "");
  paras.forEach((para) => {
    out.push(plain(para));
    out.push("");
  });

  const bank = numberedLines(p.wordgrid);
  if (bank.length) {
    out.push("WORD BANK");
    bank.forEach((w, i) => out.push(`${i + 1}. ${plain(w)}`));
    out.push("");
  }

  const qBlock = (block: string, label: string) => {
    const { directions, questions } = splitQuestions(block);
    if (!questions.length) return;
    out.push(label.toUpperCase());
    if (directions) out.push(plain(directions));
    questions.forEach((q, i) => {
      out.push(`${i + 1}. ${plain(q)}`);
      out.push("");
      out.push("");
    });
  };
  qBlock(p.comprehension, "Comprehension");
  qBlock(p.inference, "Inference");

  if (p.wordproblems.trim()) {
    const wps = numberedLines(p.wordproblems);
    if (wps.length) {
      out.push("WORD PROBLEMS");
      wps.forEach((q, i) => {
        out.push(`${i + 1}. ${plain(q)}`);
        out.push("   Show your work:");
        out.push("");
        out.push("");
        out.push("   Answer: __________");
        out.push("");
      });
    }
  }

  if (p.twr.trim()) {
    out.push("WRITING");
    out.push(plain(p.twr));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/* ---- self-contained HTML doc (for the print window / Save as PDF) ---- */
const RULE = `<div style="border-bottom:1px solid #9a9a9a;height:1.5em;margin:8px 0;"></div>`;
const BOX = `<span style="display:inline-block;width:16px;height:16px;border:1px solid #9a9a9a;vertical-align:-2px;margin-right:8px;"></span>`;

function questionsHtml(block: string, label: string): string {
  const { directions, questions } = splitQuestions(block);
  if (!questions.length) return "";
  let h = `<h3>${esc(label)}</h3>`;
  if (directions) h += `<p style="font-style:italic;color:#555;margin:0 0 6px;">${esc(plain(directions))}</p>`;
  h += `<ol style="padding-left:1.4em;margin:0;">`;
  questions.forEach((q) => {
    h += `<li style="margin:0 0 4px;break-inside:avoid;">${esc(plain(q))}${RULE}${RULE}</li>`;
  });
  return h + `</ol>`;
}

function wordProblemsHtml(block: string): string {
  const qs = numberedLines(block);
  if (!qs.length) return "";
  let h = `<h3>Word problems</h3><ol style="padding-left:1.4em;margin:0;">`;
  qs.forEach((q) => {
    h += `<li style="margin:0 0 14px;break-inside:avoid;">${esc(plain(q))}<div style="font-size:10pt;color:#555;margin:6px 0 2px;">Show your work:</div>${RULE}${RULE}<div style="margin-top:2px;">Answer: ${"_".repeat(18)}</div></li>`;
  });
  return h + `</ol>`;
}

function twrHtml(block: string): string {
  const chunks = block.split(/\n(?=[A-D]\.\s)/);
  let h = `<h3>Writing</h3>`;
  chunks.forEach((chunk) => {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const letter = (lines[0].match(/^([A-D])\./) || [])[1];
    const header = esc(lines[0].replace(/^[A-D]\.\s*/, ""));
    const rest = lines.slice(1);
    h += `<div style="break-inside:avoid;margin:0 0 10px;"><p style="font-weight:bold;margin:12px 0 4px;">${header}</p>`;

    if (letter === "C") {
      const claim = rest.find((l) => /^CLAIM:/i.test(l));
      const details = rest.filter((l) => /^-\s*/.test(l)).map((l) => l.replace(/^-\s*/, ""));
      if (claim) h += `<p style="margin:2px 0;"><b>Claim:</b> ${esc(plain(claim.replace(/^CLAIM:\s*/i, "")))}</p>`;
      h += `<p style="font-style:italic;color:#555;margin:2px 0;">Number these details in the best order:</p>`;
      details.forEach((d) => {
        h += `<p style="margin:6px 0;">${BOX}${esc(plain(d))}</p>`;
      });
      h += `<p style="margin:8px 0 0;"><b>Conclusion:</b></p>${RULE}`;
    } else if (letter === "D") {
      const focus = rest.find((l) => /^FOCUS:/i.test(l));
      if (focus) h += `<p style="margin:2px 0;"><b>Focus:</b> ${esc(plain(focus.replace(/^FOCUS:\s*/i, "")))}</p>`;
      ["Who", "What", "Where", "When", "Why"].forEach((w) => {
        h += `<p style="margin:6px 0 0;"><b>${w}:</b></p>${RULE}`;
      });
      h += `<p style="margin:8px 0 0;">Combine your answers into one topic sentence:</p>${RULE}`;
    } else {
      rest.forEach((l) => {
        const kernel = l.match(/^KERNEL:\s*(.*)$/i);
        if (kernel) h += `<p style="font-weight:600;color:#444;margin:2px 0 6px;">${esc(plain(kernel[1]))}</p>`;
        else h += `<p style="margin:6px 0 0;">${esc(plain(l.replace(/^-\s*/, "")))}</p>${RULE}`;
      });
    }
    h += `</div>`;
  });
  return h;
}

export function packetHtml(p: ParsedSections, origin: string): string {
  const { title, paras } = splitTitle(p.text);
  const bank = numberedLines(p.wordgrid);

  let body = "";
  if (title) body += `<h1>${esc(title)}</h1>`;
  paras.forEach((para) => {
    const inner = esc(plain(para)).replace(/\n/g, "<br>");
    body += `<p class="read">${inner}</p>`;
  });
  if (bank.length) {
    body += `<h3>Word bank</h3><ol style="columns:2;padding-left:1.4em;margin:0;">`;
    bank.forEach((w) => (body += `<li>${esc(plain(w))}</li>`));
    body += `</ol>`;
  }
  body += questionsHtml(p.comprehension, "Comprehension");
  body += questionsHtml(p.inference, "Inference");
  body += wordProblemsHtml(p.wordproblems);
  if (p.twr.trim()) body += twrHtml(p.twr);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title || "ReadRise")}</title>
<style>
@font-face{font-family:"Lexend";font-weight:400;src:url("${origin}/fonts/lexend-400.woff2") format("woff2");}
@font-face{font-family:"Lexend";font-weight:600;src:url("${origin}/fonts/lexend-600.woff2") format("woff2");}
@page{margin:1.8cm;}
*{box-sizing:border-box;}
body{font-family:"Lexend",Arial,sans-serif;color:#111;line-height:1.6;letter-spacing:.01em;margin:0;max-width:40rem;}
h1{font-size:20pt;margin:0 0 12px;}
h3{font-size:11pt;text-transform:uppercase;letter-spacing:.05em;color:#1f5c46;border-bottom:1px solid #ccc;padding-bottom:3px;margin:22px 0 8px;break-after:avoid;}
p.read{font-size:13pt;max-width:44ch;margin:0 0 10px;}
ol,li{font-size:12pt;}
li{margin:0 0 3px;}
</style></head><body>${body}</body></html>`;
}

/* ---- the whole class-set pack as one printable document ---- */
export function packHtml(
  anchor: string,
  vocab: string[],
  items: { n: number; level: string; parsed: ParsedSections }[],
  origin: string,
): string {
  let body = `<h1>${esc(anchor || "Reading set")}</h1>
<p class="meta">${items.length} texts${vocab.length ? ` · shared vocabulary: ${esc(vocab.join(", "))}` : ""}</p>`;

  items.forEach((it, i) => {
    const { title, paras } = splitTitle(it.parsed.text);
    body += `<section class="${i ? "brk" : ""}">`;
    body += `<p class="lvl">Text ${it.n}${it.level ? ` · ${esc(it.level)}` : ""}</p>`;
    body += `<h2>${esc(title || `Text ${it.n}`)}</h2>`;
    paras.forEach((p) => {
      body += `<p class="read">${esc(plain(p)).replace(/\n/g, "<br>")}</p>`;
    });
    body += questionsHtml(it.parsed.comprehension, "Comprehension");
    body += `</section>`;
  });

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(anchor || "Reading set")}</title>
<style>
@font-face{font-family:"Lexend";font-weight:400;src:url("${origin}/fonts/lexend-400.woff2") format("woff2");}
@font-face{font-family:"Lexend";font-weight:600;src:url("${origin}/fonts/lexend-600.woff2") format("woff2");}
@page{margin:1.8cm;}
*{box-sizing:border-box;}
body{font-family:"Lexend",Arial,sans-serif;color:#111;line-height:1.6;letter-spacing:.01em;margin:0;max-width:40rem;}
h1{font-size:22pt;margin:0 0 4px;}
h2{font-size:17pt;margin:2px 0 12px;}
p.meta{font-size:10.5pt;color:#555;margin:0 0 22px;}
p.lvl{font-size:10pt;color:#1f5c46;letter-spacing:.05em;text-transform:uppercase;margin:0 0 2px;}
h3{font-size:11pt;text-transform:uppercase;letter-spacing:.05em;color:#1f5c46;border-bottom:1px solid #ccc;padding-bottom:3px;margin:22px 0 8px;break-after:avoid;}
p.read{font-size:13pt;max-width:44ch;margin:0 0 10px;}
ol,li{font-size:12pt;}
li{margin:0 0 3px;}
section.brk{break-before:page;}
</style></head><body>${body}</body></html>`;
}
