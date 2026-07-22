/* The brain. Ported from the live app's index.html, unchanged in substance.
   Server-only in practice (imported by the API route) — keeps the constitution
   out of the browser bundle. */

import { AXES, LENGTHS, STAGES, ccssLabel, type Stage } from "./domain";
import type { GenConfig, PlannedText, SetConfig, StudentProfile } from "./types";

export function resolveStage(profile: StudentProfile): Stage | null {
  return STAGES.find((s) => s.id === profile.stage) || null;
}

export const CONSTITUTION = `CORE VALUES (hold these in every text):
- Excellence: intellectual rigor. Never reduce conceptual depth.
- Joy: texts can be funny or surprising. Not every text needs a lesson.
- Resistance: honor dignity and agency. Center what people built and how they pushed back.

CONSTITUTION (follow every rule, every time):
- Write from an insider perspective, as if the reader belongs to the culture described.
- Never render AAVE or oral vernacular in writing. Use standard written English.
- Never default to tragedy for Black and brown lives. Center agency, resistance, and what people built.
- Never flatten an individual into a representative of their whole group.
- Never blend more than two interests in a single text.
- Scaffold linguistic complexity only. Never reduce the conceptual depth of the ideas.
- For any real person or event, include the date and the geographic context.
- Do not put fill-in-the-blank or response lines inside the reading text itself.`;

