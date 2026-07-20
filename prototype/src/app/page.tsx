"use client";

import { useState } from "react";
import { LENGTHS, MODES, STAGES } from "@/lib/domain";
import { READER_DEFAULT, type ReaderSettings } from "@/lib/reader";
import type { GenConfig, ParsedSections } from "@/lib/types";
import PhonicsLadder from "@/components/PhonicsLadder";
import OutputPanel from "@/components/OutputPanel";

type Target = "Independent" | "Instructional";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-pine">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink placeholder:text-ink-soft/60 focus:border-pine";

type SupportKey = "wordGrid" | "wordCount";
const SUPPORT_TOGGLES: { key: SupportKey; label: string }[] = [
  { key: "wordGrid", label: "Word bank" },
  { key: "wordCount", label: "Word count by paragraph" },
];

type Activity = "comprehension" | "inference" | "twr" | "none";
const ACTIVITIES: { key: Activity; label: string }[] = [
  { key: "comprehension", label: "Comprehension questions" },
  { key: "inference", label: "Inference questions" },
  { key: "twr", label: "TWR writing activities" },
  { key: "none", label: "None — just the reading text" },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState<"one" | "set">("one");

  const [name, setName] = useState("Marisol");
  const [age, setAge] = useState("15");
  const [culture, setCulture] = useState("Mexican American — East L.A.");
  const [interests, setInterests] = useState("lowriders, working on cars");

  const [level, setLevel] = useState("");
  const [stage, setStage] = useState<string | null>("vce");
  const [target, setTarget] = useState<Target>("Independent");

  const [mode, setMode] = useState("Narrative nonfiction");
  const [genre, setGenre] = useState("");
  const [length, setLength] = useState("Short");
  const [goal, setGoal] = useState("");
  const [phonicsOn, setPhonicsOn] = useState(false);
  const [phonicsPattern, setPhonicsPattern] = useState("");

  const [supports, setSupports] = useState({ wordGrid: true, wordCount: false });
  const [activity, setActivity] = useState<Activity>("comprehension");
  const [requestedWords, setRequestedWords] = useState("");

  const [reader, setReader] = useState<ReaderSettings>(READER_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedSections | null>(null);

  const stageObj = STAGES.find((s) => s.id === stage) || null;
  const summaries: Record<number, string> = {
    1: `${name || "Unnamed"} · age ${age || "—"}`,
    2: `${stageObj ? stageObj.label : level || "level not set"} · ${target}`,
    3: `${mode} · ${length}`,
  };
  const subtitle = `${target}${stageObj ? ` · ${stageObj.label}` : level ? ` · ${level}` : ""}`;

  function buildConfig(): GenConfig {
    return {
      profile: {
        name,
        age,
        culture,
        interests,
        stage: stage || "",
        comprehension: level,
        phonicsOn,
        phonicsLevel: phonicsPattern,
      },
      readingTarget: target,
      mode,
      genre,
      length,
      goal,
      requestedWords,
      outputs: {
        text: true,
        wordGrid: supports.wordGrid,
        wordCount: supports.wordCount,
        comprehension: activity === "comprehension",
        inference: activity === "inference",
        twr: activity === "twr",
      },
    };
  }

  async function generate(adjustment: "simpler" | "tighter" | null = null) {
    setBusy(true);
    setError(null);
    if (!adjustment) setParsed(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config: buildConfig(), adjustment }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status}).`);
      setParsed(data.parsed as ParsedSections);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  const StepHead = ({ n, title }: { n: number; title: string }) => {
    const done = step > n;
    const active = step === n;
    return (
      <button type="button" onClick={() => setStep(n)} className="flex w-full items-center gap-3 py-3 text-left">
        <span
          className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-semibold ${
            active || done ? "bg-pine text-white" : "bg-hair text-ink-soft"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <span className="flex-1">
          <span className={`block font-display text-[15px] font-bold ${active ? "text-ink" : "text-ink-soft"}`}>
            {title}
          </span>
          {!active && <span className="block text-[12px] text-ink-soft">{summaries[n]}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b border-hair bg-panel md:sticky md:top-0 md:h-screen md:w-[400px] md:flex-none md:overflow-y-auto md:border-r md:border-b-0">
        <div className="px-6 pt-6 pb-24">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[24px] font-bold text-pine">ReadRise</h1>
            <span className="rounded-full border border-hair px-2 py-0.5 text-[10.5px] tracking-wide text-ink-soft uppercase">
              preview
            </span>
          </div>
          <p className="mt-1 mb-5 text-[12.5px] text-ink-soft">
            Culturally alive texts a reader can decode on their own.
          </p>

          <div className="mb-5 flex gap-1.5">
            {(["one", "set"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTab(m)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  tab === m
                    ? "border-pine bg-pine-soft text-pine"
                    : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                }`}
              >
                {m === "one" ? "One student" : "Class set"}
              </button>
            ))}
          </div>

          {tab === "set" ? (
            <div className="rounded-xl border border-dashed border-hair p-5 text-[13px] leading-relaxed text-ink-soft">
              The class-set builder lands in a later phase — one anchor topic, a vary axis, and a level spread with
              shared vocabulary held constant.
            </div>
          ) : (
            <div className="divide-y divide-hair">
              <section>
                <StepHead n={1} title="Who is this for" />
                {step === 1 && (
                  <div className="pb-5">
                    <div className="flex gap-3">
                      <div className="flex-[2]">
                        <Field label="Name or ID">
                          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                      </div>
                      <div className="flex-1">
                        <Field label="Age">
                          <input className={inputCls} value={age} onChange={(e) => setAge(e.target.value)} />
                        </Field>
                      </div>
                    </div>
                    <Field label="Cultural background" hint="Passed to the writer, never stored.">
                      <input className={inputCls} value={culture} onChange={(e) => setCulture(e.target.value)} />
                    </Field>
                    <Field label="Interests" hint="Two at most, and only when the connection is genuine.">
                      <input className={inputCls} value={interests} onChange={(e) => setInterests(e.target.value)} />
                    </Field>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-5 w-full rounded-lg bg-pine py-2.5 text-[14px] font-medium text-white hover:brightness-110"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </section>

              <section>
                <StepHead n={2} title="What they can read" />
                {step === 2 && (
                  <div className="pb-5">
                    <Field label="Reading level" hint="Lexile, grade equivalent, or WCPM — the measure you have.">
                      <input
                        className={inputCls}
                        placeholder="e.g. 420L, 2nd grade, 60 WCPM"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Decoding stage — optional, more precise"
                      hint="Highest stage taught. Everything at or below it is fair game; nothing above."
                    >
                      <PhonicsLadder value={stage} onChange={setStage} />
                    </Field>
                    <Field label="Reading target">
                      <div className="flex gap-1.5">
                        {(["Independent", "Instructional"] as const).map((t) => {
                          const enabled = t === "Instructional" || !!stage || !!level.trim();
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={!enabled}
                              onClick={() => setTarget(t)}
                              className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                                target === t
                                  ? "border-pine bg-pine text-white"
                                  : enabled
                                    ? "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                                    : "cursor-not-allowed border-hair bg-white text-ink-soft/40"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <p className="mt-2 text-[11.5px] leading-snug text-ink-soft">
                      {target === "Independent"
                        ? "90% decodable cold. Form may shift to verse to protect the level and the ideas."
                        : "Read with teacher support. Stretch words and longer sentences allowed."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="mt-5 w-full rounded-lg bg-pine py-2.5 text-[14px] font-medium text-white hover:brightness-110"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </section>

              <section>
                <StepHead n={3} title="What to make" />
                {step === 3 && (
                  <div className="pb-5">
                    <Field label="Mode">
                      <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value)}>
                        {MODES.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Genre — optional">
                      <input
                        className={inputCls}
                        placeholder="e.g. profile, memoir, how-it-works"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                      />
                    </Field>
                    <Field label="Length">
                      <div className="flex flex-wrap gap-1.5">
                        {LENGTHS.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setLength(l.id)}
                            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                              length === l.id
                                ? "border-pine bg-pine text-white"
                                : "border-hair bg-white text-ink-soft hover:bg-pine-soft/40"
                            }`}
                          >
                            {l.label} <span className="opacity-70">{l.words}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Learning goal — optional" hint="Shapes the comprehension questions.">
                      <input
                        className={inputCls}
                        placeholder="e.g. finding evidence, main idea, vocabulary in context"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </Field>
                    <label className="mt-4 flex items-center gap-2.5 text-[13.5px] text-ink">
                      <input
                        type="checkbox"
                        checked={phonicsOn}
                        onChange={(e) => setPhonicsOn(e.target.checked)}
                        className="h-4 w-4 accent-pine"
                      />
                      Practice a phonics pattern this week
                    </label>
                    {phonicsOn && (
                      <input
                        className={`${inputCls} mt-2`}
                        placeholder="Pattern to practice (e.g. VCe, suffixes)"
                        value={phonicsPattern}
                        onChange={(e) => setPhonicsPattern(e.target.value)}
                      />
                    )}
                    <Field
                      label="Words to include — optional"
                      hint="Decodable ones become practice words; off-level ones are routed to the teacher note to pre-teach."
                    >
                      <input
                        className={inputCls}
                        placeholder="comma-separated, e.g. pump, hop, chrome"
                        value={requestedWords}
                        onChange={(e) => setRequestedWords(e.target.value)}
                      />
                    </Field>

                    <Field label="Include">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                          <input type="checkbox" checked disabled className="h-4 w-4 accent-pine" />
                          Reading text <span className="text-[11px]">always</span>
                        </label>
                        {SUPPORT_TOGGLES.map((o) => (
                          <label key={o.key} className="flex items-center gap-2.5 text-[13.5px] text-ink">
                            <input
                              type="checkbox"
                              checked={supports[o.key]}
                              onChange={(e) => setSupports((prev) => ({ ...prev, [o.key]: e.target.checked }))}
                              className="h-4 w-4 accent-pine"
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </Field>

                    <Field
                      label="Student activity — pick one"
                      hint="One activity per text goes deeper than three shallow ones. Reuse the same text across days with a different activity each day."
                    >
                      <div className="space-y-1.5">
                        {ACTIVITIES.map((a) => (
                          <label key={a.key} className="flex items-center gap-2.5 text-[13.5px] text-ink">
                            <input
                              type="radio"
                              name="activity"
                              checked={activity === a.key}
                              onChange={() => setActivity(a.key)}
                              className="h-4 w-4 accent-pine"
                            />
                            {a.label}
                          </label>
                        ))}
                      </div>
                    </Field>
                    <button
                      type="button"
                      onClick={() => generate(null)}
                      disabled={busy}
                      className="mt-6 w-full rounded-lg bg-pine py-3 text-[15px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
                    >
                      {busy ? "Writing…" : "Generate text"}
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-ground">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
          {error && (
            <div className="mb-6 rounded-xl border border-coral-ink/30 bg-coral-bg px-4 py-3 text-[14px] text-coral-ink">
              {error}
            </div>
          )}
          {busy && !parsed ? (
            <div className="fade-in mt-24 text-center text-[15px] text-ink-soft">
              <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-hair border-t-pine" />
              Writing the text…
            </div>
          ) : parsed ? (
            <>
              {busy && <div className="mb-3 text-[13px] text-ink-soft">Updating…</div>}
              <OutputPanel
                parsed={parsed}
                subtitle={subtitle}
                reader={reader}
                onReaderChange={setReader}
                onAdjust={(a) => generate(a)}
                busy={busy}
                phonicsOn={phonicsOn}
              />
            </>
          ) : (
            !error && (
              <div className="mt-24 text-center">
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-ink-soft">
                  Set up the reader on the left, then generate a text. It writes a culturally specific,
                  decodable-cold passage with the scaffolds you choose.
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
