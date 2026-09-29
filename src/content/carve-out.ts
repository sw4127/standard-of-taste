/**
 * THE CARVE-OUT, AS ONE LIST (RT-Z10 a, reaffirmed by RT-6 a and BA-5).
 *
 * No surface asserts anything about trauma, abuse or mental health — the one
 * class where being wrong lands on a person rather than on a number. It holds
 * on every surface, the card and the reading included.
 *
 * ONE LIST, NOT TWO. The card's copy test and the site-wide D1 test each kept
 * their own pattern list, and they had drifted: the site's matched "grief" and
 * the card's only "your grief"; neither matched "therapy". On 2026-09-23 the
 * snack rendered "headphones are cheaper than therapy" — a model-written
 * sentence no guard could see and no pattern would have caught. Every check of
 * the carve-out now reads this file.
 *
 * WHAT IT CANNOT DO: judge a sentence that makes the claim in words not listed
 * here. A green run means none of THESE phrasings appears.
 */
import { CARVE_OUT_ZH_PATTERNS } from "./zh/guards";

const CARVE_OUT_EN: readonly RegExp[] = [
  /\b(?:trauma|traumatic|traumatis(?:ed|ing))\b/i,
  /\b(?:abuse|abused|abusive)\b/i,
  /\b(?:depress(?:ed|ion|ive)?|anxiety|anxious|ptsd|adhd|autis(?:m|tic)|neurodiverg(?:ent|ence))\b/i,
  /\bmental[- ]health\b/i,
  /\byour (?:childhood|loss)\b/i,
  /\bgrie(?:f|ving)\b/i,
  /\bunresolved\b/i,
  // Added 2026-09-23 (change list D3, BA-5): therapy and clinical terms.
  /\b(?:therapy|therapies|therapist|therapeutic|counsell?ing|counsell?or|psychiatr\w*|psychotherap\w*)\b/i,
  // Not "diagnosis": the site uses it of its own engineering ("not a diagnosis",
  // "the diagnosis: nothing is blocked"), measured 2026-09-23, and a pattern that
  // fires on refusals trains everyone to exempt it.
  /\b(?:clinical(?:ly)?|disorder|medicat(?:ed|ion)|self[- ]harm|suicid\w*)\b/i,
];

/*
 * ONE LIST IN TWO LANGUAGES (bilingual Part 2, 2026-09-29). A Chinese page that
 * slipped past the carve-out would be the same defect as the model text the
 * English list once could not see. The Chinese patterns live in `zh/guards.ts`,
 * the one file of Chinese patterns, and join this list, so every check that
 * reads the carve-out reads both.
 */
export const CARVE_OUT_PATTERNS: readonly RegExp[] = [...CARVE_OUT_EN, ...CARVE_OUT_ZH_PATTERNS];

/** Every pattern the text trips, as strings (empty when it is clean). */
export function carveOutBreaches(text: string): string[] {
  return CARVE_OUT_PATTERNS.filter((p) => p.test(text)).map((p) => String(p));
}

/** The same list as one expression, for scanners that test sentence by sentence. */
export const CARVE_OUT = new RegExp(CARVE_OUT_PATTERNS.map((p) => p.source).join("|"), "i");