function independentRules(profile: StudentProfile): string {
  const stage = resolveStage(profile);
  const level = profile.comprehension;
  const who = profile.name || "this student";
  const culture = profile.culture || "(not given)";

  const decodingBlock = stage
    ? `DECODING STAGE: ${stage.label} (${stage.ufli})
DECODABLE — use ONLY these patterns (cumulative: everything at or below this stage): ${stage.decodable}.
NOT YET — do NOT use any word that needs these patterns; they are ABOVE this student's level: ${stage.excludes}.
- Check EVERY content word against the DECODABLE list, sound by sound, in your head before you write it. If a word contains any NOT-YET pattern, it is OFF-LEVEL: swap it for a decodable word that means the same thing, or drop it — even when the off-level word is the most natural or vivid choice. (At the lowest stages this is hard and that is the point: a plain decodable word beats a vivid off-level one, every time.)
- The ONLY off-level words allowed are: PROPER NOUNS (real names of real people and places), and at most ONE unavoidable core subject word that has no decodable substitute — use that one word a single time, then refer to "it", and list it in the teacher note under FRONT-LOAD. Every other word must be fully decodable at this stage.
- Common high-frequency SIGHT WORDS (the, a, is, was, of, to, they, said, you, when, one, are…) are read by sight, not sounded out — they are always fine, even if they contain a blend or digraph. This rule governs CONTENT words, not sight words.`
    : `NO DECODING STAGE GIVEN. The only measure is the reading level: ${level || "(none)"}.
- Work from that reading level. Keep words high-frequency and short; keep sentences simple.
- Decodability here is ESTIMATED, not exact — you cannot verify phonics patterns without a stage. Do not pretend otherwise. Say so in the teacher note.`;

  return `INDEPENDENT LEVEL — HARD CONSTRAINT.

The student must read this text COLD, unaided, at 90% accuracy or better. Nine of every ten words readable without help.

${decodingBlock}
${level && stage ? `Reading level (secondary): ${level}` : ""}

======================================================================
READ THIS FIRST — THE MOST COMMON FAILURE, AND IT IS A TOTAL FAILURE
======================================================================
When told to write at a low level, models cheat: they keep the words simple by making the SUBJECT generic. They drop the real topic — the history, the community, the craft, the idea — and write a bland vignette. A boy fixes a car. Nothing happens. Nobody is from anywhere.

THIS IS A FAILED TEXT. Hitting 90% does not redeem it. A culturally empty or intellectually empty text FAILS COMPLETELY.

Cultural richness lives in SUBJECT MATTER AND SPECIFICITY — never in long words or complex syntax. A text can be entirely one-syllable words and still be about East Los Angeles in 1958, about what people made and how they made it. SPECIFICITY IS FREE. Real names, real places, real years cost nothing in readability.

REQUIRED, for any real person, place, or event:
- A real named PLACE. Not "a town." → "East Los Angeles."
- A real YEAR or era. Not "long ago." → "in 1958." (Constitution: date AND geographic context.)
- Real named PEOPLE where they exist.
- A real IDEA. The text must be ABOUT something. But an idea is NOT the same as a fight. Craft, mastery, invention, patience, style, community, inheritance — what people made and how they made it — are real ideas, and they are enough. A text about how a thing is built, who taught whom, and what it means to the people who make it has full conceptual depth with no antagonist in it.
- DO NOT MANUFACTURE CONFLICT. Do not add a law, a villain, a police officer, or a struggle the teacher did not ask for. Never assume a community's story needs oppression in it to be worth telling — the achievement IS the story. (Constitution: never default to tragedy. Center what people built.)
- If a struggle IS genuinely central and was requested: tell it honestly. Do not imply a tidy victory that did not happen. If a law stood for decades, say so. Resistance is a long grind, not a single defiant gesture. Never trade truth for a satisfying ending.
- FICTION needs a real stake or tension — something at risk, resisted, or refused. Not just a pleasant moment.
- Characters must reflect ${who}'s world (background: ${culture}). NEVER a generic default name.
- If your draft could be about anyone, anywhere, START OVER.

======================================================================
THE CONSTRAINT HIERARCHY — obey absolutely
======================================================================
NEVER YIELDS:  reading level · conceptual depth · cultural integrity · factual truth
YIELDS, IN ORDER:  vocabulary precision  →  sentence structure  →  FORM

Exhaust every yielding option before touching content.
- Can't name a concept at this level? SHOW it. You may not write "hydraulic system" — but you CAN write: "They put a pump in the car. Flip a switch — it lifts. Flip it back — it drops." Concept intact; only vocabulary yielded.
- Prose going flat or thin? SWITCH TO FREE VERSE — BEFORE you simplify the subject. Form yields; content does not.

======================================================================
FORM
======================================================================
Short sentences in PROSE read as broken. Short lines in VERSE read as craft. Verse biography and documentary poetry are dignified, established forms for this exact reader.
- Try prose. The moment it goes thin, write FREE VERSE instead.
- MODE AND FACTS NEVER CHANGE. Nonfiction stays nonfiction — a form shift yields INFORMATIONAL VERSE (a documentary poem), still entirely true. Never invent people, events, or details. Poetry is not permission to fictionalize.
- The reader is ${profile.age || "an adolescent"}. Never write down to them.

======================================================================
WRITING RULES
======================================================================
- Prefer one-syllable words. Multisyllabic only when every syllable is decodable at this level.
- The ONLY permitted off-level words are PROPER NOUNS — real names of real people and places. Use them freely; they carry the culture and cost nothing.
- SUBSTITUTE common off-level content words for decodable ones. Do not repeat an off-level word just because it is the obvious choice. "car" is r-controlled and off-level → use "rod" (hot rod). "truck" → "rig" if it fits. Find the decodable word that carries the same meaning. If a core content word simply has no decodable substitute, use it once, then rely on "it".
- Sentences (or verse lines): 8 words or fewer. No embedded clauses.
- NEVER split a word into syllables to fake decodability. "Sat ur day" is FORBIDDEN — it is a broken word. Choose a different word ("one day").
- Unsure whether a word works at this level? DO NOT USE IT.

======================================================================
LAYER 2 VOCABULARY
======================================================================
Words too advanced to decode (hydraulic, generation, inspection) must NOT appear in the text at all. Keep them out; list them in the teacher note to FRONT-LOAD verbally. The student learns them from the teacher, not by decoding.

ITALICS / WORD BANK: mark on-level practice words with SINGLE asterisks only (*word*). NEVER use double asterisks (**bold**) anywhere. NEVER mark a whole line or phrase — only individual practice words. NEVER mark the hardest words in the text.`;
}

function comprehensionLogic(goalText: string): string {
  const g = (goalText || "").toLowerCase();
  const has = (s: string) => g.includes(s);
  if (has("vocabulary") || has("figurative") || has("word meaning") || has("meaning of") || has("context clue"))
    return `Write word-in-context questions in this exact frame: "The text uses the word [word] in this line: [quote the line]. Based on how it is used here, what do you think it means?"`;
  if (has("evidence") || has("cite"))
    return `Write find-the-evidence questions. Begin the section with ONE line that starts "DIRECTIONS:" telling the student they can copy the exact words from the text or write them in their own words — say this ONCE, here, not in each question. Then write the numbered questions, and VARY how each one asks: e.g. "Find the sentence that shows…", "Which line tells you…", "Copy the words that prove…", "Where does the text say…", "What line makes you think…". Each question points the student to a specific place in the text. Never repeat the same wording twice.`;
  if (has("main idea") || has("central idea") || has("theme") || has("summar"))
    return `Ask the reader to identify the central idea, distinguish it from supporting details, and write a one-sentence summary.`;
  if (has("analyze") || has("connect") || has("develop") || has("interact") || has("point of view"))
    return `Ask the reader to trace how specific individuals, events, or ideas in the text are connected to each other.`;
  if (has("argument") || has("claim") || has("evaluate"))
    return `Ask the reader to identify the central claim, evaluate the evidence, and decide whether it is convincing.`;
  return `Write 2 to 3 literal comprehension questions answerable directly from the text.`;
}

