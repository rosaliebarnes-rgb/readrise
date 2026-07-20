# Setup — moving ReadRise into Claude Code and deploying from your machine

This kit is **additive**. It contains the project-context and dev/deploy files (`CLAUDE.md`,
`README.md`, `vercel.json`, `.env.example`, `.gitignore`) — **not** a copy of `index.html` or
`api/generate.js`. Your real app code stays the single source of truth in your GitHub repo, so
nothing here can diverge from what's live. You'll clone your repo, drop these files in next to
your code, and go.

---

## Step 1 — Get your repo onto your hard drive

Open a terminal in the folder where you keep projects, then clone the ReadRise repo that Vercel
builds from (replace the URL with your repo's):

```bash
git clone https://github.com/<your-username>/<readrise-repo>.git readrise
cd readrise
```

If you're not sure of the URL: go to https://vercel.com → the ReadRise project → Settings → Git,
and it shows the connected GitHub repository.

After cloning you should see your `index.html` and `api/generate.js` here.

## Step 2 — Drop in the kit files

Copy these files from the kit into the root of your cloned `readrise/` folder:

- `CLAUDE.md`  ← the important one; gives Claude Code full context every session
- `README.md`
- `vercel.json`
- `.env.example`
- `.gitignore`

**If a file already exists** (e.g. you already have a `.gitignore` or `vercel.json`), **merge**
rather than overwrite:
- `.gitignore` — just make sure `.env.local` and `.vercel` are ignored.
- `vercel.json` — if you already have one, only add the `functions` block (it raises the serverless
  timeout to 60s; text generation runs ~15s and the default Hobby timeout is 10s, which can cut it
  off). Don't clobber routing/rewrites you already rely on.

## Step 3 — Open in Claude Code

```bash
cd readrise
claude
```

Claude Code automatically reads `CLAUDE.md` on start, so it'll have the constitution, the phonics
protocol, the constraint hierarchy, the deploy gotchas, and the roadmap in context. A good first
prompt: *"Read CLAUDE.md, then give me a map of index.html — where prompt assembly, rendering, and
the word-bank logic each live."*

## Step 4 — Run it locally

```bash
npm i -g vercel     # once
vercel login        # once
vercel link         # pick the existing ReadRise project so local matches prod
cp .env.example .env.local
# → open .env.local and paste your real Anthropic key
vercel dev          # http://localhost:3000, with api/generate.js running
```

Test a real generation locally before you touch anything. `.env.local` is git-ignored — your key
never gets committed.

## Step 5 — Deploy from your machine

Your GitHub repo is already wired to Vercel, so deploying is just pushing:

```bash
git add -A
git commit -m "Add Claude Code context + dev scaffolding"
git push
```

Vercel redeploys automatically. Then **open the site in an incognito window and run a fresh
generation** — cached pages hide new behavior.

You can also deploy directly without going through GitHub if you ever want to:

```bash
vercel --prod
```

## The one thing that trips everyone up

If generation returns a **500 with "No outgoing requests"** in the Vercel logs, the function
couldn't see the API key. Fix: Vercel dashboard → Project → Settings → Environment Variables →
confirm `ANTHROPIC_API_KEY` is set with **Production** checked, then **redeploy** (a var added
after the last build is invisible until the next build).

---

## Sanity checklist
- [ ] `git clone` done; `index.html` + `api/generate.js` present locally
- [ ] Kit files copied in (existing ones merged, not overwritten)
- [ ] `.env.local` has your key and is git-ignored
- [ ] `vercel dev` runs a real generation locally
- [ ] Pushed; incognito fresh-generation test passes on the live URL
- [ ] `claude` picks up `CLAUDE.md` automatically
