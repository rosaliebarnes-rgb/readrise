# CLAUDE.md — ReadRise

> Operating manual for Claude Code working in this repo. Read this first, every session.
> ReadRise generates culturally relevant, decodable texts so teachers can give struggling
> adolescent readers material they can decode cold **without** trading away cultural integrity
> or conceptual depth. The rules below are load-bearing. When in doubt, the source-of-truth
> documents in the Claude project win over this summary (see the doc map at the bottom).

---

## 0. The one-paragraph orientation

ReadRise is a hosted web app: a **Next.js 16 + TypeScript + Tailwind** app (App Router, vanilla
React, self-hosted dyslexia fonts) that lives in **`prototype/`** and holds the Anthropic key
server-side in Route Handlers. Teachers open a URL and use it; they never touch a key. It
generates a culturally-alive text a specific student can decode at ~90%+ cold, at levels as low
as first grade, plus the scaffolds/intervention around it — for **one student** or a **class
set** (a wide-reading jigsaw), each reachable via a **Describe it** (natural-language/dictation)
or **Guided steps** flow. The hard part is not the code — it is honoring the pedagogy and the
constitution in what the code produces. Most "bugs" are prompt, pedagogy, or profile-input
problems, **not** code problems. Diagnose in chat before touching files.

> **Cutover happened 2026-07-25.** The old single-file `index.html` + `api/generate.js` app was
> retired to **`legacy/`** (reference only, not deployed) and production was repointed to the
> Next.js app. See §1 for the current shape.

---

## 1. Architecture & stack

- **`prototype/`** — the entire live app (Next.js 16, App Router, React 19, Tailwind v4 via a
  CSS `@theme` block, TypeScript, **a build step**). See `prototype/AGENTS.md`: this Next major
  has breaking changes from training data — check `node_modules/next/dist/docs/` before writing
  Next-specific code. Key files:
  - `src/app/page.tsx` — the whole UI orchestrator (tabs, input-style toggles, output).
  - `src/lib/prompt.ts` — **the engine**: constitution, constraint hierarchy, `buildPrompt`,
    `buildDescribePrompt`, `buildSetPlanPrompt`/`buildSetTextPrompt`, `comprehensionLogic`.
  - `src/lib/model.ts` — the one model constant (see below).
  - `src/lib/domain.ts` / `parse.ts` / `packet.ts` / `reader.ts` / `types.ts` — data, parsing,
    print packets, reader settings, shared types.
  - `src/app/api/*/route.ts` — server Route Handlers holding `ANTHROPIC_API_KEY`:
    `generate`, `describe`, `plan-set`, `set-text`, `feedback`.
- **Model:** **`claude-opus-4-8`** — the single constant in `src/lib/model.ts`; every route
  defaults to it (locked in after the bake-off; see NEXT.md "Open decisions"). Routes still
  accept `sonnet-4-6`/`sonnet-5` as an override. (Fall plan may tier Haiku for
  definitions/thesaurus/examples — see §12. Not yet.)
- **Feedback path:** browser → `/api/feedback` (server-side) → Google Apps Script → Google Sheet.
  Open, describe-first: one free-text field + optional email/contact, at the foot of both tabs.
  The Apps Script URL is `FEEDBACK_WEBHOOK_URL` (falls back to the production feedback endpoint).
- **Hosting:** Vercel project **`readrise`** → **readrise-pi.vercel.app**, built with
  **Root Directory = `prototype`**. The isolated **`readrise-prototype`** project
  (readrise-prototype.vercel.app) still exists as a staging surface off the same repo.
- **Superseded — do not edit or resurrect:** everything in **`legacy/`** (the old single-file app
  + its `api/generate.js` and `vercel.json`), and the old `.jsx` artifact build.

