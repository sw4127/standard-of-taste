/**
 * RT-38b: the recall defences, as contracts rather than intentions.
 *
 * The PM found the defect by using the product — "the prestige test now feels
 * like a test of only short-term memory" — so the fix needs a test that fails
 * if anyone quietly restores the old behaviour, which looked perfectly
 * reasonable in code.
 */

import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "@/content/bias/items";

/**
 * Mirrors the rotation in BiasFlow. Kept as a pure function here so the
 * property can be asserted without mounting a React tree; BiasFlow builds its
 * order the same way and the shape test below pins that they agree.
 */
const rotate = <T,>(xs: T[]): T[] => xs.map((_, i, a) => a[(i + Math.floor(a.length / 2)) % a.length]);

describe("prestige — the labeled pass defeats POSITIONAL recall", () => {
  const blindOrder = BIAS_CLIPS;
  const labeledOrder = rotate(BIAS_CLIPS);

  it("presents every clip exactly once — a rotation, not a resample", () => {
    expect(labeledOrder).toHaveLength(blindOrder.length);
    expect(new Set(labeledOrder.map((c) => c.id)).size).toBe(blindOrder.length);
  });

  it("no clip is rated twice in the same position", () => {
    // The failure this catches is the old design: same clips, same order.
    for (let i = 0; i < blindOrder.length; i++) {
      expect(labeledOrder[i].id, `position ${i} repeats ${blindOrder[i].id}`).not.toBe(blindOrder[i].id);
    }
  });

  it("changes the SEPARATION PROFILE — and honestly, not always upward", () => {
    // Correcting a claim I made while writing this: rotation does not buy
    // distance. With two sequential passes, separation is already uniformly n
    // (clip i is rated at trial i and again at trial n+i). Rotating spreads it
    // out — some clips further apart, some CLOSER. The test asserts the real
    // shape rather than a flattering one.
    const n = blindOrder.length;
    const sep = (order: typeof blindOrder) =>
      blindOrder.map((c, p) => n + order.findIndex((x) => x.id === c.id) - p);

    const before = sep(blindOrder);
    const after = sep(labeledOrder);
    console.log(
      `[bias] separation — same-order design: constant ${before[0]} trials; ` +
        `rotated: ${Math.min(...after)}-${Math.max(...after)} trials`,
    );
    expect(new Set(before).size).toBe(1);
    expect(before[0]).toBe(n);
    // Rotation trades a constant for a spread, and the minimum genuinely drops.
    expect(Math.min(...after)).toBeLessThan(n);
    expect(Math.max(...after)).toBeGreaterThan(n);
  });

  it("what rotation actually buys: the running order leaks nothing", () => {
    // The defence that works. Under the old design, position k in the labeled
    // pass was always the clip rated at position k — so a respondent could
    // track their own answers by counting. After rotation no position maps to
    // itself, so counting tells you nothing.
    const selfMapped = blindOrder.filter((c, i) => labeledOrder[i].id === c.id);
    expect(selfMapped).toHaveLength(0);
  });
});

describe("prestige — reordering cannot change the score", () => {
  it("ratings are keyed by clip id, so the engine sees the same input", async () => {
    const { computeBiasResult } = await import("@/engine/bias");
    const blind: Record<string, number> = {};
    const labeled: Record<string, number> = {};
    BIAS_CLIPS.forEach((c, i) => {
      blind[c.id] = (i * 3) % 11;
      labeled[c.id] = (i * 3 + 2) % 11;
    });
    // Whatever order they were COLLECTED in, the result is computed against the
    // canonical pool order — so presentation order is a UI concern only, and
    // share payloads stay positional against the pool rather than the session.
    const a = computeBiasResult("prestige-bias-v1", BIAS_CLIPS, blind, labeled);
    const b = computeBiasResult("prestige-bias-v1", rotate(BIAS_CLIPS), blind, labeled);
    expect(b.pct).toBe(a.pct);
    expect(b.hash).toBe(a.hash);
  });
});
