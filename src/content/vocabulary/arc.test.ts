/**
 * E14/S3 — THE COMPARATIVE SENTENCES.
 *
 * PRE-REGISTERED, WRITTEN BEFORE THE COPY:
 *
 *   (a) EVERY BRANCH IS REACHED. The fixture placements must actually produce
 *       each direction, the off-ladder case, and every refusal. A branch that
 *       drifts out of reach is a sentence nobody ever reads and nothing ever
 *       checks — the hole the voice deck's own hazard gate exists to close.
 *   (b) THE "NO CHANGE" SENTENCE NAMES THE FLOOR IN THE READER'S UNITS. This is
 *       the ruled behaviour (RT-H1 a) and the whole difference between a
 *       refusal and a shrug, so it is asserted rather than assumed.
 *   (c) NO STAIRCASE SENTENCE PRINTS AN ENDPOINT AS A THRESHOLD. The arc
 *       compares the posterior median; the result screen prints the band and
 *       usually declines a point. Two different numbers on one page is the
 *       defect E8/S8 shipped and found by rendering. Enforced by pattern, over
 *       every reachable sentence.
 *   (d) NOTHING CLAIMS A CHANGE THAT WAS NOT MEASURED. No sentence may say a
 *       person improved, practised, got better, or is ahead of anyone.
 *   (e) THE SENTENCES ARE READ, NOT INSPECTED. The full deck is printed so the
 *       lines can be read as a person meets them.
 */
import { describe, expect, it } from "vitest";
import { arcLines, ARC_DEVICE_NOTE, ARC_REFUSAL, arcRefusal, delicacyArcRefusal } from "./arc";
import { arcClaims } from "./fixtures";
import { checkVoice } from "../voice";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { DELICACY_ARC_FLOOR_SHARE } from "@/engine/arc";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";
import { MEASURED_TRIALS } from "@/content/delicacy/items";

const claims = arcClaims();

describe("E14/S3 — every branch the arc can take is reached and voiced", () => {
  it("prints the whole deck, so the sentences are read rather than inspected", () => {
    for (const [name, claim] of Object.entries(claims)) {
      const shape = claim.ok
        ? `${claim.value.instrument}/${String(claim.value.direction)}`
        : `refused/${claim.gap}`;
      console.log(`[E14/S3] --- ${name}  (${shape})`);
      for (const line of arcLines(claim)) console.log(`[E14/S3]     ${line}`);
    }
    expect(Object.keys(claims).length).toBeGreaterThan(0);
  });

  /**
   * (a) The placements in `fixtures.ts` are chosen to reach these shapes. If a
   * ladder, a budget or the floor moves, a placement can silently stop reaching
   * its branch — and the branch would then be unvoiced, untested, and still
   * shipped. This is the assertion that notices.
   */
  it("reaches every direction, the off-ladder case, and every refusal", () => {
    const shape = (name: string) => {
      const c = claims[name];
      return c.ok ? `${c.value.instrument}/${String(c.value.direction)}` : `refused/${c.gap}`;
    };
    expect(shape("threshold-no-change")).toBe("threshold/null");
    expect(shape("threshold-closer")).toBe("threshold/closer");
    expect(shape("threshold-further")).toBe("threshold/further");
    expect(shape("bias-no-change")).toBe("bias/null");
    expect(shape("bias-closer")).toBe("bias/closer");
    expect(shape("bias-further")).toBe("bias/further");
    expect(shape("refuse-too-few")).toBe("refused/too-few-sessions");
    expect(shape("refuse-different-material")).toBe("refused/different-material");
    expect(shape("refuse-delicacy")).toBe("refused/arc-instrument-unsupported");
    expect(shape("refuse-no-floor")).toBe("refused/no-arc-floor");

    /*
     * THE DIRECTION IS NOT THE BRANCH, and this assertion used to check only
     * the direction. Both "closer" and "further" were landing on the OFF-LADDER
     * sentence, so the ordinary in-range sentence — the one that carries the
     * actual multiple, and the one most readers with a real change would get —
     * was never rendered anywhere in the deck, never read, and never checked.
     * The test passed. It was found by printing the sentences.
     */
    const inRange = (name: string) => {
      const c = claims[name];
      expect(c.ok, `${name} refused`).toBe(true);
      return c.ok && c.value.earlier.withinRange && c.value.latest.withinRange;
    };
    expect(inRange("threshold-closer"), "the 'closer' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-further"), "the 'further' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-no-change"), "the 'no change' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-off-ladder"), "the off-ladder fixture is no longer off the ladder").toBe(false);

    const off = claims["threshold-off-ladder"];
    if (off.ok) {
      expect(off.value.direction, "the off-ladder fixture no longer produces a direction").not.toBeNull();
    }
  });

  it("has a written refusal for every gap the arc can return", () => {
    // Read off the module's own map rather than a second list here: a gap that
    // gained a sentence without gaining a test would otherwise pass, and one
    // that lost its sentence would fall through to the wrong text.
    for (const gap of ["too-few-sessions", "different-material", "arc-instrument-unsupported", "no-arc-floor", "no-scoreable-trials"]) {
      expect(ARC_REFUSAL[gap], `no refusal sentence for "${gap}"`).toBeTruthy();
      expect(arcRefusal(gap)).toBe(ARC_REFUSAL[gap]);
    }
  });
});

