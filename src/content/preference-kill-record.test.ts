/**
 * THE KILL IS ON THE TRACKED RECORD, AND ITS NUMBERS ARE THE CODE'S NUMBERS
 * (E21/S3, PM ruling RT-3 a).
 *
 * WHY THIS GUARD AND NOT A CAREFUL READ. This project's two recorded failures
 * are both here in one place. The first: a ruling that lives only in an
 * untracked file gets made twice — RT-I was ruled once and carried as open by
 * three later handoffs. The second: a document states a quantity, the code
 * changes, and the document keeps looking authoritative while being wrong.
 *
 * A refusal is the worst possible place for either. It is the one kind of claim
 * on `/method` that a reader cannot check for themselves by using the product,
 * because the thing being described was never built. So the sentences that kill
 * the preference instrument are pinned to the functions that killed it: if the
 * arithmetic ever says something else, this fails rather than the page quietly
 * becoming a boast.
 *
 * WHAT IT CANNOT DO. It cannot tell whether the ruling was right, and it cannot
 * tell whether the prose around the numbers is honest. It checks that the
 * record exists, that it is tracked, and that every figure in it is one the
 * repository still computes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { planSitting, twoSidedSignP, trialsForPower } from "@/engine/preference";
import { METHOD_REFUSALS } from "./method/claims";
import { numberWord } from "./vocabulary/numbers";
import {
  PREFERENCE_PAIR_COUNT,
  PREFERENCE_SESSION_MINUTES,
  PREFERENCE_SITTING_MINUTES,
  PREFERENCE_SITTING_PAIRS,
  PREFERENCE_SITTING_TRIALS,
  PREFERENCE_TRIALS_PER_DIMENSION,
} from "./instrument-shape";

const NL = String.fromCharCode(10);
const RULINGS = "docs/rt-answers-2026-09-13.md";
const QUEUE = "docs/queue-of-record.md";
const ENGINE = "src/engine/preference.ts";

/** Whitespace collapsed, because every document here hard-wraps. */
const flat = (text: string): string => text.split(/\s+/).filter(Boolean).join(" ");

/** The number-words the record spells out, for the three figures it states. */
const WORDS: Record<number, string> = { 7: "seven", 28: "twenty-eight", 84: "eighty-four" };