### Repo layout
```
prototype/            # THE APP (Next.js) — deployed to production (Root Directory)
  src/app/            #   page.tsx + api/*/route.ts
  src/lib/            #   prompt.ts (engine), model.ts, domain/parse/packet/types…
  src/components/     #   panels, pickers, renderers
  AGENTS.md           #   "this is NOT the Next.js you know" — read the shipped docs
legacy/               # retired single-file app (index.html, api/generate.js) — NOT deployed
CLAUDE.md             # this file
NEXT.md               # living backlog / decisions log
README.md · SETUP.md  # human-facing notes
```

---

## 2. Local dev workflow (Claude Code)

> **Claude runs all command-line work in this project.** The user does not want to run shell
> commands themselves. When a task needs the terminal — git, `vercel`, `gh`, `npm`, deploys,
> checking logs — **Claude executes it directly** via its tools rather than printing commands for
> the user to copy-paste. Exceptions are only the things Claude *cannot* do: browser logins
> (Claude drives them and hands over the one-time code), Vercel **project settings** that aren't
> exposed to the CLI (e.g. Root Directory — the stored CLI token is not valid for the REST API,
> so this is a dashboard hand-off), and anything requiring the user's secrets. Report what was
> run and the result; don't hand back a to-do list of commands.

**Toolchain** (2026-07-19): Node via **nvm** (`~/.nvm`), `vercel` (global npm), `gh` in
`~/.local/bin`. GitHub (`rosaliebarnes-rgb`, HTTPS) and Vercel (scope `rosalie-s-projects3`,
projects `readrise` prod + `readrise-prototype` staging) are authenticated and linked. Node is
**not on the default PATH** — prefix terminal commands with:

```bash
export NVM_DIR="$HOME/.nvm"; \. "$NVM_DIR/nvm.sh" >/dev/null 2>&1; export PATH="$HOME/.local/bin:$PATH"
```

Run it locally from **`prototype/`**:

```bash
cd prototype && npm install && npm run dev     # Next dev server, usually :3000
# or `vercel dev` for the Route Handlers with local env
```

- Put the Anthropic key in `prototype/.env.local` (`ANTHROPIC_API_KEY`); never commit it.
- Local env and production env (Vercel → Project → Settings → Environment Variables) are
  separate — setting one does not set the other. `ANTHROPIC_API_KEY` is set on both `readrise`
  and `readrise-prototype` (Production + Preview).
- `npm run build` in `prototype/` is the fast correctness check before deploying.

---

## 3. Deploy protocol & the gotchas that have actually bitten us

**Normal deploy:** edit → commit → push to `main`. The `readrise` project auto-deploys `main`
(Root Directory = `prototype`). Then test in incognito with a *fresh* generation.

- **Stale build cache:** a plain `vercel deploy --prod` has occasionally served a stale build (a
  prompt-string change silently didn't ship). Use **`vercel deploy --prod --force`** when
  CLI-deploying, and always smoke-test after.
- **Preview deployments are SSO-protected**, production alias is public. So an anonymous
  `curl` of a `*-rosalie-s-projects3.vercel.app` preview URL gets a 302 to `vercel.com/sso-api` —
  that's protection, not a bad build. Verify on the public production URL (with instant rollback
  armed) or promote and check readrise-pi.vercel.app.
- **`vercel promote <deployment>` rebuilds** a fresh production deployment (it doesn't just
  re-alias); wait for it to go Ready before the production alias switches.
- **Root Directory / Framework are dashboard settings** (not CLI-settable with the stored token).
  Production is `readrise` with Root Directory `prototype`, Framework Next.js.
- **Env var added after the last build is invisible** to the running deployment — save it, then
  redeploy with **Production** checked.
- **After deploying, test in incognito and run a *fresh* generation.** Cached pages and stale
  on-screen output show old behavior even when new code is live.
- **Rollback:** Vercel keeps prior production deployments — `vercel rollback` (or promote the
  prior deployment) restores instantly.

---

## 4. The non-negotiables (Constitution — these cannot be overridden)

These come from `constitution_v2_5.docx`. They are unconditional. Teacher instruction, student
preference, or convenience never overrides them. Full text lives in the project; the load-bearing set:

