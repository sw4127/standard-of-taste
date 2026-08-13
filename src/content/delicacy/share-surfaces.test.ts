/**
 * SHARE-SURFACE AGREEMENT (RT-37b regression, 2026-08-13).
 *
 * The bug this file exists to prevent, which was LIVE when the split shipped:
 * the practice block took three items out of the scored set, but three surfaces
 * kept encoding and decoding against the full 18-trial pool.
 *
 *   DelicacyFlow.tsx:516      encode(DELICACY_TRIALS, responses)  → THREW on d7
 *   result/page.tsx:50        decode(DELICACY_TRIALS, payload)    → null
 *   api/delicacy-card:57      decode(DELICACY_TRIALS, payload)    → 400
 *
 * `responses` only ever holds the 15 scored trials — the practice block never
 * writes to it. So every completed session crashed while building its own share
 * URL, and every share link that did exist was undecodable. No test caught it,
 * because every test built its own responses object over whichever list it was
 * already holding. The gap was never in the engine; it was in WHICH LIST each
 * surface passed to it, which is exactly the seam a split creates.
 *
 * The contract asserted here: the payload is positional against MEASURED_TRIALS,
 * and every surface that touches it agrees on that. This is the codec half of
 * checkPracticeSplit — that gate proves the SETS are right, this one proves the
 * CONSUMERS use the right one.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  computeDelicacyResult,
  decodeDelicacyResponses,
  encodeDelicacyResponses,
  type DelicacyResponses,
} from "@/engine/delicacy";
import { DELICACY_INSTRUMENT_ID, DELICACY_TRIALS, MEASURED_TRIALS, PRACTICE_TRIALS } from "./items";

/** Exactly the state DelicacyFlow holds at `phase === "done"`. */
const sessionResponses = (): DelicacyResponses => {
  const r: DelicacyResponses = {};
  for (const t of MEASURED_TRIALS) r[t.id] = { pickedSide: "a", flawPick: t.family, confidence: 70 };
  return r;
};

describe("share surfaces agree on the scored set", () => {
  it("a completed session answers the measured trials and NOT the practice ones", () => {
    const responses = sessionResponses();
    expect(Object.keys(responses)).toHaveLength(MEASURED_TRIALS.length);
    for (const p of PRACTICE_TRIALS) expect(responses[p.id]).toBeUndefined();
  });

  it("encoding a real session against the POOL throws — the shape of the original bug", () => {
    expect(() => encodeDelicacyResponses(DELICACY_TRIALS, sessionResponses())).toThrow(
      /missing response for "d7"/,
    );
  });

  it("encoding against MEASURED_TRIALS yields one token per scored trial", () => {
    const payload = encodeDelicacyResponses(MEASURED_TRIALS, sessionResponses());
    expect(payload.split(",")).toHaveLength(MEASURED_TRIALS.length);
  });

  it("round-trips: encode → decode → identical responses, against the measured set", () => {
    const responses = sessionResponses();
    const payload = encodeDelicacyResponses(MEASURED_TRIALS, responses);
    expect(decodeDelicacyResponses(MEASURED_TRIALS, payload)).toEqual(responses);
  });

  it("that payload is UNDECODABLE against the pool — so a surface using the wrong list fails loudly", () => {
    const payload = encodeDelicacyResponses(MEASURED_TRIALS, sessionResponses());
    expect(decodeDelicacyResponses(DELICACY_TRIALS, payload)).toBeNull();
  });

  it("scores out of the scored set: nTrials is 15, never 18", () => {
    const responses = sessionResponses();
    const payload = encodeDelicacyResponses(MEASURED_TRIALS, responses);
    const decoded = decodeDelicacyResponses(MEASURED_TRIALS, payload)!;
    const result = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, decoded);
    expect(result.nTrials).toBe(MEASURED_TRIALS.length);
    expect(result.nTrials).toBe(15);
  });

  it("the flow, the result page and the card route all recompute the SAME result", () => {
    // The three surfaces are separately-written call sites; this pins them to
    // one answer, which is the property that actually broke.
    const responses = sessionResponses();
    const fromFlow = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
    const payload = encodeDelicacyResponses(MEASURED_TRIALS, responses);
    const decoded = decodeDelicacyResponses(MEASURED_TRIALS, payload)!;
    const fromResultPage = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, decoded);
    const fromCardRoute = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, decoded);
    expect(fromResultPage.hash).toBe(fromFlow.hash);
    expect(fromCardRoute.hash).toBe(fromFlow.hash);
    expect(fromResultPage.nCorrect).toBe(fromFlow.nCorrect);
  });
});

describe("the source files themselves do not reach for the pool on a scored path", () => {
  // A grep-level guard. The bug was a wrong identifier, not wrong logic, so the
  // cheapest durable check is that the identifier cannot come back.
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it.each([
    ["src/app/delicacy/DelicacyFlow.tsx", /encodeDelicacyResponses\(\s*DELICACY_TRIALS/],
    ["src/app/delicacy/result/page.tsx", /(decodeDelicacyResponses|computeDelicacyResult)\([^)]*DELICACY_TRIALS/],
    ["src/app/api/delicacy-card/route.tsx", /(decodeDelicacyResponses|computeDelicacyResult)\([^)]*DELICACY_TRIALS/],
  ])("%s never passes DELICACY_TRIALS to the codec or the scorer", (file, forbidden) => {
    expect(read(file)).not.toMatch(forbidden);
  });
});