function twrInstructions(profile: StudentProfile, parts: string[]): string {
  const who = profile.name && profile.name.length <= 20 ? profile.name : "the main person in the text";
  const specs: Record<string, string> = {
    A: `A. Because, But, So
KERNEL: one 3–6 word kernel sentence, subject + verb only, no clauses, drawn from the text.
Then three lines, each the kernel followed by one conjunction:
- [kernel] because
- [kernel] but
- [kernel] so`,
    B: `B. Build a Sentence
KERNEL: a DIFFERENT 3–5 word sentence than A. You may paraphrase. Replace pronouns with the actual name (${who}).
Then exactly 3 fitting question words from: Where? When? How? Why? Which kind? With whom? — one per line, each starting with "-".`,
    C: `C. Write a Paragraph
CLAIM: a single claim sentence about ONE focused section of the text (not the whole text).
Then exactly 3 supporting details, each on its own line starting with "-". Do NOT place them in final logical order — the student will order them.
CONCLUSION: (output this label with NOTHING after it — the student writes the conclusion)`,
    D: `D. Topic Sentence from the 5 W's
FOCUS: name the one topic or moment from the text the student will write about (one short line).
Then output these five labels, each on its own line with NOTHING after the colon — the student fills them in:
WHO:
WHAT:
WHERE:
WHEN:
WHY:`,
  };
  const chosen = parts.map((p) => specs[p]).filter(Boolean).join("\n\n");
  const plural = parts.length > 1;
  return `===TWR===
Generate ONLY the Writing Revolution activit${plural ? "ies" : "y"} below, keeping the exact letter label shown. ${plural ? "These are scaffolds" : "This is a scaffold"} the STUDENT completes — do NOT do the student's writing for them in C or D.

${chosen}`;
}

