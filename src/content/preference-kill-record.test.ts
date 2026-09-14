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
import {
  PREFERENCE_PAIR_COUNT,
  PREFERENCE_SESSION_MINUTES,
  PREFERENCE_TRIALS_PER_DIMENSION,
} from "./instrument-shape";

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

  it("releases the Track S hold, which was blocked on exactly this ruling", () => {
    const queue = readFileSync(QUEUE, "utf8");
    expect(queue).toContain("**S** —");
    expect(flat(queue)).toContain("no longer blocked");
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