- **Insider perspective by default.** Write as if the student *belongs* to the culture described,
  not as if they're studying it from outside. A culturally "correct" text that feels sterile is
  a failure — cultural relevance is not a content checkbox.
- **Never render AAVE or any oral dialect in writing.** Risks caricature. (Hard Rule 3.)
- **Never invent a real-sounding person and present them as documented.** Fiction is labeled
  fiction. (Hard Rule 2.) Dramatized biographical work must say *"Dramatized. Based on the
  documented record of [Name]"* and use only what's actually known.
- **Never default to tragedy** as the frame for Black and brown lives. The achievement IS the
  story. (This is *not* avoidance of hard history — the Tulsa Race Massacre or the Holocaust,
  told honestly and centered on resistance/survival/agency, is doing exactly what the
  constitution asks.)
- **Never flatten an individual into a representative of a group.**
- **Reduce linguistic complexity only — never conceptual depth.** Scaffold access, not depth.
- **Max two interests per text**, and only combine when the connection is genuine. Interests are
  a *pool* rotated across a text set over time, not a checklist to complete in one text.
- **Honor student topic refusals** permanently (Hard Rule 4) — even against teacher instruction;
  offer alternative entry points in the teacher note instead.
- **No sexual content for/involving minors, and no content that facilitates or glorifies mass
  violence** (Hard Rule 1a/1b). Honest historical engagement with atrocity is not this; it's the
  facilitation of harm that's barred. Edge-case guidance in the constitution, §IX.
- **Genre parity.** Spoken word, oral history, interview, song-lyric analysis are equally valid
  to essay/article — often more powerful. Don't default to the essay.

Core values the whole thing serves: **Excellence · Joy · Resistance.** (Joy is a legitimate end
on its own — not every text must teach a lesson.)

---

## 5. The Independent-level engine — the core principle

This is BUILT AND WORKING. It makes culturally alive, decodable-cold texts at levels as low as
first grade. The mechanism is a strict **constraint hierarchy** — internalize it before touching
any generation prompt:

> **NEVER YIELDS:** reading level · conceptual depth · cultural integrity · factual truth
> **YIELDS, IN ORDER:** vocabulary precision → sentence structure → **form**

To hit a low level the model simplifies **words first, then sentences, then form** — and must
exhaust all three before it touches the **subject**. The default failure mode is keeping words
simple by making the subject generic ("a boy fixes a car"). That is a **total failure even at 90%
decodable.** Cultural richness lives in **subject matter and specificity, not syntax** — real
names, places, and years cost nothing decodable. **Specificity is free.**

- **Format-flex before content loss.** When prose at a low level would go thin or choppy, switch
  to **free verse** (or letter/dialogue) *before* sacrificing subject. Short verse lines read as
  craft, not brokenness — dignified for an adolescent, and double as a fluency intervention.
  Nonfiction that shifts form becomes *informational verse* — still entirely true. **Poetry is
  never license to fictionalize; mode and facts never change.**
- **Do not manufacture conflict.** A real *idea* is required, but an idea is not a fight. Craft,
  mastery, invention, patience, community, inheritance are full depth with no antagonist. Never
  assume a community's story needs oppression to be worth telling. If a struggle genuinely is
  central and requested, tell it honestly — no implied victories, no tidy endings.
- **Two ways to specify level:** reading level (Lexile / grade-equivalent / WCPM — the common
  path) OR decoding stage (plain-language picker → UFLI ranges — optional precision). Either one
  unlocks Independent. Reading-level-only is *estimated* decodability (Lexile measures sentence
  length + word frequency, not phonics) — the teacher note must say so and link the free UFLI
  placement test. **Grade-in-school was removed entirely** — enrolled grade says nothing about
  decoding level; age does the age-appropriateness work.

### Decoding rules the prompt enforces
- Only patterns at/below the student's stage; prefer one-syllable words.
- Only permitted off-level words are **proper nouns** (real names/places) — they carry culture free.
- **Substitute** off-level content words rather than repeat them ("car" → "rod"), and let the text
  define the substitution in-line ("A rod is a car, cut down and built up") — turn the constraint
  into teaching.