export function buildPrompt(cfg: GenConfig, adjustment: string | null): string {
  const { profile, outputs } = cfg;
  const lengthObj = LENGTHS.find((l) => l.id === cfg.length) || LENGTHS[1];

  const p: string[] = [];
  p.push(
    `You are generating an intervention reading text for ReadRise, a literacy tool for special education and intervention teachers working with striving adolescent readers. The reader is older than the texts usually written at their decoding level — give them something intellectually serious and culturally alive, written at the level specified.`,
  );
  p.push(CONSTITUTION);
  p.push(`STUDENT PROFILE:
- Name/ID: ${profile.name || "(unnamed)"}
- Age: ${profile.age || "(n/a)"}
- Cultural background: ${profile.culture || "(n/a)"}
- Interests: ${profile.interests || "(n/a)"}
- Phonics target pattern: ${profile.phonicsLevel || "(n/a)"}${profile.phonicsOn ? " (PHONICS MODE ON)" : ""}
- Decoding stage: ${resolveStage(profile)?.label || "(not set)"}
- Comprehension level: ${profile.comprehension || "(n/a)"}`);
  p.push(`TEXT TO PRODUCE:
- Mode: ${cfg.mode}${cfg.genre ? `\n- Genre: ${cfg.genre}` : ""}
- Length: about ${lengthObj.target} words (${lengthObj.words}).
- READING LEVEL TARGET: ${cfg.readingTarget}`);
  if (cfg.goal) p.push(`LEARNING GOAL: ${cfg.goal}`);

  if (cfg.readingTarget === "Independent") {
    p.push(independentRules(profile));
  } else {
    p.push(
      `INSTRUCTIONAL LEVEL: This text will be read WITH teacher support. Stretch vocabulary and longer sentences are allowed. The student is not expected to decode every word unaided.`,
    );
  }

  if (profile.phonicsOn && profile.phonicsLevel) {
    p.push(
      `PHONICS TARGET: Seed words fitting the pattern "${profile.phonicsLevel}" naturally into the text. Italicize those phonics-target words by wrapping each in *single asterisks*.`,
    );
  } else {
    p.push(
      `VOCABULARY: Surface a small number of Academic Word List (AWL) words that fit the topic. Italicize them by wrapping each in *single asterisks*.`,
    );
  }

  if (cfg.requestedWords.trim()) {
    p.push(
      cfg.readingTarget === "Independent"
        ? `REQUESTED WORDS — the teacher wants these words used: ${cfg.requestedWords}.
- For each requested word that IS decodable at this student's level, work it into the text naturally and mark it with *single asterisks* as a practice word.
- For any requested word that is NOT decodable at this level, DO NOT force it into the decodable text — that breaks the 90% rule. Instead show the idea in words the student can read, and list the requested word in the teacher note under FRONT-LOAD for the teacher to pre-teach verbally.
- Never distort the subject or the facts to fit a word in.`
        : `REQUESTED WORDS — the teacher wants these words used: ${cfg.requestedWords}. Work them into the text naturally. Stretch words are allowed at this instructional level.`,
    );
  }

  // Proper-noun tagging — powers the sky-blue highlight layer in the reader.
  // Best-effort: if the model tags none, nothing breaks.
  p.push(
    `PROPER NOUNS: wrap each real proper noun that appears in the text — real names of people and real place names — in double curly braces, like {{East Los Angeles}} or {{Rosa}}. Tag every occurrence. Do NOT curly-brace anything that is not a real name or place. This tagging is invisible to the student; it drives a teacher-facing highlight.`,
  );

  const sections = ["===TEXT==="];
  const fmt = [
    `OUTPUT FORMAT — return ONLY the sections listed below, each opened by its exact marker on its own line. No preamble, no closing remarks, no markdown headers.`,
    `===TEXT===
Put a title on the first line, then the passage in normal paragraphs separated by a blank line. Italicize target words with *asterisks*. Wrap proper nouns in {{double curly braces}}.`,
  ];
  if (outputs.comprehension) {
    sections.push("===COMPREHENSION===");
    fmt.push(`===COMPREHENSION===
${comprehensionLogic(cfg.goal)} Number each question. 3 to 5 questions. No answer lines.${
      cfg.readingTarget === "Independent"
        ? " DECODABILITY: the QUESTIONS must be decodable at the same level as the text — a student who cannot read the question cannot answer it. BUT: keeping the questions readable does NOT mean making them trivial. NO yes/no questions. NO questions answerable by guessing. Every question must require the student to go back into the text and find something. Simple words, real thinking."
        : ""
    }`);
  }
  if (outputs.inference) {
    sections.push("===INFERENCE===");
    fmt.push(`===INFERENCE===
2 to 3 inference questions. Use the learning goal as the entry point, then push the reader past the literal into interpretation ("what does this suggest", "why might", "what can you conclude"). Number each. No answer lines.`);
  }
  if (outputs.wordProblems) {
    sections.push("===WORDPROBLEMS===");
    fmt.push(`===WORDPROBLEMS===
REQUIRED SECTION — always output it. Write 3 math word problems for the STUDENT to solve. Use the people, places, and objects from THIS text as the setting (its characters, its shop, its craft), but INVENT the numbers yourself so there is real math to do. Do NOT solve them, and do NOT reuse any problem worked out inside the text.
${cfg.mathSkill.trim() ? `- MATH LEVEL: target this skill/level — ${cfg.mathSkill.trim()}.` : "- MATH LEVEL: choose a level that suits the reader's age."}
- READING LEVEL is separate from math level: keep the WORDS decodable at the SAME reading level as the text${cfg.readingTarget === "Independent" ? " (90% decodable cold, per the rules above)" : ""}. The challenge is the MATH, not the reading — keep the numbers clean and easy to read.
- Each problem: 1 to 3 short decodable sentences that set up the situation, then one clear question. Number them 1, 2, 3. No answers, no answer lines.`);
  }
  if (outputs.twr && cfg.twrParts.length) {
    sections.push("===TWR===");
    fmt.push(twrInstructions(profile, cfg.twrParts));
  }
  if (cfg.readingTarget === "Independent") {
    sections.push("===TEACHERNOTE===");
    fmt.push(`===TEACHERNOTE===
A short note FOR THE TEACHER (never shown to the student). Exactly these lines:
FORM: name the form you used (prose, free verse, letter, dialogue) and, in one sentence, why — especially if you shifted away from prose.
FRONT-LOAD: list the Layer 2 words you kept OUT of the text and that the teacher should teach verbally before reading (e.g. hydraulic, generation). If none, write "none".
WATCH: one sentence on what to watch for as this student reads.
VERIFY: if this text names real people, organizations, dates, or events, list them here for the teacher to fact-check before use. Named organizations paired with specific years are the most error-prone. If the text asserts no specific facts, write "none".${resolveStage(profile) ? "" : '\nPRECISION: state that no decoding stage was given, so decodability is estimated from the reading level rather than verified against phonics patterns. Recommend the UFLI placement test for an exact stage.'}`);
  }
  p.push(fmt.join("\n\n"));
  p.push(`Sections to include, in this order: ${sections.join(" ")}`);
  p.push(`OUTPUT DISCIPLINE — READ LAST, OBEY ABSOLUTELY:
Your FIRST characters must be "===TEXT===". Do NOT write anything before it — no planning, no reasoning, no word-by-word phonics audit, no drafts, no "Let me think". Do all of that work in your head, invisibly. Output EVERY section named in the sections list above, each under its exact marker, in the given order — skipping a listed section is a failure. Output ONLY those marked sections and their content. Any text that appears before ===TEXT=== is a failure.`);

  if (adjustment === "simpler") {
    p.push(
      `ADJUSTMENT — SIMPLER SENTENCES: Lower the syntactic complexity. Shorter sentences, fewer clauses. Keep ALL cultural content and the full conceptual depth. Keep the same italicized target words.`,
    );
  } else if (adjustment === "tighter") {
    p.push(
      `ADJUSTMENT — TIGHTER PHONICS: Adhere more strictly to the phonics level "${profile.phonicsLevel}". Favor words that fit the pattern; swap out off-pattern multisyllabic words where you can without flattening meaning.`,
    );
  }
  return p.join("\n\n");
}

