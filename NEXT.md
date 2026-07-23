# ReadRise — What's Next

Living backlog for the Next.js redesign. Work top-down. Prototype lives at
`prototype/`, deployed (isolated) to https://readrise-prototype.vercel.app.
Production `readrise` (the single-file `index.html` app) is untouched until cutover.

---

## Status — done
- Next.js 16 + TypeScript + Tailwind v4 prototype, deployed to its own Vercel
  project (`readrise-prototype`), production untouched.
- **Design:** Field Guide structure + Bright Reader two-layer highlights; stepped
  setup flow (Who → What they can read → What to make → Generate); phonics-ladder
  level picker; self-hosted dyslexia fonts (Lexend / Atkinson / OpenDyslexic).
- **Reader controls:** size, spacing, font, paper tint — live on the student surface.
- **Real generation engine** ported to TS (constitution, constraint hierarchy,
  buildPrompt, parse, word-bank derivation, word counts) and wired to the
  One-student flow via a Next Route Handler holding the key server-side.
- **Export:** print stylesheet + Copy student text + student-only Print / Save as
  PDF (teacher note can never leak into either).

---

## 0. Edits inbox
- [x] Include section split into **supports** (Word bank, Word count — checkboxes)
      and a **pick-one** Student activity (Comprehension / Inference / TWR / None),
      with a hint about going deep on one per text.
- [x] **Words to include** field — teacher-requested words woven in where decodable
      and marked as practice words; off-level ones routed to the teacher note's
      FRONT-LOAD list instead of being forced into the text.
- [x] **Decoding stage is clearable** — click the selected stage to toggle off, or
      a "Clear decoding stage" link; falls back to Instructional if nothing's left.
- [x] **Writing scaffolds are individually selectable** in the pick-one activity
      list (Write a paragraph = TWR-C / Sentence building = A+B / Topic sentence = D),
      so a teacher can match the specific IEP writing goal. Prompt emits only the
      chosen scaffold; renderer keeps the enforced blanks.
- [x] **Math word problems — for the student to solve** — new pick-one activity.
      Generates 3 unsolved problems set in the text's world, with a separate
      **math skill / level** control (reading stays at the student's decoding level;
      the two dials are independent). Renders with "show your work" + answer space,
      plus a teacher-only, print-hidden level caption. (Needed a stronger prompt:
      "REQUIRED SECTION" + an "emit every listed section" output-discipline rule —
      the reading-passage framing was causing the model to skip the section.)
- [x] **Evidence questions no longer repeat the same tail.** The "copy it or use
      your own words" guidance is stated once as a `DIRECTIONS:` line; the questions
      themselves vary ("Find the sentence that shows…", "Which line tells you…",
      "Copy the words that prove…", "Where does the text say…"). Renders once on
      screen, in Copy, and in the PDF.
- [x] **Decodability prompt-tightening pass.** Root cause: each stage's `decodable`
      field had degraded to example words ("cat, red, sit") instead of the phonics
      scope, and the prompt never said what's *off-limits*. Restored the full
      cumulative scope per stage, added an explicit **"NOT YET"** exclusion list, a
      per-word check, the one-core-word escape hatch, and a sight-word carve-out.
      Tighter adherence (esp. Opus 4.8) and off-level vocab now lands in FRONT-LOAD.
      **Finding:** the absolute-lowest stage (short vowels) stays hard for
      blend-heavy topics (band/drum/step all need blends) — a real pedagogical
      limit, not just a prompt bug. Adaptive thinking (per-word audit in thinking
      blocks) is the likely next lever.
- [x] **Decoding stage is no longer pre-engaged.** Part 2 starts with no stage
      selected — the teacher clicks to engage one. Reading target starts at
      Instructional (Independent needs a stage *or* a reading level).
- [x] **Activities are multi-select with a suggestion, not locked to one.** Part 3
      uses checkboxes: stack as many as the student needs; the hint suggests one per
      text. All unchecked = just the reading text. Selected writing scaffolds union
      together (A/B/C/D) so the prompt emits exactly the chosen ones.
- [x] **Class-set levels are required and actually differentiate.** They defaulted
      to blank, so every text landed at the same level (the spread is the whole
      point). Plan is now disabled until every text has a level, with a server-side
      guard as backup, and each text is told where it sits in the range so it
      calibrates against the others. Verified: 300L came out at 5.1 words/sentence
      vs 900L at 16.4.
