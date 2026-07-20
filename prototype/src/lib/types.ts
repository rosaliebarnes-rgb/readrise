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
}

export interface GenConfig {
  profile: StudentProfile;
  readingTarget: ReadingTarget;
  mode: string;
  genre: string;
  length: string; // LENGTHS id
  goal: string; // free-text learning goal (chips/IEP/CCSS fold into this for now)
  requestedWords: string; // teacher-requested words to work into the text
  outputs: Outputs;
}

export type Adjustment = "simpler" | "tighter" | null;

export interface ParsedSections {
  text: string;
  wordgrid: string;
  comprehension: string;
  inference: string;
  twr: string;
  teachernote: string;
}