/* ---------------------------------------------------------------------------
   WIDE-READING CLASS SETS
   Stage 1 plans the set (angles + the shared vocabulary spine); the teacher
   reviews it; stage 2 writes each text. No student profile is involved.
--------------------------------------------------------------------------- */

function setGoal(cfg: SetConfig): string {
  return cfg.goalMode === "standard" ? ccssLabel(cfg.ccss) : (cfg.skillChips || []).join(", ");
}

export function buildSetPlanPrompt(cfg: SetConfig): string {
  const axis = AXES.find((a) => a.id === cfg.axis) || AXES[0];
  const n = cfg.levels.length;
  const p: string[] = [];

  p.push(
    `You are planning a WIDE-READING SET for one class: ${n} texts on ONE anchor, written at different reading levels, sharing a single vocabulary spine. Every student reads about the same thing at their own level, so the whole class can discuss it together.`,
  );
  p.push(CONSTITUTION);
  p.push(`THE SET:
- ANCHOR (every text is about this): ${cfg.anchor}
- WHAT VARIES ACROSS THE TEXTS: ${axis.label} — ${axis.hint}
- NUMBER OF TEXTS: ${n}
- READING LEVELS, in order: ${cfg.levels.map((l, i) => `text ${i + 1} = ${l.trim() || "(not set)"}`).join(" · ")}`);

  p.push(`SHARED VOCABULARY — the connective tissue of the set.
${
  cfg.sharedVocab.trim()
    ? `The teacher wants these words held constant in EVERY text: ${cfg.sharedVocab.trim()}. Use exactly these.`
    : `Choose 5 or 6 words that recur naturally across every angle of this anchor — content and academic words worth repeated encounters. No proper nouns, no function words.`
}
Every text uses the SAME words. The repetition is the point: a student meets each word in several contexts, each at their own level.`);

  p.push(`RULES FOR THE PLAN:
- Every text shares the anchor. ONLY the ${axis.label.toLowerCase()} varies. Each text gets a distinct, specific angle — no two may cover the same ground.
- BE SPECIFIC. Name real nations, peoples, places, and years. Never "traditions from around the world," never "a community somewhere." Cultural angles must be written from the INSIDE, as if the reader belongs to that community.
- RESTRICTED OR SACRED KNOWLEDGE IS NOT OURS TO RENDER. Anchor only on what communities have themselves made public.
- The LOWEST-level text must NOT go thin or babyish. Same conceptual depth as the highest — simpler words, not smaller ideas. If an angle only works at a high level, pick a different angle.
- Do not manufacture conflict, and never default to tragedy. What people built, and how, is the story.`);

  p.push(`OUTPUT FORMAT — output ONLY these two sections. No preamble, no closing remarks.
===VOCAB===
The shared words, comma separated, on one line.
===PLAN===
Exactly ${n} lines, one per text, each in THIS shape (pipe separated):
number | Title | one sentence naming the angle and how it varies on the axis
No extra commentary, no lines beyond ${n}.`);

  return p.join("\n\n");
}

