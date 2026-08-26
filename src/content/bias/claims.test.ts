import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { BIAS_CLIPS } from "./items";
import { MEASURED_TRIALS, PRACTICE_TRIALS } from "@/content/delicacy/items";
import { CONFIDENCE_PCT } from "@/engine/confidence";
import { STAIRCASE_CLIP_SECONDS } from "@/engine/staircase-manifest";
import { MIN_LISTEN_MS_PER_CLIP, REPLAY_FACTOR } from "@/engine/staircase-session";

/**
 * E6/S12 — EVERY HARDCODED CLAIM ABOUT THE PRESTIGE TEST, PINNED TO ITS SOURCE.
 *
 * WHY THIS EXISTS. The delicacy share card shipped for months telling everyone
 * "a coin flip calls 3" against a fifteen-trial pool. It was a literal in JSX,
 * hardcoded when the pool was six, and nothing caught it: not tsc, not the
 * suite, not the hazard gate — that gate reads the copy deck and a fragment in
 * a component is outside it. It survived because nobody reads a PNG.
 *
 * A sweep for the same species found the Prestige Test carrying the whole class
 * pre-staged. "ten clips" and "five minutes" are written out by hand in SEVEN
 * files, including the OG image and the JSON-LD an unfurl reads.
 *
 * THESE CLAIMS ARE ALL TRUE TODAY. The pool is ten clips and the session really
 * is 5.1 minutes, so this is prevention, not repair. What makes it urgent is
 * RT-103a: the PM has approved growing the scored pool toward fourteen, which
 * takes the session to 8.1 minutes and makes every sentence below false at
 * once. Without this test, that change ships green and the site starts lying in
 * seven places, three of which are images or metadata nobody looks at.
 *
 * The delicacy flow already learned this and computes its own duration
 * (`SESSION_MINUTES`, after it once claimed "~4 minutes" against an 18-trial
 * pool). Bias never did. Until every claim is computed, this test is what
 * stands between the pool growing and the copy lying.
 */

/** A newline, as a constant: this file was broken twice by generating it. */
const NL = String.fromCharCode(10);

/** The same minutes model the Gym and E6/S6 use — imported, never retyped. */
function prestigeMinutes(nItems: number): number {
  return (nItems * 2 * (MIN_LISTEN_MS_PER_CLIP / 1000) * REPLAY_FACTOR) / 60;
}

const NUMBER_WORDS: Record<number, string> = {
  2: "two",
  10: "ten",
  14: "fourteen",
  16: "sixteen",
  5: "five",
  8: "eight",
};

/**
 * E7/S1 — THE SWEEP HAD A HOLE, AND IT WAS SHAPED LIKE THE BUG IT HUNTS.
 *
 * The list above used to be built from `git ls-files "src/app/**` + `/*.tsx"`.
 * In a git pathspec `**` is not the recursive wildcard it is in a shell: the
 * pattern needs a LITERAL `/` after it, so `src/app/<star><star>/<star>.tsx`
 * matches `src/app/bias/page.tsx` and does NOT match `src/app/page.tsx`. Every
 * top-level file under `src/app` and `src/content` was invisible.
 *
 * Fifteen files. Three of them state the pool size by hand, and they are the
 * three this file's own docblock names as the reason it exists:
 *
 *   src/app/page.tsx            the homepage       "Ten clips" · "~5 min · 10 clips"
 *   src/app/opengraph-image.tsx the default OG PNG "Ten clips" · "Free · five minutes"
 *   src/content/learn.ts        the FAQPage JSON-LD "the same ten clips" · "eight
 *                                                    with artist names" · "Three
 *                                                    of the eight labels"
 *
 * Every one was TRUE, so nothing failed and the hole stayed shut. RT-103a is
 * what would have opened it: grow the pool, fix the seven files the test names,
 * ship green, and the homepage, the share unfurl and the structured data Google
 * reads all keep saying ten. That is the "coin flip calls 3" defect, reproduced
 * by the guard written to prevent it.
 *
 * The fix takes no pathspec glob at all — directories in, extensions filtered
 * in JS — and `the sweep reaches every file a user's eyes reach` below pins it.
 */
