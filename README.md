# ReadRise

A hosted web app that generates culturally relevant, decodable texts for struggling adolescent
readers — plus a four-day intervention around each text. Teachers open a URL and use it; no API
key required on their end.

**Live:** https://readrise-pi.vercel.app
**Stack:** one self-contained `index.html` (vanilla JS, no build step) + one Vercel serverless
function `api/generate.js` that holds the Anthropic key server-side.
**Model:** `claude-sonnet-4-6`.

> The full product context, pedagogy, and non-negotiable rules live in **`CLAUDE.md`** and in the
> source-of-truth docs in the Claude project. Read `CLAUDE.md` before making changes — most
> "bugs" here are prompt/pedagogy/profile-input problems, not code problems.

---

## Local development

This is a hosted app with a serverless function, so opening `index.html` directly in a browser
won't run generation. Use the Vercel CLI so `api/generate.js` runs locally:

```bash
npm i -g vercel        # once
vercel login           # once
vercel link            # link this folder to the existing ReadRise Vercel project
cp .env.example .env.local   # then paste your real key into .env.local
vercel dev             # serves the app + the function locally (usually http://localhost:3000)
```

`.env.local` is git-ignored and used only by `vercel dev`. Production uses the key stored in the
Vercel dashboard (Project → Settings → Environment Variables) — the two are separate.

If you only need to check static HTML/CSS, any static server works, but text generation will
return 500 without the function running.

## Deploy

Standard flow — Vercel auto-deploys from the connected GitHub branch:

```bash
git add -A
git commit -m "…"
git push
```

Then **test in incognito with a fresh generation** — cached pages and stale on-screen output hide
new behavior even when the new code is live.

### Gotchas that have actually bitten this project
- **Env var added after the last build is invisible to the running function.** Save the key,
  **then redeploy** with **Production** checked. Symptom of getting it wrong: a 500 with
  "No outgoing requests" in the logs.
- Keep the `claude-sonnet-4-6` model constant in sync across `index.html` and `api/generate.js`.
- Never hand-upload `index.html` through the GitHub web UI from a downloaded copy — browsers
  rename it `index(1).html` and Vercel ignores the duplicate. Use git.

## What not to touch / not to build yet
- `readrise.html` (old teacher-enters-own-key standalone) and the old `.jsx` artifact build are
  **superseded** — don't edit or resurrect them.
- Accounts, database, corrective feedback, hover-to-define, tiered models are **deferred** — see
  the roadmap in `CLAUDE.md` §11.

## Files
| File | Purpose |
|---|---|
| `index.html` | The entire app — UI, prompt assembly, rendering, word-bank/count logic |
| `api/generate.js` | Serverless proxy; holds `ANTHROPIC_API_KEY` |
| `CLAUDE.md` | Operating manual + all non-negotiable rules (read first) |
| `vercel.json` | Routing / function config |
| `.env.example` | Documents required env vars |
