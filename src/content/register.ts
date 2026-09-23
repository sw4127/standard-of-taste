/**
 * THE OFFER REGISTER AND THE NO-COMPARISON RULE, AS PATTERNS (BA-3, RT-Z5, N3).
 *
 * BA-3: no surface may assert a feeling. A reading names a pattern and offers
 * what it might mean, because the same listening pattern can come from opposite
 * feelings (BP-ARG-S1). So:
 *
 * - A PATTERN sentence says what the plays show and contains no feeling word
 *   at all — it is the part a reader can check.
 * - An OFFER is a question. It may name a feeling, because a question hands the
 *   feeling to the reader to accept or refuse.
 * - Nothing anywhere says the reader IS or FEELS something, or that a pattern
 *   MEANS something about them.
 *
 * N3: no percentile, no "most listeners", no comparison with anyone. There is
 * no population behind these readings to compare with.
 *
 * The prompt card's copy test holds its comparison rule from here too, so the
 * two surfaces that speak to a reader keep one list.
 *
 * WHAT IT CANNOT DO: read meaning. A green run means none of THESE words or
 * shapes appears; a sentence that asserts a feeling in words not listed passes.
 */

/** Words that name a feeling or a state of mind. None may appear in a pattern sentence. */
export const FEELING_WORDS =
  /\b(sad|sadness|lonely|loneliness|alone|happy|happiness|angry|anger|stressed|stress|hurt|heartbr\w*|mourn\w*|afraid|fear\w*|joy\w*|longing|nostalgi\w*|melanchol\w*|feel\w*|mood\w*|emotion\w*|restless|numb|empty|hope\w*|hopeless\w*|calm\w*|comfort\w*|miss\w*|love\w*|lost)\b/i;

/** Shapes that assert something about the reader's inner life. None may appear anywhere. */
export const ASSERTIONS: readonly RegExp[] = [
  // \x27 is an apostrophe, escaped so `unrendered-slot.test.ts`'s scanner does not read it as a string.
  /\byou(?:\x27re| are| were| have been| seem| sound| must be)\s+(?:\w+\s+)?(?:sad|lonely|happy|angry|stressed|hurt|afraid|anxious|grieving|healing|nostalgic|restless|numb|empty|lost|in love|heartbroken|searching for)\b/i,
  /\byou (?:feel|felt|are feeling|have been feeling|need|needed|want|wanted|miss|missed)\b(?![^?]*\?)/i,
  /\b(?:this|that|it|which) (?:means|shows|proves|reveals|tells us|says) (?:that )?you\b/i,
  /\byou (?:clearly|obviously|definitely|certainly|must)\b/i,
  /\bdeep down\b/i,
];

/** Comparison with other people (N3). */
export const COMPARISON: readonly RegExp[] = [
  /\bpercentile\b/i,
  /\btop \d+%/i,
  /\b(?:most|many|few) (?:listeners|people|readers|users)\b/i,
  /\b(?:better|worse) than (?:average|most|others)\b/i,
  /\bcompared (?:to|with) (?:others|everyone|most)\b/i,
  /\bcohort\b/i,
  /\b(?:unusual|typical|normal|average) (?:listener|amount|for)\b/i,
];

export function matches(text: string, patterns: readonly RegExp[]): string[] {
  return patterns.filter((p) => p.test(text)).map((p) => String(p));
}

/** Why a pattern sentence breaks the register, or [] when it does not. */
export function patternBreaches(text: string): string[] {
  return [
    ...(FEELING_WORDS.test(text) ? [`names a feeling: ${FEELING_WORDS.exec(text)![0]}`] : []),
    ...matches(text, ASSERTIONS),
    ...matches(text, COMPARISON),
  ];
}

/** Why an offer breaks the register, or [] when it does not. An offer must be a question. */
export function offerBreaches(text: string): string[] {
  return [
    ...(text.trim().endsWith("?") ? [] : ["is not a question"]),
    ...matches(text, ASSERTIONS),
    ...matches(text, COMPARISON),
  ];
}