const SWEPT_DIRS = ["src/app", "src/content", "src/components"] as const;

/**
 * NOT src/engine, src/analytics or src/lib. Those are where the quantities are
 * DEFINED — `CONFIDENCE_PCT = 95`, `MIN_LISTEN_MS_PER_CLIP`, and the doc
 * comments that explain them. A guard that flags a constant's own definition
 * for disagreeing with itself is a guard somebody switches off at 2am, which
 * is the same reasoning that keeps `/vs`'s "~30 seconds" out of the clip-length
 * check below. The rule is: swept iff a user can read it.
 */
const EXTRA_SWEPT_FILES = [
  "docs/launch-post-kit.md",
  // E7/S25: ANALYTICS.md sat outside every automatic check. A stale number was
  // found in it once — by accident, while reading for something else, not by any
  // guard. It is the document an analyst consults to interpret the data, so a
  // wrong count there is worse than a wrong count on a page: the page is
  // obviously marketing, and this is supposed to be the reference.
  "docs/ANALYTICS.md",
] as const;

/** The file list, exported in spirit so the meta-test can check it. */
function sweptFiles(): string[] {
  // E6/S14 (RT-115a b): the sweep reaches the copy decks and the launch kit as
  // well as the app. The kit is the sharpest of the three — it is copy that
  // goes to real channels, it had never been gated at all, and it was claiming
  // "6 minutes" against a 5.1-minute session while the site said ~5. A wrong
  // number there reaches people who never visit the site to be corrected by it.
  const tracked = execSync(`git ls-files ${SWEPT_DIRS.map((d) => `"${d}"`).join(" ")}`, { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !/\.test\.tsx?$/.test(f));
  return [...tracked, ...EXTRA_SWEPT_FILES].sort();
}

/** Every tracked source file, read once. */
function userFacingSources(): { file: string; text: string }[] {
  return sweptFiles().map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

/**
 * E7/S1 — WHICH INSTRUMENT IS THIS SENTENCE ABOUT?
 *
 * The duration check used to answer that from the FILENAME: judge a `~N min`
 * if the path matched `bias|prestige|opengraph|page.tsx`, unless it matched
 * `delicacy|threshold`. That worked only while every file described one
 * instrument. The moment the sweep reached `src/app/page.tsx` — the homepage,
 * which lists all three machines side by side — it read the Delicacy Trials'
 * "~10 min · 3 practice + 15 scored" and reported the Prestige Test as wrong
 * by five minutes. The homepage was right: `SESSION_MINUTES` is
 * `ceil(18 · 2 · 8s · 1.9 / 60) = ceil(9.12) = 10`.
 *
 * A guard whose first live run accuses a correct sentence is a guard somebody
 * disables. So attribution is now positional, not per-file: a duration belongs
 * to the instrument most recently NAMED above it. On the homepage that is
 * `id: "bias"` / "The Prestige Test" for one card and "The Delicacy Trials"
 * for the next, which is also how a human reads the page.
 *
 * Falls back to the filename only when nothing is named above the match at
 * all — the case `src/app/bias/BiasFlow.tsx` used to rely on.
 */
/**
 * The lookarounds are lowercase-only ON PURPOSE, and they are not `\b`.
 *
 * `\b` would reject `BiasFlow` and `delicacyItems` — camelCase identifiers are
 * the strongest attribution signal in a .tsx file, and losing them would send
 * matches to the filename fallback. Lowercase-only boundaries keep those
 * (`bias` followed by `F` is fine) while rejecting the English inflections that
 * genuinely mislead: `biased`, `unbiased`, `thresholds` in a sentence about
 * something else.
 *
 * Measured before changing it: across 113 swept files and 7 duration claims,
 * strict boundaries change ZERO attributions today. This is a latent hole being
 * shut, not a live bug — the day someone writes "an unbiased listener" above a
 * duration on the delicacy page, it becomes live and silent.
 *
 * (Not `\b` also because a `\b` typed into this repo by a generator becomes a
 * literal 0x08 that renders as nothing. This file has been broken that way.)
 */
const INSTRUMENT_NAMED = /(?<![a-z])(?:prestige|bias|delicacy|threshold|staircase)(?![a-z])/gi;
const IS_PRESTIGE = /prestige|bias/i;

function isAboutPrestige(text: string, index: number, file: string): boolean {
  let nearest: string | null = null;
  for (const m of text.slice(0, index).matchAll(INSTRUMENT_NAMED)) nearest = m[0];
  if (nearest !== null) return IS_PRESTIGE.test(nearest);
  return /bias|prestige|opengraph/.test(file);
}

/**
 * Extracted so it can be proven in BOTH directions on synthetic text — the
 * lesson of E6/S26, where the delicacy card's width guard could not have caught
 * the bug it was written for and nobody noticed, because a guard that never
 * fails and a guard that works look identical from the outside.
 */
function wrongMinuteClaims(sources: { file: string; text: string }[], minutes: number): string[] {
  const word = NUMBER_WORDS[minutes];
  const wrong: string[] = [];
  for (const { file, text } of sources) {
    // "~5 min", "~5 minutes", "five minutes", "five-minute". The delicacy and
    // threshold flows interpolate their own durations, so only literal numbers
    // are judged here.
    for (const m of text.matchAll(/~\s*(\d+)\s*min|\b(five|ten|fifteen|twenty)[-\s]minutes?\b/gi)) {
      if (!isAboutPrestige(text, m.index, file)) continue;
      const digits = m[1];
      const spelled = m[2]?.toLowerCase();
      if (digits && Number(digits) !== minutes) {
        wrong.push(`${file}: "${m[0]}" but the session is ${minutes} min`);
      }
      if (spelled && spelled !== word) {
        wrong.push(`${file}: "${m[0]}" but the session is ${minutes} min (${word})`);
      }
    }
  }
  return wrong;
}

function filesContaining(pattern: RegExp): string[] {
  return userFacingSources()
    .filter((s) => pattern.test(s.text))
    .map((s) => s.file);
}

describe("E6/S12 — hardcoded Prestige Test claims still match the pool", () => {
  const nClips = BIAS_CLIPS.length;
  const nControls = BIAS_CLIPS.filter((c) => c.isControl).length;
  const minutes = Math.round(prestigeMinutes(nClips));

  it("the pool is still the size every surface says it is", () => {
    const word = NUMBER_WORDS[nClips];
    const claiming = filesContaining(/\b(ten|\d+) clips\b/i);
    expect(claiming.length, "no surface states the clip count at all").toBeGreaterThan(0);

    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(ten|eleven|twelve|thirteen|fourteen|fifteen|\d+) clips\b/gi)) {
        const said = m[1].toLowerCase();
        const ok = said === word || said === String(nClips);
        if (!ok) wrong.push(`${file}: "${m[0]}" but the pool is ${nClips}`);
      }
    }
    expect(
      wrong,
      `The clip pool is ${nClips} (${word}) and these surfaces disagree. This is the ` +
        `"a coin flip calls 3" defect: a literal that was true when it was written.\n` +
        wrong.join("\n"),
    ).toEqual([]);
  });

  it("the stated duration still matches the pool and the listen gate", () => {
    const wrong = wrongMinuteClaims(userFacingSources(), minutes);
    expect(
      wrong,
      `The Prestige session is ${prestigeMinutes(nClips).toFixed(1)} min at ${nClips} clips.\n` +
        wrong.join("\n"),
    ).toEqual([]);
  });

  /**
   * E7/S8 — THE SWAP COUNT, which this file did not cover and should have.
   *
   * RT-139(a) recast the deception off pb1 and pb6, taking the swaps from three
   * to two. Two surfaces stated "three of the fourteen labels": the learn page
   * and the FAQPage JSON-LD. Nothing would have caught them — `bias.test.ts`
   * checks the pool has 2-3 swaps, never that the copy agrees with the pool.
   *
   * It is the same species as everything else here, and it is arguably the
   * worst one to get wrong: the swap count is the size of the deception we
   * disclose, so a stale number there is a false statement about how much we
   * misled someone.
   */
  it("the stated number of false labels matches the pool", () => {
    const nSwaps = BIAS_CLIPS.filter((c) => !c.isControl && !c.labelIsTrue).length;
    const nScored = BIAS_CLIPS.filter((c) => !c.isControl).length;
    const word = NUMBER_WORDS[nSwaps];
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(
        /\b(one|two|three|four|five|\d+)\s+of\s+the\s+(\w+)\s+labels?\b[^.\n]*/gi,
      )) {
        const said = m[1].toLowerCase();
        if (said !== word && said !== String(nSwaps)) {
          wrong.push(`${file}: "${m[0].slice(0, 70)}" but ${nSwaps} labels are false`);
        }
        const denom = m[2].toLowerCase();
        if (denom !== NUMBER_WORDS[nScored] && denom !== String(nScored)) {
          wrong.push(`${file}: "${m[0].slice(0, 70)}" but there are ${nScored} labelled clips`);
        }
      }
    }
    expect(
      wrong,
      `${nSwaps} of ${nScored} labels are deliberately false. A stale number here is a false ` +
        `statement about how far we misled someone.${NL}${wrong.join(NL)}`,
    ).toEqual([]);
  });

  it("the control count is still what the debrief and the learn page promise", () => {
    const word = NUMBER_WORDS[nControls];
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(two|three|\d+)\s+(?:of the \w+ )?clips? (?:are|never)\b[^.\n]*/gi)) {
        const said = m[1].toLowerCase();
        if (!/control|label/i.test(m[0])) continue;
        if (said !== word && said !== String(nControls)) {
          wrong.push(`${file}: "${m[0].slice(0, 70)}" but there are ${nControls} controls`);
        }
      }
    }
    expect(wrong, `There are ${nControls} control clips.\n` + wrong.join("\n")).toEqual([]);
  });

  /**
   * The list of files carrying a hand-written claim, asserted so that ADDING a
   * new one is a deliberate act. A surface that starts stating the pool size
   * without anyone noticing is how the next "calls 3" gets written.
   */
  it("no NEW surface has started hand-writing the pool size", () => {
    // Widened in E6/S14 with the sweep itself (RT-115a b). The launch kit is
    // on the list deliberately: it states the count on purpose, for channels,
    // and the point of the list is that a NEW surface joining is a decision
    // somebody made rather than a thing that happened.
    const known = [
      "src/app/bias/BiasFlow.tsx",
      "src/app/bias/page.tsx",
      "src/app/bias/result/page.tsx",
      "src/app/learn/prestige-bias-test/page.tsx",
      "src/app/page.tsx",
      "docs/launch-post-kit.md",
      // E7/S1: these two were ALWAYS hand-writing the count. They are new to
      // the list, not new to the sin — the sweep simply could not see them
      // (see the pathspec note above). They are the two surfaces this file's
      // docblock names as its reason for existing, which is the whole point.
      "src/app/opengraph-image.tsx", // the default share PNG — nobody reads a PNG
      "src/content/learn.ts", // the FAQPage JSON-LD — nobody reads structured data either
      // E7/S25: the event dictionary. It states the pool size while explaining
      // why a number there goes stale — which is exactly the sentence that
      // should be checked rather than trusted.
      "docs/ANALYTICS.md",
    ];
    const found = filesContaining(/\b(ten|\d+) clips\b/i).sort();
    const unexpected = found.filter((f) => !known.includes(f));
    expect(
      unexpected,
      `New surfaces are hand-writing the clip count. Either compute it, or add ` +
        `the file here deliberately:\n` + unexpected.join("\n"),
    ).toEqual([]);
  });
});

