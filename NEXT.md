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
- [ ] **Learning goal, full version** — restore Skills-chips / IEP-goal / CCSS tabs
      (they drive the comprehension-question logic; currently one free-text box).
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