- [x] **Notes for the writer (type or dictate).** Free-text steering field on One
      Student for the long tail of teacher intent the fields can't cover (framing,
      constraints, a student's topic to avoid → Hard Rule 4). In-app mic via the
      Web Speech API with a graceful fallback (the OS/keyboard mic dictates into any
      field anyway). Prompt-wired as strictly SUBORDINATE: it steers within the
      constitution, reading level, and factual truth, never over them. Verified:
      "make the lead a woman + make it tragic" → female lead honored, tragedy
      refused (centered craft/pride instead). _Not yet on class sets._
- [x] **Describe mode (prototype).** One Student now has an input-style toggle —
      **Guided steps** vs **Describe it**. Describe it = one big type-or-dictate
      field ("what do you need?") + the reading level (the one input that must stay
      exact) + an Independent/Instructional toggle. New /api/describe route +
      buildDescribePrompt: the description is the driving spec, still strictly
      subordinate to the constitution / level / truth (reuses the Independent
      constraint hierarchy). Result renders in the shared OutputPanel (adjust
      buttons hidden for describe). Verified: a paragraph naming topic + student +
      level + interest + goal + a no-violence refusal produced a 2nd-grade
      main-idea text about the Great Migration with marching band woven in and
      violence avoided. _Next if wanted: describe-mode 'adjust' (regenerate with a
      tweak), and the same for class sets._
- [x] **Describe it is now the DEFAULT input style** (leads over Guided steps).
      Fastest path for a teacher who knows their ask, and the direction we're
      building toward. Guided stays one tap away for the precision cases —
      **exact decoding-stage (UFLI) targeting only lives in Guided**; Describe is
      "estimated from a reading level." Easy to flip back if onboarding new teachers
      ever changes the calculus (one string + the default in `page.tsx`).
- [x] **Describe-mode refine.** After a describe result, a "Refine this text" bar
      (type or dictate + Enter-to-submit) applies one change and keeps the rest. The
      route carries the change + the prior output back to `buildDescribePrompt`
      (reassembled under its section markers), so the model edits instead of
      regenerating from scratch — still inside the reading level and the rules.
      Verified: base Celia Cruz text → "make it simpler + add an inference question"
      kept the text near-verbatim and swapped one literal Q for *"Why do you think
      her music mattered so much to people? Use clues from the text."* (still 5 Qs).
- [x] **Describe / dictate on class sets.** The set builder gains a **"Notes for the
      writer"** field (type or dictate) that steers the whole set, plus a Dictate
      button on the anchor. Wired into BOTH set prompts (plan + each text) as
      strictly subordinate — the constitution, the per-text levels, and truth win; a
      topic named off-limits stays out of *every* text. Verified: anchor "the Great
      Migration" + note "keep it celebratory — music/churches/businesses built; no
      lynching or race riots" planned three specific, celebratory angles (Bronzeville
      / Humboldt Park / Conant Gardens) with no violence framing.
- [ ] _(add more as you find them)_