function tracked(path: string): boolean {
  const out = execFileSync("git", ["ls-files", "--error-unmatch", path], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return out.trim().length > 0;
}

describe("the preference kill is recorded where a fresh clone can read it", () => {
  it("is in the rulings file, and the rulings file is tracked", () => {
    expect(existsSync(RULINGS)).toBe(true);
    expect(tracked(RULINGS)).toBe(true);
    const text = readFileSync(RULINGS, "utf8");
    expect(text).toContain("RT-P1 closed");
    expect(text).toContain("the preference instrument is killed");
  });

  it("does not leave RT-P1 described as awaiting a judgment anywhere", () => {
    // The exact shape of the RT-I failure: one file says ruled, another still
    // says open, and the next session answers it a second time.
    for (const path of [RULINGS, QUEUE]) {
      const text = readFileSync(path, "utf8");
      const stale = flat(text).includes("Awaiting the owner's judgment on whether it is worth building");
      expect(stale, `${path} still carries RT-P1 as open`).toBe(false);
    }
  });

  it("closes Track S, whose last line this task shipped", () => {
    // The status moved PARTLY DONE -> done only after the line was actually on
    // /method. A status that runs ahead of the page is the failure the queue's
    // own guard cannot catch: it checks that a status word is present, never
    // that it is true.
    // BOUNDED TO THE ROW, not to a character count. The first version took a
    // fixed 900-character window from the row's start, which reads into
    // WHATEVER FOLLOWS as soon as a neighbouring row grows — and would then
    // fail, or pass, on another track's status. A markdown table row is one
    // line, so the line is the boundary.
    const queue = readFileSync(QUEUE, "utf8");
    expect(queue).toContain("**S** —");
    const from = queue.indexOf("**S** —");
    const end = queue.indexOf(NL, from);
    const row = queue.slice(from, end === -1 ? queue.length : end);
    expect(row).toContain("**done**");
    expect(row).not.toContain("PARTLY DONE");
  });

  it("records RT-4, so adding the refusal to /learn is not re-proposed", () => {
    // The ruling was to publish the refusal on one page only. That is exactly
    // the kind of decision a later session re-opens helpfully, which is what
    // this file exists to stop.
    // ASSERTED ON THE RULING, NOT ON ITS RHETORIC. The first version pinned the
    // sentence "This is recorded so it is not re-proposed", which is a flourish
    // — reword it while leaving the ruling intact and the guard fails for its
    // own reasons, blaming a document that is still correct. What must be there
    // is the question, the surface it is about, and the answer.
    const rulings = flat(readFileSync(RULINGS, "utf8"));
    expect(rulings).toContain("RT-4 — the refusal stays on one page");
    expect(rulings).toContain("(a) leave it");
    expect(rulings).toContain("/learn");
  });

  it("adds no NEW path to the mock in the section /method cites", () => {
    // THE CONTAINMENT RULE, ONE STEP FURTHER ALONG, AND NARROWED AFTER IT
    // FAILED AS FIRST WRITTEN. The refusal on /method cites this file, so this
    // file is now one hop from a public page — and a reader who follows it must
    // not land on invented measurements.
    //
    // The first version of this check demanded the whole document be free of
    // the mock's path, and it failed on a row written before this session: §2
    // records where the mock was written, which is exactly the kind of
    // provenance a rulings file exists to carry. Scrubbing it would have
    // damaged the record to satisfy a guard.
    //
    // So the check is on §6, the section the refusal actually points at, and
    // the deeper protection is left where it belongs: the mock declares itself
    // invented in its own first lines, which mock-containment.test.ts enforces.
    const text = readFileSync(RULINGS, "utf8");
    const six = text.slice(text.indexOf("## 6. RT-P1 closed"));
    expect(six.length).toBeGreaterThan(1000);
    expect(six.indexOf("preference-mock")).toBe(-1);
  });
});

describe("every figure in the record is one the repository still computes", () => {
  const rulings = flat(readFileSync(RULINGS, "utf8"));
  const queue = flat(readFileSync(QUEUE, "utf8"));
  const plan = planSitting(3)!;

  it("states the detection floor the sign test actually produces", () => {
    expect(plan.detectionFloor).toBe(7);
    expect(rulings).toContain(`at least ${WORDS[plan.detectionFloor]} forced choices`);
  });

  it("states the choices per dimension the power calculation actually produces", () => {
    expect(PREFERENCE_TRIALS_PER_DIMENSION).toBe(plan.trialsPerDimension);
    expect(rulings).toContain(`needs **${WORDS[plan.trialsPerDimension]}**`);
  });

  it("states the pairs and the minutes the shape module actually derives", () => {
    expect(rulings).toContain(`${WORDS[PREFERENCE_PAIR_COUNT as number]} pairs`);
    expect(rulings).toContain(`the sitting is ${WORDS[PREFERENCE_SESSION_MINUTES as number]} minutes`);
    expect(queue).toContain(`${PREFERENCE_PAIR_COUNT} pairs and **${PREFERENCE_SESSION_MINUTES} minutes**`);
  });

  it("states the mock's flagship p-value to the digit the engine returns", () => {
    // Nine of twelve, which is what the mock reported as its central finding.
    const p = twoSidedSignP(9, 12);
    expect(rulings).toContain(`p = ${p.toFixed(3)}`);
  });

  it("states the six-to-three saving as the multiple it really is", () => {
    const six = (trialsForPower(0.8, 6) as number) * 6;
    const ratio = six / plan.pairs;
    expect(ratio).toBeGreaterThan(2.2);
    expect(ratio).toBeLessThan(2.4);
    expect(rulings).toContain("2.3-fold");
    // And the wrong figure the ruling was taken on is named, not quietly dropped.
    expect(rulings).toContain("roughly 20-fold");
    expect(rulings).toContain("~20 minutes");
  });
});

describe("the engine says it is a kill, not a plan", () => {
  const header = readFileSync(ENGINE, "utf8").slice(0, 2000);

  it("tells a reader who finds it that nothing here ships", () => {
    expect(header).toContain("KILLED");
    expect(header).toContain("NOTHING HERE SHIPS");
    expect(header).toContain("must not be read as a plan");
  });

  it("says why it was kept, so nobody deletes the refusal's evidence", () => {
    expect(flat(header)).toContain("killed by arithmetic leaves a test that still runs");
  });
});

describe("the refusal is on the page, and its numbers are slotted not typed", () => {
  const entry = METHOD_REFUSALS.find((r) => r.id === "refusal-preference-instrument");
  const plan = planSitting(3)!;

  it("exists, as the seventh refusal", () => {
    expect(entry, "the kill was recorded and never published").toBeDefined();
    expect(METHOD_REFUSALS.length).toBeGreaterThan(6);
  });

  it("renders the choices, pairs and minutes the engine derives", () => {
    const text = flat(`${entry!.what} ${entry!.refusal} ${entry!.price}`);
    expect(text).toContain(numberWord(plan.trialsPerDimension));
    expect(text).toContain(`${numberWord(PREFERENCE_PAIR_COUNT as number)} pairs`);
    expect(text).toContain(`${numberWord(PREFERENCE_SESSION_MINUTES as number)} minutes`);
  });

  it("carries Track S's held line — the restraint WITH its reason", () => {
    // Published as one entry rather than two on purpose: a product that says it
    // adds nothing more sounds disciplined, and one that says what the last
    // candidate cost to evaluate is making a checkable claim.
    expect(flat(entry!.refusal)).toContain("Nothing further is added to this product");
  });

  it("states a price that names what stays unserved, not a boast", () => {
    expect(flat(entry!.price)).toContain("almost nobody can describe their own taste in words");
    expect(flat(entry!.price)).toContain("does nothing at all for the second");
  });

  it("puts the bad figure on engineering and characterises nobody", () => {
    // The page's expertise rule refuses verdicts on people. The true sentence
    // here is about who computed a number, never about who read it.
    const text = flat(`${entry!.what} ${entry!.refusal} ${entry!.price}`).toLowerCase();
    expect(text).toContain("which engineering stated without deriving");
    for (const phrase of ["i don't know", "did not understand", "without knowing", "the owner"]) {
      expect(text.indexOf(phrase), `the refusal characterises a person: "${phrase}"`).toBe(-1);
    }
  });
});

describe("the page's own heading counts the refusals it renders", () => {
  // FOUND BY READING THE RENDERED PAGE, NOT BY A TEST. /method carried the
  // heading "Four refusals" directly above a `.map` over six of them, and no
  // guard noticed because every check on that page inspects the ENTRIES. A
  // count typed above the list it counts is the shortest distance between a
  // quantity and its own contradiction.
  const page = readFileSync("src/app/method/page.tsx", "utf8");

  it("slots the count from the array instead of typing it", () => {
    expect(flat(page)).toContain("{numberWordLeading(METHOD_REFUSALS.length)} refusals");
  });

  it("types no number-word before the word 'refusals' anywhere on the page", () => {
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const found = words
      .flatMap((w) => [w, w.charAt(0).toUpperCase() + w.slice(1)])
      .filter((w) => flat(page).includes(`${w} refusals`));
    expect(found, "a refusal count is typed into the page again").toEqual([]);
  });
});

describe("the frozen figures the refusal prints still match the derived ones", () => {
  // The refusal cannot render a null, so it reads frozen constants. That is
  // safe only while frozen and derived agree — this is the assertion that makes
  // it safe, and the reason the fallback is not a place a wrong number can hide.
  it("agrees on all three, so the page is printing today's arithmetic", () => {
    expect(PREFERENCE_SITTING_TRIALS).toBe(PREFERENCE_TRIALS_PER_DIMENSION);
    expect(PREFERENCE_SITTING_PAIRS).toBe(PREFERENCE_PAIR_COUNT);
    expect(PREFERENCE_SITTING_MINUTES).toBe(PREFERENCE_SESSION_MINUTES);
  });

  it("casts no null away in the published refusal", () => {
    // The hazard this replaced: `X as number` on a nullable export renders
    // numberWord(null), which throws at module load of a file the page imports.
    const claims = readFileSync("src/content/method/claims.ts", "utf8");
    expect(claims.indexOf("as number")).toBe(-1);
  });
});