describe("E14/S3 — what the sentences may not do", () => {
  const everyLine = () => Object.values(claims).flatMap((c) => arcLines(c));

  /** (b) The ruled behaviour, asserted on the rendered sentence. */
  it("names the floor, in the reader's units, when it declines to call a change", () => {
    const noChange = claims["threshold-no-change"];
    expect(noChange.ok).toBe(true);
    if (!noChange.ok) return;
    const text = arcLines(noChange).join(" ");
    const floor = noChange.value.floorFactor ?? 0;
    // The multiple as the copy rounds it, not as the engine holds it.
    expect(text, "the no-change sentence does not say what it would have taken").toContain(
      `${floor.toFixed(1)}x`,
    );
    // And it must not read as a verdict on the person.
    expect(text.toLowerCase()).toContain("instrument");
  });

  /**
   * (c) THE NUMBER THIS LAYER MAY NOT PRINT.
   *
   * A staircase sentence naming "34 cents" or "96 kbps" would be printing the
   * posterior median as though it were the threshold the result screen reports,
   * which it is not. Multiples ("3.5x") are fine and are the whole design.
   */
  it("never prints a staircase endpoint as a threshold", () => {
    const units = /\d+(\.\d+)?\s*(cents?|ms|milliseconds?|kbps)\b/i;
    for (const [name, claim] of Object.entries(claims)) {
      if (claim.ok && claim.value.instrument === "bias") continue;
      for (const line of arcLines(claim)) {
        expect(units.test(line), `${name} prints a physical quantity: ${line}`).toBe(false);
      }
    }
  });

  /** (d) N3 and D1: no unmeasured claim, and no comparison with other people. */
  it("claims no improvement it did not measure, and compares nobody to anybody", () => {
    const banned: [RegExp, string][] = [
      [/\bpercentile\b/i, "percentile"],
      [/\bbetter than (?:most|other|average)\b/i, "between-people comparison"],
      [/\bmost (?:people|listeners|users)\b/i, "cohort claim"],
      [/\baverage (?:person|listener)\b/i, "cohort claim"],
      [/\byour best\b/i, "personal record"],
      [/\bpersonal best\b/i, "personal record"],
      [/\bstreak\b/i, "streak"],
      [/\bkeep it up\b/i, "encouragement as finding"],
      [/\bpractice (?:is )?(?:working|paying)\b/i, "unmeasured causal claim"],
      [/\byou (?:have )?improved\b/i, "verdict on the person"],
      [/\byou got better\b/i, "verdict on the person"],
    ];
    for (const [name, claim] of Object.entries(claims)) {
      for (const line of arcLines(claim)) {
        for (const [re, why] of banned) {
          expect(re.test(line), `${name}: ${why} in "${line}"`).toBe(false);
        }
      }
    }
  });

  it("passes the voice deck as its own surface", () => {
    const violations = checkVoice(
      everyLine().map((text, i) => ({ surface: `vocabulary/arc/direct/${i}`, text, intensity: "pointed" as const })),
    );
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  /**
   * A GUARD THAT ONLY EVER SAYS YES IS NOT A GUARD. The two checks above are
   * pattern matches over generated prose, and a pattern that matches nothing is
   * indistinguishable from a pattern that is broken. These are the same checks
   * pointed at sentences that SHOULD fail them.
   */
  /**
   * NOTHING MAY COUNT IN A SENTENCE SHOWN IN EVERY STATE.
   *
   * `ARC_DEVICE_NOTE` renders in the same block as the reading AND as every
   * refusal, so it is on screen when there are two sittings, when there is one,
   * and when there are none that can be compared. It opened "Both sittings were
   * read from this browser only" and shipped that line directly underneath "One
   * session cannot say whether your ear moved". Nothing failed; it was found by
   * reading the rendered page.
   */
  it("says nothing about how many sittings there are, because it does not know", () => {
    const counting = /\bboth\b|\btwo\b|\bthese\b|\bpair\b|\beach\b|\bsittings\b|\bsessions\b/i;
    expect(
      counting.test(ARC_DEVICE_NOTE),
      `the device note is shown in every arc state and may not imply a count: "${ARC_DEVICE_NOTE}"`,
    ).toBe(false);
    // The needle is worthless if it cannot see the line it was written for.
    expect(counting.test("Both sittings were read from this browser only")).toBe(true);
  });

  /**
   * A READING MAY NOT SAY HOW MANY SITTINGS IT RESTS ON — only `pooledLine` may,
   * because it is the only sentence that is given the count.
   *
   * THIS FILE HAS SHIPPED THE SAME DEFECT TWICE. E14/S3 wrote "Between these two
   * sittings" when a reading compared exactly two; E14/S6 pooled up to four and
   * every one of those sentences silently became false. Nothing failed — it was
   * found by reading the printed deck, again. The `refuse-different-material`
   * sentence is exempt: two sessions on two recordings is precisely what it is
   * about, and there is nothing to pool.
   */
  it("lets no reading state a number of sittings it does not know", () => {
    /*
     * NO BACKSLASH ESCAPES IN THIS PATTERN, AND THAT IS NOT A STYLE CHOICE.
     * The first version was scripted through a shell as a word-boundary regex
     * and the transport ate one level of escaping, writing literal 0x08
     * BACKSPACE bytes into the file. The regex then matched nothing, its own
     * self-check failed, and the guard would otherwise have shipped blind.
     * These phrases need no boundaries, so the pattern has none.
     *
     * AND A BARE "both" WAS TOO BLUNT. It flagged "Both directions count:
     * marking a labelled clip down is still the name deciding" — a sentence
     * about the two DIRECTIONS of sway, not about how many sittings there
     * were. Same trap `voice.ts` documents one rule over, where a norm guard
     * flagged the badge that exists to deny a norm: a substring cannot tell the
     * claim from its denial, so the needle names what it actually forbids.
     */
    const counting = /these two|your two|the two|last time|this time|both sittings|both sessions/i;
    for (const [name, claim] of Object.entries(claims)) {
      if (!claim.ok) continue;
      for (const line of arcLines(claim)) {
        // The pooled line is handed the counts and is the one place they belong.
        if (line.startsWith("This rests on")) continue;
        expect(counting.test(line), `${name} states a count it cannot know: ${line}`).toBe(false);
      }
    }
    // The needle must see the sentence it was written for.
    expect(counting.test("Between these two pitch drift sittings, you now catch")).toBe(true);
    expect(counting.test("The label moved you +20% last time and +15% this time")).toBe(true);
    expect(counting.test("Across your pitch drift sittings, you now catch")).toBe(false);
  });

  /** The pooled line is the one sentence that may — and must — state the count. */
  it("names the sittings behind a pooled reading, and what they bought", () => {
    const pooled = claims["threshold-pooled"];
    expect(pooled.ok).toBe(true);
    if (!pooled.ok) return;
    const line = arcLines(pooled).find((l) => l.startsWith("This rests on"));
    expect(line, "a four-sitting reading does not say what pooling bought").toBeTruthy();
    const total = pooled.value.pooled.older + pooled.value.pooled.newer;
    expect(line).toContain(`${total} sittings`);
    // It must show the floor MOVING, in both numbers, or the reader is told a
    // benefit they cannot check.
    const solo = pooled.value.soloFloorFactor ?? 0;
    const now = pooled.value.floorFactor ?? 0;
    expect(solo, "pooling did not lower the floor").toBeGreaterThan(now);
    expect(line).toContain(`${solo.toFixed(1)}x`);
    expect(line).toContain(`${now.toFixed(1)}x`);
  });

  /**
   * NOTHING MAY COUNT — INCLUDING ABOUT THE ITEM POOL (E15/S1).
   *
   * The delicacy refusal shipped "six of the fifteen pairs — or four of a
   * single flaw's five" as typed words, and the same two counts were typed
   * again on `/method` and `/learn/practice`. Nothing related any of them to
   * the pool, so growing it would have made three live sentences false with the
   * suite green — the fourth instance of this defect in this file's subject
   * area, and the first on public pages.
   *
   * THE GUARD HANDS THE SENTENCE A POOL THAT DOES NOT EXIST. Asserting that
   * today's sentence contains "fifteen" would pass just as well against the
   * hardcoded version, which is exactly the guard-weaker-than-its-name failure
   * E11 spent a session removing. So the builder is called with several
   * arities, and what is checked is that the words FOLLOW.
   */
  it("states the delicacy floor from the pool it is given, not from a literal", () => {
    const twenty = delicacyArcRefusal({
      trials: 20,
      itemsToMove: 8,
      perFamilyTrials: 7,
      perFamilyItemsToMove: 6,
    });
    expect(twenty).toContain("eight of the twenty pairs");
    expect(twenty).toContain("six of a single flaw's seven");
    // The number the SHIPPED sentence carries must be absent, or the builder is
    // interpolating nothing and the assertion above proves only that a literal
    // happens to match.
    expect(twenty).not.toContain("fifteen");

    // A pool whose families differ in size cannot be described by one number,
    // so the clause that would have to pick one is dropped entirely.
    const ragged = delicacyArcRefusal({
      trials: 17,
      itemsToMove: 7,
      perFamilyTrials: null,
      perFamilyItemsToMove: null,
    });
    expect(ragged).toContain("seven of the seventeen pairs");
    expect(ragged).not.toContain("single flaw");

    /*
     * THE DASH IS PAIRED, AND THE FIRST BUILD OF THIS DROPPED THE CLOSING ONE.
     * Every test above passed while the shipped sentence read "a single flaw's
     * five before it meant anything". Only printing it showed the break, so the
     * shape of the punctuation is now asserted rather than trusted.
     */
    const dash = String.fromCharCode(0x2014);
    expect(twenty.split(dash)).toHaveLength(3);
    expect(twenty).toContain(`seven ${dash} before it meant anything`);
    expect(ragged.includes(dash), "no clause means no dangling dash").toBe(false);

    // And the shipped string must be that builder's output over the live pool —
    // not a copy of it that can drift.
    expect(ARC_REFUSAL["arc-instrument-unsupported"]).toBe(delicacyArcRefusal(DELICACY_ARC_FLOOR));
  });

  /**
   * The floor is derived from the pool, so a bigger pool must move it. If this
   * ever fails, something upstream has gone back to a constant.
   */
  it("derives the live floor from the live pool, in both directions", () => {
    expect(DELICACY_ARC_FLOOR.trials).toBe(MEASURED_TRIALS.length);
    expect(DELICACY_ARC_FLOOR.itemsToMove).toBe(
      Math.round(DELICACY_ARC_FLOOR_SHARE * MEASURED_TRIALS.length),
    );
    expect(DELICACY_ARC_FLOOR.itemsToMove).toBeLessThan(DELICACY_ARC_FLOOR.trials);
    expect(DELICACY_ARC_FLOOR.perFamilyTrials).toBe(
      MEASURED_TRIALS.filter((t) => t.family === DEGRADATION_FAMILIES[0]).length,
    );
  });

  it("the two prose guards above actually fire", () => {
    const units = /\d+(\.\d+)?\s*(cents?|ms|milliseconds?|kbps)\b/i;
    expect(units.test("your threshold went from 34 cents to 12 cents")).toBe(true);
    expect(units.test("a change of about 3.5x")).toBe(false);
    expect(/\byou (?:have )?improved\b/i.test("you improved since last time")).toBe(true);
    expect(/\bstreak\b/i.test("three sessions in a row — keep the streak")).toBe(true);
  });
});
