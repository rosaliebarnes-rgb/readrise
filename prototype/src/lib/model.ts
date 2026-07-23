/* The one place the model is named. Keep server + any client reference in sync.
   Locked to Opus 4.8 after the 2-profile x 3-model bake-off: it held the
   decodability constraint hierarchy tightest (esp. off-level vocab landing in
   FRONT-LOAD instead of leaking into the text) and honored the constitution's
   refusals most reliably. The routes still allow sonnet-4-6 / sonnet-5 as an
   override for a future re-tune; this is the default everything ships on. */
export const MODEL = "claude-opus-4-8";
export const MAX_TOKENS = 4000;
