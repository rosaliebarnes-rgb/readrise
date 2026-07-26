/* Batch roster: turn each pseudonymous student row into a One-Student GenConfig
   and run the batch through a bounded concurrency pool. Reuses the existing
   /api/generate engine — no new model path. */

import { ccssLabel } from "./domain";
import type { GenConfig, RosterConfig, RosterStudent } from "./types";

export function rosterGoal(cfg: RosterConfig): string {
  return cfg.goalMode === "standard" ? ccssLabel(cfg.ccss) : (cfg.skillChips || []).join(", ");
}

/* One student row + the shared batch settings -> a full GenConfig. Text +
   comprehension only (that's what the roster is for); no name/age/IEP/phonics. */
export function buildRosterGenConfig(student: RosterStudent, cfg: RosterConfig): GenConfig {
  const topic = cfg.topic.trim();
  return {
    profile: {
      name: student.id.trim(), // pseudonym only
      age: "",
      culture: student.culture.trim(),
      interests: student.interests.trim(),
      stage: "",
      comprehension: student.level.trim(),
      phonicsOn: false,
      phonicsLevel: "",
    },
    readingTarget: cfg.target,
    mode: cfg.mode,
    genre: "",
    length: cfg.length,
    goal: rosterGoal(cfg),
    requestedWords: "",
    notes: topic
      ? `BATCH TOPIC — every text in this class batch is about the same subject: "${topic}". Write THIS student's text on that subject, at their reading level, and where it fits naturally connect it to their interests. Stay specific and true.`
      : "",
    twrParts: [],
    mathSkill: "",
    outputs: {
      text: true,
      wordGrid: false,
      wordCount: false,
      comprehension: true,
      inference: false,
      twr: false,
      wordProblems: false,
    },
  };
}

/* Map an async fn over items with a bounded concurrency pool, reporting progress
   as each settles. Keeps a 30-student batch from firing 30 model calls at once. */
export async function poolMap<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let done = 0;
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i], i) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
      done++;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}
