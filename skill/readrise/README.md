# ReadRise skill

A Claude Agent Skill that generates **culturally-relevant, decodable reading passages**
for striving K-12 readers — pitched to a student's exact reading/phonics level, built
from their interests, with level-appropriate comprehension questions and a teacher-only
note (what to pre-teach, what to fact-check).

It packages the ReadRise generation engine — the constitution, the constraint hierarchy,
the UFLI decoding scope, and the comprehension/teacher-note logic — so any Claude (the
Claude app, Claude for Teachers, Claude Code, an agent) can produce a ReadRise-quality
text conversationally, without the web app.

## Contents

```
readrise/
├── SKILL.md                                  # the engine + workflow (loads on trigger)
└── references/
    ├── constitution.md                       # hard rules + core values (read fully)
    ├── decoding-stages.md                     # UFLI L1–L128 scope per stage
    └── comprehension-and-teacher-note.md      # question frames + teacher-note spec
```

## Using it

Install it into your Claude, then just ask in plain language:

> "I need a text for a 7th grader reading around 2nd grade who loves marching band —
> main-idea questions, and he won't read anything about violence."

The skill handles the reading level, keeps the subject specific and culturally alive,
writes decodable-at-level comprehension questions, and appends a teacher-only note.

## The companion web app

For a full teacher workflow — the guided/describe builders, wide-reading **class sets**,
**batch roster generation** (a tailored text per student), print packets, and reader
controls — use the hosted app at **readrise-pi.vercel.app**. The skill is the
conversational, in-Claude entry point; the app is the full toolbench.

## Audience

Built for **US K-12 teachers**. An international variant (CEFR levels instead of UFLI,
academic-vocabulary-first for English learners) is a planned later fork.