- Sentences / verse lines ≤ 8 words. **No syllable-splitting** to fake decodability ("Sat ur day"
  is forbidden).
- **Comprehension questions must be decodable too — but readable ≠ trivial.** No yes/no; every
  question sends the student back into the text.

### The teacher note (screen only, NEVER printed for the student)
Every Independent generation produces a teacher-only note with: **FORM** (form used and why),
**FRONT-LOAD** (Layer 2 words held *out* of the text for the teacher to pre-teach verbally),
**WATCH** (what to watch for as this student reads), **VERIFY** (every named person/org/date/event
to fact-check — named orgs paired with specific years are the most error-prone; the model will
confidently mis-pair and not notice), and **PRECISION** (when no decoding stage was given, declare
decodability is estimated and recommend the placement test).

---

## 6. Renderer-level scaffold enforcement (a rule about *where* logic lives)

**General principle: for any student-completed scaffold, the renderer must force the blank
regardless of model output.** Prompt instruction alone is insufficient — the model will fill
blanks it is told to leave empty. This currently bites two TWR writing activities:

- **Activity C — Paragraph Outline:** model supplies the claim + **exactly 3** supporting details,
  supplied **unordered** (student sequences them; render numbered boxes). **Conclusion line is
  blank** — the student writes it.
- **Activity D — 5 W's → Topic Sentence:** model supplies a FOCUS line naming the subject.
  **Who/What/Where/When/Why are empty labels** the student fills, then writes a topic sentence.

If the model completes C or D, the activity is destroyed. Enforce the blank in the renderer.

*Name field:* the student's real name is passed into TWR activity B as the sentence subject.
Placeholder names ("Test") produce placeholder sentences — a classic "it's a bug!" that is
actually bad input. Use real names.

---

## 7. Prompt / output engineering lessons (baked in — don't relearn the hard way)

- **This model does not support assistant-message prefill** (the API rejects it). To suppress
  reasoning preamble, use a strong final "output discipline" instruction **plus** a code-level
  guard that strips everything before the first `===TEXT===` marker.
- **The model has no hidden scratchpad — its reasoning IS output.** A long self-audit block once
  spent the whole token budget on visible reasoning and never wrote the text. Removed. The rules
  carry the work; don't add "think step by step and audit yourself out loud" blocks.
- **Word bank & word counts are done in code, not asked of the model.** The word bank is derived
  from the italicized words (cannot drift); counts are JavaScript. A model *guesses* counts.
- **Bold vs. italics:** the model uses `**bold**` for emphasis. The word-bank extractor must strip
  `**`, read only single-asterisk `*italics*`, and reject spans longer than two words (or it grabs
  whole lines).
- **`max_tokens: 4000`** is right once reasoning isn't leaking. Generation runs ~15s after
  suppressing preamble and trimming the prompt.

---

## 8. Phonics & vocabulary engine (from Document 2)

- **Two-layer model, never collapsed.** Layer 1 = phonics-target words (UFLI scope, escalating
  1→2→3 syllables, the assessed targets). Layer 2 = academic vocabulary (Coxhead AWL, **protected**
  from phonics constraints, always supported inline + flagged with sublist number). Layer 3 =
  high-frequency words (Dolch / NZ Word Project, naturally saturated). **Stripping "community" or
  "culture" to satisfy a phonics constraint violates the constitution.** The content layer is
  protected.
- **Track disaggregation first.** Phonics track (student has a UFLI concept target; UFLI governs
  the text; graded on phonics accuracy) vs. comprehension track (decoding is fine, meaning-making
  is the challenge; AWL is the primary target; graded on concrete comprehension). A student can be
  on both, but identify the primary track before generating. Unclear profile → flag for teacher.
