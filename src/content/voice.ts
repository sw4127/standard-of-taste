/**
 * Automated voice check (2026-08-08) — RETIRES the PM voice pass, the same way
 * `Layer A` retired the PM ear pass.
 *
 * WHY THIS EXISTS. `docs/voice-spec.md` gated the copy deck on a PM sign-off.
 * The PM raised the obvious problem: a gate only they can discharge, which they
 * do not know how to perform, is not a quality gate — it is permanent debt. The
 * artifact pivot already made exactly this argument about the ear pass (§1), and
 * the argument does not stop being true because the subject is prose.
 *
 * WHAT MADE IT AUTOMATABLE. The voice spec was written well: it states three
 * LITMUS TESTS and a BANNED-MOVES list rather than an aesthetic. Those are
 * decidable. This module implements them.
 *
 * WHAT THIS CANNOT DO, stated plainly (N3). It cannot tell you a line is DULL.
 * It catches the failures the spec names — motive attribution, person-verdicts,
 * beige chrome in a verdict, unmeasured claims, percentile language — because
 * those have surface forms. "On-voice but flat" has no surface form, and no
 * amount of regex will find it. What this buys is that the deck can never ship
 * with a NAMED violation in it, which is what the PM sign-off was actually for.
 * A line that is merely mediocre still gets through, and that is the honest
 * limit of the trade.
 */

/** How hard a surface is allowed to push (voice-spec line 3). */
export type VoiceIntensity = "full" | "pointed" | "calm";

export interface VoiceString {
  /** Where it appears — used in the violation message. */
  surface: string;
  text: string;
  intensity: VoiceIntensity;
}

export interface VoiceViolation {
  surface: string;
  rule: string;
  detail: string;
  text: string;
}

/**
 * BANNED MOVE — motive attribution. Fails the spec's debrief-proof test: the
 * examiner cannot claim to know WHY someone rated as they did, because motive
 * is not among the things the instrument measures.
 */
const MOTIVE_PATTERNS: [RegExp, string][] = [
  [/\bout of spite\b/i, "spite"],
  [/\bto look (smart|clever|cool|interesting)\b/i, "impression management"],
  [/\bbecause you (wanted|hoped|tried)\b/i, "imputed intent"],
  [/\byou were trying to\b/i, "imputed intent"],
  [/\bpretend(ing)? to\b/i, "imputed pretence"],
];

/**
 * BANNED MOVE — person-verdicts. Fails ratings-not-you: the barb must land on a
 * measured datum, never on identity or worth.
 */
