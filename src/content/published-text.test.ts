import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "./bias/items";
import { DELICACY_LIVE, MEASURED_TRIALS, PRACTICE_TRIALS } from "./delicacy/items";
import { minToClearChance } from "./delicacy/copy";
import { STAIRCASE_FAMILIES } from "@/engine/staircase-manifest";
import { LEARN_PAGES } from "./learn";
import { flawFamilies } from "./flaw-families";

/**
 * THE PUBLISHED TEXT FILES MUST DESCRIBE THE PRODUCT THAT SHIPPED (E9/S1b).
 *
 * `public/llms.txt` and `public/llms-full.txt` are served at /llms.txt and
 * /llms-full.txt so AI readers can describe this product without guessing.
 * Measured on 2026-08-27, they described a product that had not existed since
 * June:
 *
 *   llms.txt       "rate eight music clips blind ... three labels are
 *                   deliberately swapped ... about five minutes"
 *   llms-full.txt  "rates ten short music clips blind ... eight with artist
 *                   names ... Three of the eight labels are deliberately false"
 *   llms-full.txt  "## Delicacy Trials (second instrument, visible but locked)
 *                   Planned design for Hume's 'delicacy' criterion..."
 *
 * The pool grew from 8 scored clips to 14 under RT-103a and the session from
 * ~5 to ~8 minutes under RT-136; the Delicacy Trials went live on 2026-08-08;
 * the Threshold Test appeared in neither file at all. Every one of those is a
 * false statement in a file the product publishes (N3), and the readers least
 * able to check it against the running product are exactly the ones it is
 * addressed to.
 *
 * WHY A TEST AND NOT JUST A REWRITE. The files were rewritten once already —
 * they were correct on the day they were written, and nothing connected them to
 * the pool they describe. A second rewrite with nothing holding it in place
 * buys one more correct day. Now the pool is the source: change the pool
 * without changing the sentence and this fails, naming both numbers.
 *
 * WHAT THIS DELIBERATELY DOES NOT GUARD, so nobody assumes it does:
 *
 *  - THE SESSION LENGTH IN MINUTES. "~8 min" is hand-typed in three separate
 *    places (`BiasFlow.tsx`, `page.tsx`, `opengraph-image.tsx`) and derived
 *    from nothing, so there is no source of truth for a test to compare
 *    against. Pinning it here would only assert that one hardcoded string
 *    equals another. It stays a known hole rather than a fake guard.
 *  - PROSE QUALITY, accuracy of the philosophy, or whether the description is
 *    any good. This checks quantities against the code, and nothing else.
 */

const FILES = ["public/llms.txt", "public/llms-full.txt"] as const;

/** The published files spell quantities; the code counts them. */
const WORD: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
  13: "thirteen",
  14: "fourteen",
  15: "fifteen",
  16: "sixteen",
  17: "seventeen",
  18: "eighteen",
};

function word(n: number): string {
  const w = WORD[n];
  if (!w) throw new Error(`published-text: no spelled form for ${n} — extend WORD`);
  return w;
}

const scored = BIAS_CLIPS.filter((c) => !c.isControl);
const controls = BIAS_CLIPS.filter((c) => c.isControl);
const swapped = scored.filter((c) => c.labelIsTrue === false);

/**
 * A QUANTITY, NOT ANY WORD (E9/S1b — the guard's own first failure).
 *
 * The patterns below first captured `(\w+)`, and llms.txt convicted itself on
 * the phrase "rate the same clips AGAIN with artist names" — a word in the
 * quantity slot that was never a quantity. Widening the pattern to skip
 * unrecognised words would have been the wrong repair: it would also skip a
 * claim reworded to have no number in it, and the presence check above would
 * then pass on a sentence that no longer states the fact.
 *
 * So the slot is a quantity or the pattern does not match at all. Digits are
 * accepted beside the spelled forms because the files may legitimately switch
 * style, and a guard that only reads English words would go blind the day one
 * of them says "14".
 */
const QUANTITY = `(?:\\d+|${Object.values(WORD).join("|")})`;

interface PublishedFact {
  /** Named in the failure, so the message says what is wrong, not just where. */
  what: string;
  /** Each capture group is a published quantity, in order. */
  pattern: RegExp;
  expected: string[];
}

/** Whitespace in these files wraps mid-sentence, so every gap is `\s+`. */
function fact(what: string, shape: string, expected: string[]): PublishedFact {
  return { what, pattern: new RegExp(shape.replace(/ /g, "\\s+"), "gi"), expected };
}