export function buildSetTextPrompt(
  cfg: SetConfig,
  t: PlannedText,
  vocab: string[],
  total: number,
): string {
  const axis = AXES.find((a) => a.id === cfg.axis) || AXES[0];
  const lengthObj = LENGTHS.find((l) => l.id === cfg.length) || LENGTHS[1];
  const p: string[] = [];

  p.push(
    `You are writing ONE text in a wide-reading set for a class. Every text in the set shares an anchor and a vocabulary spine; this one has its own angle and its own reading level. The reader is an adolescent — intellectually serious, culturally alive, written at the level specified.`,
  );
  p.push(CONSTITUTION);
  p.push(`THIS TEXT:
- Text ${t.n} of ${total} in the set
- ANCHOR (shared by the whole set): ${cfg.anchor}
- THIS TEXT'S ANGLE (varies on ${axis.label}): ${t.title} — ${t.angle}
- READING LEVEL for this text: ${t.level.trim() || "(not set)"}
- Mode: ${cfg.mode}
- Length: about ${lengthObj.target} words (${lengthObj.words}).${setGoal(cfg) ? `
- LEARNING GOAL for the set: ${setGoal(cfg)}` : ""}`);

  p.push(`SHARED VOCABULARY — use EVERY one of these words naturally in this text: ${vocab.join(", ")}.
The same words appear in every text in the set. That is deliberate: repeated encounters at different levels are how the words stick. Italicize each one with *single asterisks* where it appears. Do NOT swap them for synonyms.`);

  const lo = (cfg.levels[0] || "").trim();
  const hi = (cfg.levels[cfg.levels.length - 1] || "").trim();

  p.push(`HITTING THE LEVEL — THIS IS WHAT MAKES IT A SET
- Write so a student reading at "${t.level.trim() || "this level"}" can read it. Lower levels: short sentences, high-frequency short words. Higher levels: more complex syntax and precision.
- This text sits at "${t.level.trim() || "(not set)"}" inside a set that spans ${lo || "?"} to ${hi || "?"}. The texts MUST be noticeably different in reading difficulty from each other — if this is one of the lower texts, it should read markedly simpler than the top of the range; if it is one of the higher texts, markedly richer. A set where every text reads the same has failed.
- Decodability here is ESTIMATED from a reading level, not verified against phonics patterns.
- A LOW-LEVEL TEXT MUST NOT GO THIN. Reduce linguistic complexity ONLY — never conceptual depth, cultural specificity, or truth. A simpler text is still about real named people, real places, real years. If prose goes flat at a low level, switch to FREE VERSE before you simplify the subject.
- Wrap real proper nouns (names of real people and real places) in {{double curly braces}}.`);

  const sections = ["===TEXT==="];
  const fmt = [
    `OUTPUT FORMAT — return ONLY the sections below, each under its exact marker.`,
    `===TEXT===
Put the title on the first line, then the passage in paragraphs separated by a blank line. Italicize the shared vocabulary with *asterisks*. Wrap proper nouns in {{curly braces}}.`,
  ];
  if (cfg.comprehension) {
    sections.push("===COMPREHENSION===");
    fmt.push(`===COMPREHENSION===
${comprehensionLogic(setGoal(cfg))} 3 to 4 questions, answerable from THIS text and readable at this text's level. No yes/no questions — every question sends the student back into the text. Number each. No answer lines.`);
  }
  p.push(fmt.join("\n\n"));
  p.push(`Sections to include, in this order: ${sections.join(" ")}`);
  p.push(`OUTPUT DISCIPLINE — READ LAST, OBEY ABSOLUTELY:
Your FIRST characters must be "===TEXT===". No planning, no reasoning, no preamble. Output every listed section under its exact marker, and nothing else.`);

  return p.join("\n\n");
}