/**
 * E6/S14 — the other instruments' claims, and the shared constants behind them.
 *
 * The bias sweep above found the class; this is the rest of the surface area
 * the PM asked for (RT-115a b): the copy decks and the launch kit, which had
 * never been gated at all.
 */
describe("E6/S14 — every other stated quantity still matches its source", () => {
  it("the delicacy session length is stated as the pool actually is", () => {
    const scored = MEASURED_TRIALS.length;
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(\d+)\s+(?:scored\s+)?(?:pairs|trials)\b/gi)) {
        const said = Number(m[1]);
        // Only judge claims about the SCORED set; practice counts and ladder
        // rungs are different quantities that happen to share the noun.
        if (!/scored|pairs/i.test(m[0])) continue;
        if (said !== scored && said !== scored + PRACTICE_TRIALS.length && said !== PRACTICE_TRIALS.length) {
          wrong.push(`${file}: "${m[0]}" but the scored set is ${scored}`);
        }
      }
    }
    expect(wrong, wrong.join(NL)).toEqual([]);
  });

  it("no surface types a confidence level the engine does not use", () => {
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/(\d{2})%\s+(?:confidence|interval)/gi)) {
        if (Number(m[1]) !== CONFIDENCE_PCT) {
          wrong.push(`${file}: "${m[0]}" but CONFIDENCE_PCT is ${CONFIDENCE_PCT}`);
        }
      }
    }
    expect(
      wrong,
      `The level lives in src/engine/confidence.ts and the multiplier is derived ` +
        `from it. A deck that types the percentage itself can drift.` + NL + wrong.join(NL),
    ).toEqual([]);
  });

  it("the stated clip length matches what was rendered", () => {
    const words: Record<number, string> = { 10: "ten", 15: "fifteen", 20: "twenty", 30: "thirty" };
    const word = words[STAIRCASE_CLIP_SECONDS];
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(ten|fifteen|twenty|thirty|\d+)[- ]seconds?\b/gi)) {
        const said = m[1].toLowerCase();
        // ONLY FILES THAT ARE TALKING ABOUT THE STAIRCASE. The first version of
        // this check flagged `/vs`'s "~30 seconds", which is how long that page
        // takes, not how long a clip is — a guard that cannot tell a duration
        // from a length will be switched off by whoever it wakes at 2am. The
        // music and world-cup spines are legacy figurative prose for the same
        // reason ("three seconds before it turns").
        if (!/staircase|threshold/i.test(file)) continue;
        if (said !== word && said !== String(STAIRCASE_CLIP_SECONDS)) {
          wrong.push(`${file}: "${m[0]}" but clips are ${STAIRCASE_CLIP_SECONDS}s`);
        }
      }
    }
    expect(wrong, wrong.join(NL)).toEqual([]);
  });

  /**
   * The launch kit is copy that leaves the site. It is asserted separately so a
   * failure names it explicitly rather than hiding in a list of app files.
   */
  it("the launch kit agrees with the app about the Prestige session", () => {
    const kit = userFacingSources().find((s) => s.file.endsWith("launch-post-kit.md"));
    expect(kit, "launch-post-kit.md is no longer being swept").toBeTruthy();
    const minutes = Math.round(prestigeMinutes(BIAS_CLIPS.length));
    const stated = [...kit!.text.matchAll(/~?\s*(\d+)\s*min(?:utes)?\b/gi)].map((m) => Number(m[1]));
    expect(stated.length, "the kit no longer states a duration at all").toBeGreaterThan(0);
    for (const v of stated) {
      expect(v, `the kit says ${v} min; the session is ${minutes}`).toBe(minutes);
    }
  });
});