const N = QUANTITY;
const FACTS: PublishedFact[] = [
  fact("clips in the Prestige Test", `(${N}) short music clips`, [word(BIAS_CLIPS.length)]),
  fact("Prestige clips that carry a label", `(${N}) (?:with|carry) artist names`, [
    word(scored.length),
  ]),
  fact(
    "swapped labels, and the labelled count they are drawn from",
    `(${N}) of the (${N}) labels are deliberately false`,
    [word(swapped.length), word(scored.length)],
  ),
  fact("Prestige drift controls", `(${N}) clips carry no label in either pass`, [
    word(controls.length),
  ]),
  fact("scored Delicacy pairs", `(${N}) scored pairs`, [word(MEASURED_TRIALS.length)]),
  fact("Delicacy practice trials", `(${N}) practice trials`, [word(PRACTICE_TRIALS.length)]),
  fact(
    "the score that clears chance, and the session length it clears it at",
    `takes (${N}) of (${N}) to beat the coin`,
    [word(minToClearChance(MEASURED_TRIALS.length)!), word(MEASURED_TRIALS.length)],
  ),
];

const corpus = FILES.map((path) => ({ path, text: readFileSync(path, "utf8") }));

describe("the published text files describe the product that shipped", () => {
  it("reads a real corpus, not an empty one", () => {
    for (const { path, text } of corpus) {
      expect(text.length, `${path} is empty or missing`).toBeGreaterThan(500);
    }
  });

  /**
   * EVERY FACT MUST APPEAR SOMEWHERE. Without this, deleting the sentence is a
   * way to make the check pass — which is the failure mode of every guard that
   * only inspects what it happens to find.
   *
   * Required across the corpus rather than in each file: llms.txt is a summary
   * and llms-full.txt is the long form, and demanding both state everything
   * would force padding into the summary to satisfy a test.
   */
  it("states every fact it claims to guard", () => {
    const missing = FACTS.filter(
      (f) => !corpus.some(({ text }) => new RegExp(f.pattern.source, "i").test(text)),
    ).map((f) => f.what);
    expect(
      missing,
      "No published file states these any more. Either the sentence was reworded — in which " +
        "case update the pattern deliberately — or the claim was dropped and the guard went blind.",
    ).toEqual([]);
  });

  it("publishes no quantity that disagrees with the pool", () => {
    const wrong: string[] = [];
    for (const { path, text } of corpus) {
      for (const fact of FACTS) {
        for (const m of text.matchAll(fact.pattern)) {
          fact.expected.forEach((want, i) => {
            const got = m[i + 1];
            if (got.toLowerCase() !== want) {
              wrong.push(
                `${path}  ${fact.what}: published "${got}", the code ships "${want}"\n` +
                  `      in: "${m[0].replace(/\s+/g, " ")}"`,
              );
            }
          });
        }
      }
    }
    expect(wrong, "Published quantities that no longer match the code:\n" + wrong.join("\n")).toEqual(
      [],
    );
  });

  /**
   * A LIVE INSTRUMENT DESCRIBED AS PLANNED IS THE SAME CLASS OF DEFECT as a
   * retired gate described as outstanding (`retired-gates.test.ts`) — a false
   * statement that points a reader at a door in the wrong state. The Delicacy
   * Trials sat in these files as "visible but locked" for nineteen days after
   * they went live.
   */
  it("does not describe a live instrument as planned", () => {
    if (!DELICACY_LIVE) return;
    const stale = /(?:planned|locked|not (?:yet )?built)[^.\n]{0,60}delicacy|delicacy[^.\n]{0,60}(?:is planned|but locked|not yet)/gi;
    const offences = corpus.flatMap(({ path, text }) =>
      [...text.matchAll(stale)].map((m) => `${path}  "${m[0].trim()}"`),
    );
    expect(offences, "The Delicacy Trials are live. These say otherwise:").toEqual([]);
  });

  /**
   * The Threshold Test was live for eight days and appeared in neither file.
   * An instrument the product ships and its own description omits is not a
   * wording problem — a reader following these files cannot find a third of
   * the product.
   */
  it("names every live instrument, and each threshold family's unit", () => {
    const full = corpus.find((c) => c.path.endsWith("llms-full.txt"))!.text;
    /**
     * A SECTION, NOT A LINK. This check first asserted the name appeared
     * anywhere in the file, and when it was reverse-tested by deleting the
     * whole Threshold Test section it PASSED — satisfied by the URL in the
     * site-map list at the bottom. A line in a link list is not a description
     * of an instrument, so the long-form file must carry a heading for each.
     */
    const headings = [...full.matchAll(/^##+ (.+)$/gm)].map((m) => m[1]);
    for (const name of ["Prestige Test", "Delicacy Trials", "Threshold Test"]) {
      expect(
        headings.some((h) => h.includes(name)),
        `llms-full.txt has no section for the ${name}. Headings found:\n${headings.join("\n")}`,
      ).toBe(true);
      expect(corpus.every(({ text }) => text.includes(name)), `${name} missing`).toBe(true);
    }
    // The units are the Threshold Test's actual deliverable (D4 amendment:
    // "a per-flaw sensitivity threshold in physical units ... Not a score").
    expect(STAIRCASE_FAMILIES.length).toBe(3);
    for (const unit of ["cents", "kbps"]) {
      expect(full.includes(unit), `threshold unit "${unit}" not published`).toBe(true);
    }
    expect(/millisecond|\bms\b/i.test(full), "threshold timing unit not published").toBe(true);
  });
});

describe("the published files index the pages that exist", () => {
  const FILES = ["public/llms.txt", "public/llms-full.txt"];

  /**
   * A PAGE THAT EXISTS AND IS NOT PUBLISHED IS A SILENT OMISSION (E11/S6).
   *
   * These files were rewritten once already, were correct on the day, and had
   * rotted by the time anyone looked — which is why the quantities above are
   * pinned to the pool rather than typed. The page LIST had the same shape of
   * hole and no guard at all: `/learn/flaws` shipped in E11/S3 and neither
   * file mentioned it, so the readers these files are addressed to would have
   * been told the reading room has seven pages when it has eight.
   */
  it("every reading-room page appears in both", () => {
    const missing: string[] = [];
    for (const file of FILES) {
      const text = readFileSync(file, "utf8");
      for (const page of LEARN_PAGES) {
        if (!text.includes(`/learn/${page.slug}`)) missing.push(`${file}: /learn/${page.slug}`);
      }
    }
    expect(
      missing,
      "these pages ship but are not indexed for AI readers:" + String.fromCharCode(10) + missing.join(String.fromCharCode(10)),
    ).toEqual([]);
  });

  /**
   * The families are named in prose in these files, so they can drift from the
   * engine exactly as four source files did before E11/S1. This does not force
   * a wording — `llms-full.txt` also calls the lossy family "lossy-codec
   * artifacts" in an older paragraph, which is a fair synonym — it requires
   * that each family is named SOMEWHERE, and that no family the pipeline
   * cannot render is named at all.
   */
  it("names every flaw family the engine has, and no other", () => {
    const full = readFileSync("public/llms-full.txt", "utf8").toLowerCase();
    for (const f of flawFamilies()) {
      expect(full, `${f.family} is not named in llms-full.txt`).toContain(f.label.toLowerCase());
    }
    /*
     * AND THE COUNT IN PROSE MUST MATCH (E11/S6, red-teaming my own slice).
     *
     * The section added above opens "Three, and only three". The check
     * directly beneath this would catch a FOURTH family going unnamed — but
     * somebody adding the name and leaving the numeral is exactly how the
     * front door came to say "Two machines" over three cards, and the numeral
     * is the more emphatic half of the sentence.
     */
    const COUNT_WORDS = ["one", "two", "three", "four", "five"];
    const expected = COUNT_WORDS[flawFamilies().length - 1];
    /*
     * NO REGEX, NO ESCAPES. Three attempts to script a backslash into a test
     * file this session produced, in turn, a real newline, a literal BACKSPACE
     * byte and a swallowed backreference. The phrase is found by string
     * search and the word before it is read off the split — which needs no
     * escape and cannot half-work.
     */
    const marker = ", and only ";
    const at = full.indexOf(marker);
    expect(at, "llms-full.txt lost its family-count sentence").toBeGreaterThan(-1);
    const NL = String.fromCharCode(10);
    // Split on newlines first: the sentence opens a paragraph, so the token
    // before the marker carries the preceding line break with it otherwise.
    const claimed = full.slice(0, at).split(NL).join(" ").split(" ").filter(Boolean).pop() ?? "";
    expect(
      claimed,
      "llms-full.txt says " + claimed + marker + " while the engine has " +
        flawFamilies().length + " families",
    ).toBe(expected);

    const phantom = "wrong" + " note";
    for (const file of FILES) {
      expect(
        readFileSync(file, "utf8").toLowerCase().includes(phantom),
        `${file} names a degradation family the pipeline has never rendered`,
      ).toBe(false);
    }
  });
});
