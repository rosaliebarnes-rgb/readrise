/* Domain data ported straight from the live app — this is the part that
   carries over unchanged. The sample packet below is hardcoded for the
   prototype; the real generation API gets wired in during the full port. */

export interface Stage {
  id: string;
  label: string;
  ufli: string;
  decodable: string;
}

export const STAGES: Stage[] = [
  { id: "short", label: "Short vowels", ufli: "UFLI L1–L41", decodable: "cat, red, sit" },
  { id: "blends", label: "Blends & digraphs", ufli: "UFLI L42–L53", decodable: "stop, ship, chin" },
  { id: "vce", label: "Silent-e / VCe", ufli: "UFLI L54–L62", decodable: "make, ride, home" },
  { id: "teams", label: "Vowel teams", ufli: "UFLI L63–L78", decodable: "rain, boat, see" },
  { id: "rcontrol", label: "R-controlled vowels", ufli: "UFLI L79–L98", decodable: "car, bird, corn" },
  { id: "affixes", label: "Suffixes & prefixes", ufli: "UFLI L99–L118", decodable: "jumping, unlock" },
  { id: "roots", label: "Multisyllabic / roots", ufli: "UFLI L119–L128", decodable: "Greek & Latin roots" },
];

export const LENGTHS = [
  { id: "Short", label: "Short", words: "~150 words", target: 150 },
  { id: "Medium", label: "Medium", words: "~300 words", target: 300 },
  { id: "Long", label: "Long", words: "~500 words", target: 500 },
];

export const MODES = ["Nonfiction", "Narrative nonfiction", "Fiction", "Either"];

/* Skills chips — quick learning-goal alignment. */
export const SKILLS = [
  "Vocabulary in context",
  "Inference",
  "Main idea",
  "Finding evidence",
  "Author's craft",
  "Figurative language",
  "Text structure",
  "Fluency",
];

/* CCSS standards shown with a plain-language summary, never bare codes —
   teachers shouldn't have to decode "RI.2". Grade-agnostic anchor phrasing. */
export const CCSS: { code: string; summary: string }[] = [
  { code: "RI.1", summary: "Cite text evidence for what the text says and what it implies" },
  { code: "RI.2", summary: "Determine the central idea and summarize the key details" },
  { code: "RI.3", summary: "Analyze how people, events, and ideas connect and develop" },
  { code: "RI.4", summary: "Figure out what words and phrases mean in context" },
  { code: "RI.5", summary: "Analyze how the text is organized and how the parts fit" },
  { code: "RI.6", summary: "Determine the author's point of view or purpose" },
  { code: "RI.8", summary: "Trace the argument and judge whether the evidence holds up" },
  { code: "RL.1", summary: "Cite text evidence to support your analysis of the story" },
  { code: "RL.2", summary: "Determine the theme or central idea and summarize the story" },
  { code: "RL.3", summary: "Analyze how characters, setting, and plot develop and interact" },
  { code: "RL.4", summary: "Figure out word meanings, including figurative language" },
  { code: "RL.6", summary: "Analyze how point of view shapes the story" },
  { code: "L.4", summary: "Use context clues and word parts to unlock new words" },
  { code: "L.5", summary: "Interpret figurative language and shades of word meaning" },
  { code: "L.6", summary: "Learn and use academic and subject-area vocabulary" },
];

export function ccssLabel(code: string): string {
  const c = CCSS.find((x) => x.code === code);
  return c ? `${c.code} — ${c.summary}` : "";
}

export type Layer = "proper" | "academic";
export interface Seg {
  t: string;
  layer?: Layer;
  def?: string;
}
export type Para = Seg[];

export interface SamplePacket {
  title: string;
  stageLabel: string;
  decodability: number;
  paragraphs: Para[];
  wordBank: { word: string; def: string }[];
  questions: { n: number; text: string; bonus?: boolean }[];
  teacherNote: { label: string; body: string }[];
}

/* A real-feeling Independent-level text (VCe stage): insider voice, specific
   names/places/years (free — they carry culture), no manufactured conflict.
   proper-noun segments highlight sky; academic segments highlight coral and
   carry an inline definition (the seed of hover-to-define). */
export const SAMPLE: SamplePacket = {
  title: "The Car That Rosa Built",
  stageLabel: "Silent-e / VCe · UFLI L54–L62",
  decodability: 92,
  paragraphs: [
    [
      { t: "In " },
      { t: "East L.A.", layer: "proper" },
      { t: ", Rosa lifts the hood. The car is a " },
      { t: "1964 Chevy", layer: "proper" },
      { t: ". Her dad ran a shop on " },
      { t: "First Street", layer: "proper" },
      { t: ". He let her hold the tools when she was five." },
    ],
    [
      { t: "Now Rosa fixes the frame. She sets the ride low. A rod is a car, cut down and built up. She works slow. She gets it right." },
    ],
    [
      { t: "On Sundays the club rolls down " },
      { t: "Whittier Blvd", layer: "proper" },
      { t: ". This is her " },
      { t: "culture", layer: "academic", def: "the ways a group lives — its music, food, art, and craft" },
      { t: ". She did not learn it from a book. The whole " },
      { t: "community", layer: "academic", def: "a group of people in one place who share a way of life" },
      { t: " knows her name." },
    ],
  ],
  wordBank: [
    { word: "culture", def: "the ways a group lives — its music, food, art, and craft" },
    { word: "community", def: "a group of people in one place who share a way of life" },
  ],
  questions: [
    { n: 1, text: "Where does Rosa lift the hood?" },
    { n: 2, text: "What car does Rosa fix?" },
    { n: 3, text: "The text says a rod is a car. What is done to it?" },
    { n: 4, text: "Who let Rosa hold the tools first?" },
    { n: 5, text: "Why does the community know Rosa's name?", bonus: true },
  ],
  teacherNote: [
    { label: "Form", body: "Short informational verse lines (≤ 8 words) to protect the VCe level without thinning the subject." },
    { label: "Front-load", body: "Pre-teach aloud before reading: culture, community. Held out of the decodable text on purpose." },
    { label: "Watch", body: "VCe words: lifts, ride, five, slow, knows. Check she isn't guessing from the first letter." },
    { label: "Verify", body: "Confirm the year and places before printing: 1964 Chevy, East L.A., Whittier Blvd. Named place + specific year is the most error-prone pairing." },
    { label: "Precision", body: "A decoding stage was given, so decodability is exact, not estimated." },
  ],
};