- **UFLI scope (L1–L128)** is the phonics sequence: only deploy patterns already taught. Later
  patterns appearing as content vocabulary must be flagged in the teacher note as whole-word /
  preview items, not decodable targets. Stages are cumulative: short vowels → blends & digraphs →
  silent-e/VCe → vowel teams → r-controlled → suffixes/prefixes → multisyllabic/roots.
- **80% rule.** Grade at 80% on **concrete** questions only (pattern ID, vocab matching, literal
  recall, evidence location). Abstract questions (inference, connection, big idea, production) are
  **bonus — graded for genuine attempt, not correctness.** No yes/no concrete questions.
- **Population B (ELL outside US)** flips this: CEFR replaces UFLI, AWL becomes the primary layer,
  the vocabulary journal becomes the primary artifact. Placeholder only until China-context field
  work is done — don't build it yet.

---

## 9. Four-day intervention architecture (from Document 3)

Same text across all four days; what changes is cognitive demand. **Day 1** first encounter /
plant targets (must include ≥1 NOTICE prompt). **Day 2** word work + vocabulary journal (must
include ≥1 MATCH IT for AWL). **Day 3** inference / evidence / connection. **Day 4** student
produces something, with choice among ≥2 CREATE/WRITE/RESPOND prompts.

- **Max 4 prompts per day** — density is a real risk at 2nd–3rd grade level; go deep on fewer.
- Connection and Big Idea prompts are **always bonus**, never the only prompt on a day.
- Multiple choice only for RECALL and MATCH IT, with plausible distractors; never for inference
  or connection.
- **Speech-to-text is not a lesser modality** — many striving readers have rich oral language;
  don't make decoding the barrier to expressing comprehension.
- **What the teacher dashboard reports:** concrete score per day, bonus attempted (yes/no, not
  scored), AWL words encountered/journaled, time per day, specific wrong answers. **The
  class-level "pattern of failure → mini-lesson trigger"** ("7 of 12 missed Q3 Day 2") is the most
  important dashboard feature — build it before other dashboard work. **Never** surface bonus
  response *content*, per-question timing, or inter-student ranking.
- **Deferred by design — do not build early:** Student-as-Author mode (design before V3),
  V4 corrective feedback (needs literacy-coach-approved UFLI language; building it wrong is worse
  than not building it).

---

## 10. Privacy design — a decided constraint on all architecture

> ReadRise stores **pseudonymous reading levels — no student names, no IEP text — teacher-deletable,
> expiring yearly, with persistence entirely optional.**

**Core principle: the generator sees everything; the database remembers almost nothing.**
Passed through and discarded: name, IEP goal text, cultural background, interests, age. Stored:
pseudonymous ID, phonics/comprehension level, derived learning target, texts received, words
flagged. Five guarantees: no names · no IEP text · teacher-deletable (hard delete) · expires
yearly · optional persistence (**sign-in is sync, not gate** — the tool works fully with zero
account and zero stored data). This is only cheap if built into the first schema — respect it in
any data work. Named SPED records trigger FERPA/IDEA/COPPA review; the pseudonymous design shrinks
both the approval burden and the blast radius.

---

## 11. Roadmap — what to build, what NOT to build

**Ship state (post-cutover 2026-07-25): the Next.js app is live in production.** The detailed
running log of what shipped lives in **NEXT.md** — consult it before planning new work.
1. Independent reading level — **done** (§5).
2. **Wide-reading sets** — **done.** One anchor + a vary axis + a level spread with **shared
   vocabulary held constant**. UI = tabs at the top of the left panel `[ One student ] [ Class set ]`
   (each keeps its own state; shared output). Two-stage: plan → review → write in parallel. Both
   tabs have **Describe it** (natural-language/dictation, default) and **Guided steps**. Set mode
   has **no student profile** → zero privacy surface. Hard rule holds: the low-level text must not
   go thin; cultural sets insider-written and specific; restricted/sacred knowledge not ours.
3. **Describe-first + dictation, refine, feedback path, UFLI dropdown + placement link** — all
   **done** (see NEXT.md). Model **locked to Opus 4.8**.