> **Deploy note:** for the prototype, use `vercel deploy --prod --force` — a plain
> `--prod` deploy occasionally serves a stale build cache (a prompt-string change
> silently didn't ship until `--force`). Always smoke-test after deploying.

## 1. Finish the port to parity (Phase 2)
- [x] **Class-set builder (core)** — anchor topic + vary-axis + level spread with
      **shared vocabulary held constant**; two-stage flow (plan → review/edit the
      angles, titles, levels and the vocab spine → write all texts in parallel);
      pack view with per-text nav, Copy, and Print/PDF. **No student profile is
      collected** — zero privacy surface. Verified: a 300L and a 900L text on the
      same anchor both used 6/6 shared words, and the low-level text stayed
      specific and deep (named places, years, institutions), not thin.
  - [ ] _Pack extras still to add:_ pack glossary, Rolling Knowledge Journal,
        Rolling Vocabulary (Sensational Six), outside-resource suggestions, and
        print-the-whole-pack (currently per-text).
- [ ] **Feedback path** — browser → Google Apps Script → Sheet (carry over endpoint).
- [x] **Learning goal, full version** — shipped the **"Align to: Skill · IEP goal
      · Standard"** picker (drives the comprehension-question logic).
  - **IEP goal stays inside One Student** — its own textarea with an inline privacy
    note ("sent to the writer, then discarded — never stored"); name stays optional.
  - **CCSS shows plain-language summaries, not bare codes** — dropdown reads
    "RI.2 — Determine the central idea and summarize the key details." Broadened
    the comprehension logic to match the summary phrasing.
  - _Later:_ per-grade CCSS variants; auto-suggest the aligned activity from an
    IEP goal (e.g. paragraph goal → preselect the paragraph scaffold).
- [ ] Confirm remaining output toggles render end-to-end (word-count-by-paragraph,
      inference) and Simpler / Tighter adjustments feel right on real output.

## 2. Cutover to production (Phase 3) — only after sign-off
- [ ] Restructure repo so the Next app *is* the app (`prototype/` → root or `web/`).
- [ ] Point production `readrise` Vercel project at it; move `ANTHROPIC_API_KEY`
      + `ALLOWED_ORIGIN`; set up local `.env.local`.
- [ ] Retire `index.html` + `api/generate.js` (superseded).
- [ ] Update `CLAUDE.md` to the new architecture (held until now).
- [ ] Test in incognito with a fresh generation.

## 3. Design / UX polish
- [ ] Edits from §0.
- [ ] Dark mode for app chrome (reading surface already has a tint control).
- [ ] Mobile layout refinement; empty/error-state copy.

## 4. Deferred to fall (per CLAUDE.md — not now)
Accounts + Supabase + RLS + roles · hover-to-define (two-layer highlight is the
seed) · text-history log · teacher dashboard + "pattern-of-failure → mini-lesson"
trigger · tiered models (Haiku for definitions).

---

## Design notes (architecture)
From the IEP / text-type design conversation:

**Three independent axes.** Only ONE should be top-level tabs, or the tab bar
explodes combinatorially (a class set of word problems? an IEP-aligned passage?):
- **Scale** — one student ↔ class set. *(the current top-level tabs)*
- **Text type** — reading passage ↔ math word problems ↔ (later) fluency passage,
  content-area text… *(today only hinted at by Mode / Genre)*
- **Alignment** — skill / IEP goal / standard.

**Principle: text type drives which inputs appear.** A word-problem or
IEP-practice type can be **name-free by design** without forking the app — that
delivers the privacy benefit of a "separate tab" (nothing to collect) without
duplicating the student profile. The name field is already "Name or ID,"
passed-through and never stored; making it obviously optional / omitting it per
text type is what makes it *feel* safe.

**Math word problems.** A first version now ships as a pick-one **activity**
(student-solve problems set in the reading text's world, with separate reading /
math dials — see §0). Still open as a possible future **text type**: a
math-first / promptless generator where the whole deliverable is problems (little
or no reading passage), which would want its own recipe and a name-free form.
Reading-of-math scaffolds ("What is the question asking? Which numbers? What
operation?") are a natural add to either.

## Open decisions
- **Text-generation model.** Currently `claude-sonnet-4-6`. This is the single AI
  call (passage + questions + TWR + teacher note). Cost is negligible at pilot
  volume (~$0.03/gen on Sonnet, ~$0.05 on Opus, ~$0.01 on Haiku), so **quality
  drives the choice, not price** (CLAUDE.md §12).
  - Best quality: **Opus 4.8** ($5/$25/M).
  - Best value + faster: **Sonnet 5** ($3/$15; intro $2/$10 through 2026-08-31) —
    near-Opus reasoning at Sonnet price.
  - Least expensive: Haiku 4.5 ($1/$5) — **false economy for the core text**;
    reserve for fall tiering (definitions/thesaurus/examples).
  - **Bake-off run (2 profiles, thinking off):** Opus 4.8 stayed truthful (no
    fabricated details about real people), had the best decodability at the hardest
    level, and centered craft → **leaning Opus 4.8**. Sonnet 5 warm/fast/cheaper but
    drifted to fiction in a nonfiction slot. Sonnet 4.6 (current) fabricated details
    about a real person (car name/year for Ron Aguirre) — the clearest strike.
    _Not yet locked in_ — worth a larger run and a thinking-on comparison first.

## Closed
- One-click PDF download → not needed; browser Save as PDF is fine.
- **IEP goal placement** → **inside One Student** with inline privacy notes, not a
  separate top-level tab. A dedicated IEP surface is only warranted if IEP work
  grows richer features (goal → measurable objectives, aligned-activity bank,
  progress monitoring) — kept as a possible future direction.