const PERSON_VERDICT_PATTERNS: [RegExp, string][] = [
  [/\byou(?:'re| are) (?:a |an |just |simply |basically )*(?:basic|shallow|pretentious|clueless|tasteless|a snob|a fraud|an? amateur)\b/i, "identity verdict"],
  [/\byou have no (?:taste|ear|clue)\b/i, "identity verdict"],
  [/\byour taste is (?:bad|worse|terrible|poor)\b/i, "taste-as-worth"],
];

/**
 * BANNED MOVE — neutral chrome where a verdict belongs. "The examiner is never
 * beige." Only applies to full/pointed surfaces; onboarding is meant to be calm.
 */
const BEIGE_PATTERNS: [RegExp, string][] = [
  [/\byour results are ready\b/i, "beige verdict"],
  [/\bthank you for (?:participating|completing)\b/i, "beige verdict"],
  [/\bsubmission (?:received|complete)\b/i, "beige verdict"],
  [/\bclick here\b/i, "beige chrome"],
];

/**
 * N3 — no fabricated norms. There is no cohort, so any comparative-population
 * claim is a claim about people who do not exist.
 */
const NORM_PATTERNS: [RegExp, string][] = [
  [/\bpercentile\b/i, "percentile language"],
  [/\btop \d+\s*%/i, "population claim"],
  [/\bbetter than \d+\s*%/i, "population claim"],
  [/\b(?:most|average) (?:people|listeners|users) (?:score|get|hear)\b/i, "implied norm"],
  [/\babove average\b/i, "implied norm"],
];

/**
 * Instrument-specific: the delicacy trials measure MAGNITUDE, never audibility,
 * and accuracy must be anchored against chance. A line promising that a
 * degradation is hearable claims something no measurement here establishes.
 */
const UNMEASURED_CLAIM_PATTERNS: [RegExp, string][] = [
  [/\banyone can hear\b/i, "audibility claim"],
  [/\bclearly audible\b/i, "audibility claim"],
  [/\bobviously (?:worse|damaged|broken)\b/i, "audibility claim"],
  [/\bproves? (?:you|your) (?:ears?|taste)\b/i, "overclaim"],
];

/**
 * DENYING A NORM IS NOT CLAIMING ONE (E6/S15).
 *
 * `promisesPayment` in voice.test.ts already documents this exact defect one
 * rule over: "a blunt substring match cannot tell 'no paid tier' from 'join the
 * paid tier'". The norm rule had the same hole and it bit immediately — the
 * card badge "no percentile — cohort n = 0" was flagged as percentile language,
 * for containing the word it exists to deny.
 *
 * That is worse than an annoyance. N3 requires us to SAY there is no cohort,
 * and a gate that forbids the word makes the honest sentence unwritable, which
 * pushes it into ungated JSX — which is precisely where the delicacy card's
 * "a coin flip calls 3" survived for months.
 *
 * The stripping is deliberately narrow: an explicit negation immediately
 * attached to the claim. "no percentile", "percentiles arrive when the cohort
 * does" — the two shapes this product actually writes. Anything further from
 * the word still trips, so "top 10%, no really" is still caught.
 */
function stripNormDenials(text: string): string {
  // NO \b IN THESE PATTERNS, deliberately. Two attempts to generate this
  // function wrote a literal 0x08 BACKSPACE where the word boundary belonged,
  // because Python reads \b as backspace and every tool that renders the file
  // shows it as nothing. Word boundaries are not needed here — the words are
  // long and distinctive — so the escape that keeps going wrong is simply not
  // used. See src/content/bias/claims.test.ts for the same fix.
  return text
    .replace(/no\s+percentiles?/gi, "")
    .replace(/not?\s+a\s+percentile/gi, "")
    .replace(/percentiles?\s+(?:arrive|come|exist|are)[^.]*/gi, "")
    /**
     * A QUESTION IS NOT A CLAIM (E9/S1). The reading-room FAQ asks "Is my
     * result a percentile?" and answers "Not yet." Both halves are the honest
     * position, and the answer's half was already stripped by the rule above —
     * only the heading tripped, for containing the word it exists to deny.
     *
     * This is the third instance of the defect the block above describes, so
     * the shape is deliberately the narrowest that covers it: the exact phrase
     * "a percentile" ending in a question mark. It does NOT strip every
     * interrogative mention — "you're top 10 percentile?" still trips, which
     * is the rhetorical form an actual population claim would take.
     */
    .replace(/(^|\s)a percentile\?/gi, "$1");
}

const RULES: [string, [RegExp, string][], (s: VoiceString) => boolean][] = [
  ["motive-attribution", MOTIVE_PATTERNS, () => true],
  ["person-verdict", PERSON_VERDICT_PATTERNS, () => true],
  ["beige-chrome", BEIGE_PATTERNS, (s) => s.intensity !== "calm"],
  ["fabricated-norm", NORM_PATTERNS, () => true],
  ["unmeasured-claim", UNMEASURED_CLAIM_PATTERNS, () => true],
];

/**
 * LITMUS 2 — datum-anchored. A verdict-tier line has to cite what was measured.
 * Detected as a digit, a percent sign, a template placeholder, or one of the
 * quantity words the decks actually use. Deliberately generous: the aim is to
 * catch a verdict that cites NOTHING, not to police phrasing.
 */
const DATUM_HINT = /\d|%|\$\{|\bof\s+(?:six|ten|eighteen|\d+)\b|\bchance\b|\bcoin flip\b|\bratings?\b|\bmoved\b|\bpoints?\b/i;

export function checkVoice(strings: VoiceString[]): VoiceViolation[] {
  const out: VoiceViolation[] = [];
  for (const s of strings) {
    for (const [rule, patterns, applies] of RULES) {
      if (!applies(s)) continue;
      // The norm rule reads the text with explicit denials removed; every
      // other rule reads it whole. See `stripNormDenials`.
      const subject = rule === "fabricated-norm" ? stripNormDenials(s.text) : s.text;
      for (const [re, detail] of patterns) {
        if (re.test(subject)) out.push({ surface: s.surface, rule, detail, text: s.text });
      }
    }
    // Only the loudest tier must carry a datum; pointed surfaces often pair
    // with a number rendered beside them rather than inside them.
    if (s.intensity === "full" && !DATUM_HINT.test(s.text)) {
      out.push({
        surface: s.surface,
        rule: "datum-anchored",
        detail: "a full-intensity line that cites no measured quantity",
        text: s.text,
      });
    }
  }
  return out;
}

/** Formatted report — used by the test and by any future CLI. */
export function formatVoiceReport(violations: VoiceViolation[]): string {
  if (violations.length === 0) return "voice check: no violations";
  return violations
    .map((v) => `  ${v.rule.padEnd(18)} ${v.surface.padEnd(28)} ${v.detail}\n      "${v.text}"`)
    .join("\n");
}
