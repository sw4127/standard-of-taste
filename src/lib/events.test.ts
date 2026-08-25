import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { KNOWN_EVENTS, isKnownEvent } from "./events";

/**
 * E7/S13 — THE EVENT DICTIONARY AND THE CODE MUST DESCRIBE THE SAME PRODUCT.
 *
 * `docs/ANALYTICS.md` documented 23 of 42 emitted events and read as complete.
 * Nothing related the two sets, so it fell nineteen behind — every Delicacy and
 * Threshold event, and all three share events — while nobody could tell.
 *
 * Checked in BOTH directions on purpose. An unregistered event is data arriving
 * under a name nobody can interpret. A registered event that fires nowhere is
 * worse in a different way: it is a funnel step an analyst will look for, fail
 * to find, and treat as a drop-off.
 */
const NL = String.fromCharCode(10);

/** Every form the codebase emits an event in. */
const EVENT_PATTERNS = [
  /track\("([a-z0-9_]+)"/g,
  /\bevent="([a-z0-9_]+)"/g,
  /\bevent: "([a-z0-9_]+)"/g,
];

function shippedSources(): { file: string; text: string }[] {
  return execSync('git ls-files "src"', { encoding: "utf8" })
    .trim()
    .split(NL)
    .filter(Boolean)
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !/\.test\.tsx?$/.test(f))
    .filter((f) => f !== "src/lib/events.ts")
    .map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

function emittedEvents(): Map<string, string> {
  const found = new Map<string, string>();
  for (const { file, text } of shippedSources()) {
    for (const pattern of EVENT_PATTERNS) {
      for (const m of text.matchAll(pattern)) if (!found.has(m[1])) found.set(m[1], file);
    }
  }
  return found;
}

describe("E7/S13 — every event the code fires is one we wrote down", () => {
  it("finds events at all, so a green run is not a broken pattern", () => {
    // The tripwire. Both checks below pass trivially if the scan stops matching
    // — the same vacuity that let the claims sweep miss fifteen files while
    // reporting success.
    expect(emittedEvents().size, "the scan found almost no events — a pattern broke").toBeGreaterThan(35);
  });

  it("no event is emitted without being registered", () => {
    const unregistered = [...emittedEvents().entries()]
      .filter(([name]) => !isKnownEvent(name))
      .map(([name, file]) => `${name}  (${file})`)
      .sort();
    expect(
      unregistered,
      "These events arrive in the data under names nothing explains. Register each in " +
        "src/lib/events.ts with when it fires:" + NL + unregistered.join(NL),
    ).toEqual([]);
  });

  it("no registered event has stopped being emitted", () => {
    const emitted = emittedEvents();
    const dead = Object.keys(KNOWN_EVENTS)
      .filter((name) => !emitted.has(name))
      .sort();
    expect(
      dead,
      "These events are documented but fire nowhere. An analyst will look for them, fail " +
        "to find them, and read the absence as a drop-off:" + NL + dead.join(NL),
    ).toEqual([]);
  });

  it("every registered event says WHEN it fires", () => {
    for (const [name, when] of Object.entries(KNOWN_EVENTS)) {
      expect(when.length, `${name} has no description`).toBeGreaterThan(12);
    }
  });

  it("the three instruments each register a share event", () => {
    // threshold_share is the one the handoff flagged. Pinning all three keeps
    // the answer to "did we ever wire sharing on this instrument" in one place.
    for (const e of ["bias_share", "delicacy_share", "threshold_share"]) {
      expect(isKnownEvent(e), `${e} is not registered`).toBe(true);
      expect(emittedEvents().has(e), `${e} is registered but fires nowhere`).toBe(true);
    }
  });
});
