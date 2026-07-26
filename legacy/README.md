# legacy/ — the original single-file ReadRise app (retired 2026-07-25)

These are the files that ran ReadRise **before** the Next.js redesign. They are kept
for reference only. **Nothing here is deployed.**

- `index.html` — the entire original app: vanilla JS, no build step. UI, prompt
  assembly, rendering, word-bank/word-count logic all in one file.
- `api/generate.js` — the original Vercel serverless proxy that held the Anthropic
  key server-side (model was `claude-sonnet-4-6`).
- `vercel.json` — routing/function config for the above.

## What replaced it
The live app is now the **Next.js + TypeScript + Tailwind** app under [`../prototype/`](../prototype).
The production Vercel project (`readrise` → readrise-pi.vercel.app) builds it via
**Root Directory = `prototype`**. Model is now **`claude-opus-4-8`** (`prototype/src/lib/model.ts`).

Do not edit or resurrect these files. If you need to understand old behavior, read
them here; if you need to change behavior, change it in `prototype/`.
