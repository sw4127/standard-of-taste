import { describe, it, expect } from "vitest";
import { isInterruptedPlay } from "./ClipPlayer";

/**
 * E6/S18 — the predicate that stopped a working clip being called broken.
 *
 * The mechanism was measured in a real browser before this was written:
 * `play()` followed by `pause()` before it resolves rejects with
 * `AbortError: The play() request was interrupted by a call to pause()`.
 * `claimPlayback` performs exactly that pause on the other clip, so the
 * component was manufacturing its own "load failure" — and a failed clip keeps
 * the rating gate locked, which makes the trial unanswerable.
 *
 * These cases are the ones that decide behaviour, not a sample: an abort must
 * pass, and every other failure must still be reported, because a clip that
 * genuinely will not load must keep the gate shut.
 */
describe("isInterruptedPlay", () => {
  it("recognises the abort the playback registry causes", () => {
    expect(isInterruptedPlay(new DOMException("interrupted by pause", "AbortError"))).toBe(true);
  });

  it("does NOT swallow a real load or decode failure", () => {
    // If these ever return true the gate opens on a clip nobody heard, which is
    // strictly worse than the bug this fixes.
    expect(isInterruptedPlay(new DOMException("no source", "NotSupportedError"))).toBe(false);
    expect(isInterruptedPlay(new DOMException("blocked", "NotAllowedError"))).toBe(false);
    expect(isInterruptedPlay(new DOMException("decode", "EncodingError"))).toBe(false);
  });

  it("does not mistake a plain Error named AbortError for a DOMException", () => {
    // Narrow on purpose: only the browser's own abort qualifies.
    const impostor = new Error("aborted");
    impostor.name = "AbortError";
    expect(isInterruptedPlay(impostor)).toBe(false);
  });

  it("treats non-errors as real failures rather than assuming", () => {
    expect(isInterruptedPlay(undefined)).toBe(false);
    expect(isInterruptedPlay("AbortError")).toBe(false);
    expect(isInterruptedPlay(null)).toBe(false);
  });
});
