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
  { id: "Short", label: "Short", words: "~150 words" },
  { id: "Medium", label: "Medium", words: "~300 words" },
  { id: "Long", label: "Long", words: "~500 words" },
];

export const MODES = ["Nonfiction", "Narrative nonfiction", "Fiction", "Either"];

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
