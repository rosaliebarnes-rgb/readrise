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
- [ ] _(add more as you find them)_

## 1. Finish the port to parity (Phase 2)
- [ ] **Class-set builder** — anchor topic + vary-axis + level spread, shared
      vocabulary held constant, plan-review step, pack outputs (glossary, Rolling
      Knowledge Journal, Rolling Vocabulary / Sensational Six, outside-resource
      suggestions), print-whole-pack.
- [ ] **Feedback path** — browser → Google Apps Script → Sheet (carry over endpoint).
- [ ] **Learning goal, full version** — restore the goal picker as
      **"Align to: Skill · IEP goal · Standard"** (drives the comprehension-question
      logic; currently one free-text box).
  - **IEP goal stays inside One Student** (decided) — its own textarea with an
    inline privacy note ("pasted to shape the activity, then discarded — never
    stored"); the name field stays optional. Not a separate top-level tab.
  - **CCSS standards must show a plain-language summary, not the bare code** —
    e.g. "RI.2 — Determine the central idea and summarize the key details," not
    just "RI.2." Teachers shouldn't have to decode standard numbers. (Build the
    full code→summary list as part of this item.)
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

**Planned text type — math word problems (inside One Student).** For IEP goals
like "read and comprehend word problems at level X." Recipe: numbered decodable
problems, culturally-relevant contexts (names/places from the kid's world =
culturally-relevant math), and reading-of-math scaffolds ("What is the question
asking? Which numbers do you need? What operation?"). **Separate dials for
reading level and math complexity** — a strong-in-math student may still decode
at a low level. Needs its own generation recipe, not the reading-passage prompt.

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
  - **Plan:** A/B Sonnet 4.6 vs Sonnet 5 vs Opus 4.8 on 3–4 real profiles before
    cutover; judge constitution adherence + decodability + cultural richness.
    Prior: lean Opus 4.8 for core generation, or Sonnet 5 if it matches.

## Closed
- One-click PDF download → not needed; browser Save as PDF is fine.
- **IEP goal placement** → **inside One Student** with inline privacy notes, not a
  separate top-level tab. A dedicated IEP surface is only warranted if IEP work
  grows richer features (goal → measurable objectives, aligned-activity bank,
  progress monitoring) — kept as a possible future direction.