4. **Text history (teacher-saved)** — a log of who received which text (student, date, phonics
   target, theme, title). A log, not a brain — prediction is dropped; the teacher makes every
   instructional decision. **Not yet built** (needs persistence — see Deferred).

**Deferred to fall:** accounts, database (Supabase + RLS + roles), hover-to-define (which doubles
as formative assessment — taps = words above independent level), gamified reading counts (no AI,
just counting), tiered models. **Deferred indefinitely:** lesson prediction / automatic UFLI
sequencing, subscription model.

**Cross-cutting hard rule:** always offer grade-level text AND an accessible independent text —
both cultural and student-centered. A low-level text must not go thin or babyish.

---

## 12. Model discipline (for when tiering arrives in the fall)

Cheapest-first ladder: **no model** for counting/extraction (word bank, word counts — already in
code) · **Haiku** for definitions/thesaurus/example sentences · **big model** for text generation
under the constraint hierarchy. The big-model reasoning is *not* waste — it is the product. At
pilot volume, API cost is dollars/month; don't sacrifice text quality to save pennies.

---

## 13. Working protocol — how to make changes safely

1. **Diagnose in chat before touching files.** Most "bugs" are prompt / pedagogy / profile-input
   problems (see the "Test" name). Reproduce and locate the real cause first.
2. **Renderer-level enforcement for any student-completed scaffold** — prompt instructions alone
   are insufficient (§6).
3. **The artifact is for iterating; the hosted app is for shipping.** Don't reintroduce artifact-only
   patterns (pop-ups, inline key entry) into the hosted app.
4. **Deploy = commit → Vercel auto-redeploys.** Then test in incognito with a fresh generation (§3).
   **Default behavior: commit and push changes straight to `main`** — the user wants this, and
   `main` is the production branch (auto-deploys). Don't ask for permission each time; just do it
   and report what was pushed and the deploy result. (Still pause to confirm only for genuinely
   destructive or irreversible actions — e.g. history rewrites, force-pushes, deleting data.)
5. **Model is one constant:** `prototype/src/lib/model.ts` (currently `claude-opus-4-8`). Every
   route reads it — no second copy to keep in sync.
6. When you change a rule that lives in a source doc, update the doc in the Claude project too —
   this file summarizes them and must not silently drift.
7. **Keep this CLAUDE.md current as you go.** At the end of any significant development chunk
   (a feature shipped, an architecture/workflow change, a new decision or constraint, a roadmap
   item completed or reprioritized), update the relevant section here so the file never drifts
   from reality. Fold it into the same commit/push as the work it documents. This is the user's
   standing instruction, not optional cleanup.

---

## 14. Source-of-truth doc map (authoritative; these override this file)

These live in the **Claude project "AI Reading Intervention"**, not in the repo. Pull the relevant
one into context when a task needs the full detail:

| What you need | Doc |
|---|---|
| Core values + hard rules (insider perspective, no AAVE, no default-to-tragedy, no flattening, max 2 interests) | `constitution_v2_5.docx` |
| Phonics/decodability — UFLI L1–L128, two-layer vocab model, placement | `phonics_vocab_protocol_v1.docx` |
| Activity types, four-day architecture, student-as-author, corrective feedback, prompt types | `intervention_design_guide_v1.docx` |
| Roster & student profiles (Period 2) | `student_profiles.xlsx` |
| What actually happened with real students | `pilot_field_notes.docx` + `teacher_observation_log.docx` |
| Canonical packet format | `intervention_lowrider_v2.docx` (teacher) / `intervention_lowrider_student.docx` (student) |
| Full current spec / entry point | `readrise_spec_v2_MERGED.md` |

**Current versions:** Constitution v2.5 · Phonics Protocol v1.0 · Design Guide v1.0 · Spec v2.1.

Key pilot findings that should shape any change: students don't read written instructions
independently (teacher front-loading is a **design dependency**, not a nice-to-have);
finding-evidence prompts land, abstract/bonus questions don't; VCe practice works at all levels.
