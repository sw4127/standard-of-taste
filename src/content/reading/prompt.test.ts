/**
 * THE PROMPT FOLLOWS THE READER'S ARGUMENT (blueprint Part 5; BP-UNMET, BP-BRIDGE).
 *
 * A rejected line drops out; a chosen reading adds its words; "neither" adds
 * none; the sound is grouped by flaw family; every word passes the carve-out.
 * Checked over every combination of choices on every listener, not a sample.
 */
import { describe, expect, it } from "vitest";
import { carveOutBreaches } from "@/content/carve-out";
import { listenerFacts, HOST_NAME } from "./copy";
import { LISTENERS } from "./listeners";
import { buildPrompt, EMPTY_STATE, type Choice, type ReaderState } from "./prompt";
import { readingFor } from "./reading";

const readings = LISTENERS.map(readingFor);

/** Every combination of reject / a / b / neither / unchosen over a reading's lines. */
function* allStates(ids: string[]): Generator<ReaderState> {
  const opts = ["reject", "a", "b", "neither", "none"] as const;
  const n = ids.length;
  for (let k = 0; k < Math.pow(opts.length, n); k++) {
    const s: ReaderState = { rejected: [], chosen: {} };
    let x = k;
    for (const id of ids) {
      const o = opts[x % opts.length];
      x = Math.floor(x / opts.length);
      if (o === "reject") s.rejected.push(id);
      else if (o !== "none") s.chosen[id] = o as Choice;
    }
    yield s;
  }
}

describe("the prompt", () => {
  it("changes when a line is rejected", () => {
    for (const r of readings) {
      const before = buildPrompt(r, EMPTY_STATE).text;
      const after = buildPrompt(r, { rejected: [r.lines[0].id], chosen: {} }).text;
      expect(after, r.listener.name).not.toBe(before);
    }
  });

  it("changes when a reading is chosen, and differently for a and b", () => {
    for (const r of readings) {
      const id = r.lines[0].id;
      const a = buildPrompt(r, { rejected: [], chosen: { [id]: "a" } }).text;
      const b = buildPrompt(r, { rejected: [], chosen: { [id]: "b" } }).text;
      const neither = buildPrompt(r, { rejected: [], chosen: { [id]: "neither" } }).text;
      expect(a).not.toBe(b);
      expect(a).toContain(`Mood: ${r.lines[0].offers[0].words.join(", ")}`);
      expect(neither).toBe(buildPrompt(r, EMPTY_STATE).text);
    }
  });

  it("is empty when every line is rejected", () => {
    for (const r of readings) {
      expect(buildPrompt(r, { rejected: r.lines.map((l) => l.id), chosen: {} }).text).toBe("");
    }
  });

  it("groups its sound by the three flaw families and names no generator (RT-Z8 a)", () => {
    for (const r of readings) {
      const t = buildPrompt(r, EMPTY_STATE).text;
      for (const label of ["Tuning:", "Timing:", "Dynamics:"]) expect(t).toContain(label);
      expect(t).not.toMatch(/suno|udio|stable audio|musicgen|lyria|tessavox/i);
    }
  });

  it("passes the carve-out in every combination of choices on every listener", () => {
    let n = 0;
    const found: string[] = [];
    for (const r of readings) {
      for (const s of allStates(r.lines.map((l) => l.id))) {
        n++;
        const t = buildPrompt(r, s).text;
        found.push(...carveOutBreaches(t).map((b) => `${r.listener.name}: ${b}`));
      }
    }
    expect(n).toBeGreaterThan(1000);
    expect(found).toEqual([]);
  });

  it("states a listener card's counts", () => {
    expect(listenerFacts(294, 28)).toBe("294 plays · 28 tracks · four weeks");
    expect(HOST_NAME).toBe("Tessavox");
  });
});