/**
 * E7/S1 — THE SWEEP IS NOW AUDITED BY SOMETHING THAT IS NOT THE SWEEP.
 *
 * Everything above trusts one list of files. That list was wrong for as long as
 * it existed and no test noticed, because every test that uses it also inherits
 * its blind spot: a file nobody reads cannot fail a check nobody runs on it.
 *
 * These two tests are the audit. The first enumerates the same files by a
 * mechanism with no pathspec glob in it at all — `git ls-files` with no
 * arguments, filtered by string prefix in JS — so it cannot share the bug it
 * is checking for. The second pins the bug itself, in the form of the fact
 * that caused it, so that a future "tidy-up" back to a `<star><star>/` pattern
 * fails immediately and reads its own explanation.
 */
describe("E7/S1 — the sweep reaches every file a user's eyes reach", () => {
  it("covers every non-test .ts/.tsx under the swept directories", () => {
    const everything = execSync("git ls-files", { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean)
      .filter((f) => SWEPT_DIRS.some((d) => f.startsWith(`${d}/`)))
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => !/\.test\.tsx?$/.test(f))
      .sort();

    const swept = sweptFiles().filter((f) => !f.endsWith(".md"));
    const missed = everything.filter((f) => !swept.includes(f));
    expect(
      missed,
      `These files are user-facing and unswept. A claim can rot in any of them ` +
        `without a single test going red:${NL}${missed.join(NL)}`,
    ).toEqual([]);

    // THE CHECK ABOVE PASSES VACUOUSLY IF `SWEPT_DIRS` IS EMPTIED: `everything`
    // is derived from the same list, so nothing swept means nothing missed
    // means green. That is the same shape as the bug this whole slice is about
    // — a guard that reports success because it looked nowhere. These three
    // lines are what make it non-vacuous, and they are floors, not targets:
    // lowering one is allowed, doing it silently is not.
    expect(SWEPT_DIRS, "the app is no longer swept").toContain("src/app");
    expect(SWEPT_DIRS, "the copy decks are no longer swept").toContain("src/content");
    expect(swept.length, "the sweep has stopped finding files").toBeGreaterThan(100);
  });

  it("the pathspec that hid the homepage for months would still hide it", () => {
    // The fact, not the symptom: in a git pathspec `**` is not the shell's
    // recursive wildcard — it needs a literal `/` after it, so the pattern
    // requires at least one directory below src/app and top-level files never
    // matched. Anyone who "simplifies" sweptFiles() back to a glob trips this.
    const globbed = execSync('git ls-files "src/app/**/*.tsx"', { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    expect(globbed.length, "sanity: the old pathspec matched nested files fine").toBeGreaterThan(40);
    expect(
      globbed.filter((f) => /^src\/app\/[^/]+\.tsx$/.test(f)),
      "if this is non-empty, git changed its pathspec semantics and the note above is stale",
    ).toEqual([]);
    // ...and the current list does not have that hole.
    expect(sweptFiles()).toContain("src/app/page.tsx");
    expect(sweptFiles()).toContain("src/app/opengraph-image.tsx");
  });
});

/**
 * E7/S1 — and the duration check itself, proven in both directions on text it
 * cannot have been tuned against.
 */
describe("E7/S1 — the duration check can tell the machines apart", () => {
  const homepageShaped = [
    {
      file: "src/app/page.tsx",
      text: [
        'id: "bias", title: "The Prestige Test",',
        'meta: "~5 min · 10 clips",',
        'id: "delicacy", title: "The Delicacy Trials",',
        'meta: "~10 min · 3 practice + 15 scored",',
      ].join(NL),
    },
  ];

  it("passes the real shape: a correct Prestige claim beside a longer Delicacy one", () => {
    expect(wrongMinuteClaims(homepageShaped, 5)).toEqual([]);
  });

  it("catches a wrong Prestige claim in that same shape", () => {
    // The RT-103a case: the pool grew, the session is 8 minutes, the card was
    // never updated — and the Delicacy line beside it must stay unaccused.
    const found = wrongMinuteClaims(homepageShaped, 8);
    expect(found.length, found.join(NL)).toBe(1);
    expect(found[0]).toContain('"~5 min"');
    expect(found.join(" "), "the Delicacy card was accused too").not.toContain("~10 min");
  });

  it("does not judge a duration under a heading that names another machine", () => {
    const staircase = [{ file: "src/app/page.tsx", text: `The Threshold Test${NL}~5 min` }];
    expect(wrongMinuteClaims(staircase, 8)).toEqual([]);
  });

  it("falls back to the filename when nothing names an instrument", () => {
    const bare = [{ file: "src/app/opengraph-image.tsx", text: "Free · five minutes · no sign-up" }];
    expect(wrongMinuteClaims(bare, 8).length).toBe(1);
    expect(wrongMinuteClaims([{ file: "src/app/legal/page.tsx", text: "five minutes" }], 8)).toEqual([]);
  });
});
