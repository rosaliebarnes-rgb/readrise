/* Shared, runtime-free types. Safe to import from client or server — importing
   this never pulls the constitution or the prompt engine into the browser bundle. */

export type ReadingTarget = "Independent" | "Instructional";

export interface StudentProfile {
  name: string;
  age: string;
  culture: string;
  interests: string;
  stage: string; // decoding-stage id, or ""
  comprehension: string; // reading level (Lexile / grade / WCPM), or ""
  phonicsOn: boolean;
  phonicsLevel: string; // pattern to practice, or ""
}

export interface Outputs {
  text: boolean; // always true
  wordGrid: boolean;
  wordCount: boolean;
  comprehension: boolean;
  inference: boolean;
  twr: boolean;
  wordProblems: boolean; // math word problems for the student to solve
}

export interface GenConfig {
  profile: StudentProfile;
  readingTarget: ReadingTarget;
  mode: string;
  genre: string;
  length: string; // LENGTHS id
  goal: string; // resolved learning goal (from skill chips / IEP text / standard)
  requestedWords: string; // teacher-requested words to work into the text
  notes: string; // free-text steering — subordinate to the constitution + level
  twrParts: string[]; // which TWR scaffolds to emit: subset of ["A","B","C","D"]
  mathSkill: string; // math skill/level for word problems (independent of reading level)
  outputs: Outputs;
}

export type Adjustment = "simpler" | "tighter" | null;

/* ---------------------------------------------------------------------------
   Wide-reading class sets. No student profile at all — zero privacy surface.
   One anchor + one vary-axis + a level spread, with a shared vocabulary spine
   held constant across every text (the repeated-encounter mechanism).
--------------------------------------------------------------------------- */
export interface SetConfig {
  anchor: string; // the anchor topic
  axis: string; // AXES id — what varies across the texts
  sharedVocab: string; // teacher-supplied words to hold constant (optional)
  levels: string[]; // one reading level per text, in order
  mode: string;
  length: string;
  /* Align to a goal — Skill or Standard only. No IEP goal on sets: a set serves a
     group, and keeping it out means the set tab collects nothing about a student. */
  goalMode: "skill" | "standard";
  skillChips: string[];
  ccss: string;
  /* Per-text options. The teacher composes the group work from these — the tool
     doesn't prescribe a group routine. */
  comprehension: boolean;
  summary: boolean; // a summary task on each text
  vocabDefs: boolean; // define the shared words as used in THIS text
  notes: string; // free-text / dictated steering for the whole set (subordinate)
}

export interface PlannedText {
  n: number;
  title: string;
  angle: string;
  level: string;
}

export interface SetPlan {
  vocab: string[]; // the shared vocabulary spine
  texts: PlannedText[];
}

export interface SetTextResult {
  n: number;
  title: string;
  level: string;
  parsed: ParsedSections;
}

export interface ParsedSections {
  text: string;
  wordgrid: string;
  comprehension: string;
  inference: string;
  twr: string;
  wordproblems: string;
  teachernote: string;
}
