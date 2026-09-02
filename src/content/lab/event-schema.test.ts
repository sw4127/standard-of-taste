/**
 * E15/S5 proof. PRE-REGISTERED, written before the sections rendered:
 *
 *   (a) EVERY REGISTERED EVENT APPEARS ON THE PAGE, EXACTLY ONCE. Not "most":
 *       the failure this guards is `docs/ANALYTICS.md`, which documented 23 of
 *       42 events while reading as complete. Adding an event to the code must
 *       break the build until the page has somewhere to put it.
 *   (b) NO EVENT IS DESCRIBED TWICE. The registry's sentence is the only
 *       description; a second one here would be free to drift.
 *   (c) EVERY LINEAGE ROW RESOLVES END TO END — event registered, module on
 *       disk, terminal either a real dictionary entry or an explicit statement
 *       of why there is none.
 *   (d) THE COUNT ON THE PAGE IS DERIVED. A typed "42 events" is the defect
 *       E15/S1 spent a slice removing from three other pages.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { KNOWN_EVENTS } from "@/lib/events";
import { METRICS, metric } from "./metrics";
import {
  ANSWER_CARRYING_EVENTS,
  ANSWER_PAYLOAD_KEYS,
  EVENT_COUNT,
  EVENT_SURFACES,
  LINEAGE,
  carriesAnswers,
  eventTrigger,
  eventsFor,
} from "./event-schema";

describe("E15/S5 — the event schema", () => {
  it("puts every registered event on the page exactly once", () => {
    const registered = Object.keys(KNOWN_EVENTS).sort();
    const shown = EVENT_SURFACES.flatMap((s) => eventsFor(s)).sort();
    expect(shown).toEqual(registered);
    expect(new Set(shown).size).toBe(shown.length);
  });

  it("derives the count rather than stating one", () => {
    expect(EVENT_COUNT).toBe(Object.keys(KNOWN_EVENTS).length);
    expect(EVENT_COUNT).toBeGreaterThan(30);
  });

  it("gives every surface at least one event and a reason to exist", () => {
    for (const s of EVENT_SURFACES) {
      expect(eventsFor(s).length, `${s.id} claims no events`).toBeGreaterThan(0);
      expect(s.blurb.length, `${s.id} has no blurb`).toBeGreaterThan(20);
    }
  });

  it("takes each event's description FROM the registry", () => {
    for (const event of Object.keys(KNOWN_EVENTS)) {
      expect(eventTrigger(event)).toBe(KNOWN_EVENTS[event]);
    }
  });

  /**
   * THE NEEDLE MUST SEE WHAT IT FORBIDS. `share_vs` is the trap: it begins with
   * "share_" and belongs to the World Cup surface, so a `share_` PREFIX on the
   * share-primitives surface would claim it twice. That surface therefore
   * lists its three events by name. If someone ever "simplifies" it to a
   * prefix, the module-load check fires — this asserts the check can.
   */
  it("refuses an event claimed by two surfaces", () => {
    const claimants = (event: string) =>
      EVENT_SURFACES.filter(
        (s) =>
          (s.events?.includes(event) ?? false) ||
          (s.prefixes?.some((p) => event.startsWith(p)) ?? false),
      );
    expect(claimants("share_vs")).toHaveLength(1);
    expect(claimants("share_vs")[0].id).toBe("world-cup");
    // The same predicate, shown finding a double claim, so the shape of the
    // check is proven rather than assumed.
    const doubled = [{ events: ["share_vs"] }, { prefixes: ["share_"] }].filter(
      (s) =>
        ((s as { events?: string[] }).events?.includes("share_vs") ?? false) ||
        ((s as { prefixes?: string[] }).prefixes?.some((p) => "share_vs".startsWith(p)) ?? false),
    );
    expect(doubled).toHaveLength(2);
  });
});

/**
 * THE PRIVACY CLAIM IS CHECKED AGAINST THE CALL SITES, NOT AGAINST MY MEMORY.
 *
 * The page states which events carry a person's raw answers. That is the single
 * most consequential sentence on it, and the first draft got it exactly
 * backwards — "they carry no answers", printed above a list in which
 * `bias_result` describes itself as carrying the raw ratings.
 *
 * So the declaration is verified BOTH WAYS against the source that emits the
 * events: a declared event whose payload contains no answer key fails, and an
 * undeclared event whose payload contains one fails too. The second direction
 * is the one that matters — it is what catches a future payload quietly gaining
 * a field while the page still says it does not.
 */
describe("E15/S5 — what the events actually carry", () => {
  /** Every `track(...)` call in the app, as event name → payload source. */
  const callSites = (): Map<string, string> => {
    const found = new Map<string, string>();
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name) || entry.name.includes(".test.")) continue;
        const src = readFileSync(full, "utf8");
        for (const event of Object.keys(KNOWN_EVENTS)) {
          const needle = `track("${event}"`;
          let at = src.indexOf(needle);
          while (at !== -1) {
            // The payload is whatever follows the event name up to the call's
            // close. Bounded rather than brace-matched: a fixed window cannot
            // be fooled by a nested object, and over-reading would only ever
            // make this test STRICTER, never blinder.
            const body = src.slice(at + needle.length, at + needle.length + 900);
            const end = body.indexOf("});");
            found.set(event, (found.get(event) ?? "") + body.slice(0, end === -1 ? 400 : end));
            at = src.indexOf(needle, at + 1);
          }
        }
      }
    };
    walk("src");
    return found;
  };

  const hasAnswerKey = (payload: string) =>
    ANSWER_PAYLOAD_KEYS.some((k) => new RegExp(`(^|[^A-Za-z_])${k}\\s*:`).test(payload));

  it("finds the call sites at all, or every assertion below is vacuous", () => {
    const sites = callSites();
    expect(sites.size).toBeGreaterThan(10);
    for (const event of ANSWER_CARRYING_EVENTS) {
      expect(sites.has(event), `no track("${event}") call site found`).toBe(true);
    }
  });

  it("every event marked as carrying answers really does", () => {
    const sites = callSites();
    for (const event of ANSWER_CARRYING_EVENTS) {
      expect(
        hasAnswerKey(sites.get(event) ?? ""),
        `"${event}" is marked as carrying answers, but its payload has none`,
      ).toBe(true);
    }
  });

  it("no event carries answers without being marked — the direction that matters", () => {
    const sites = callSites();
    for (const [event, payload] of sites) {
      if (carriesAnswers(event)) continue;
      expect(
        hasAnswerKey(payload),
        `"${event}" sends a person's answers and the page does not say so`,
      ).toBe(false);
    }
  });

  it("the needle can tell an answer payload from an ordinary one", () => {
    expect(hasAnswerKey("{ blind: ratings.join(',') }")).toBe(true);
    expect(hasAnswerKey("{ picks: encode(x) }")).toBe(true);
    expect(hasAnswerKey("{ family, trials: 40, switches: log }")).toBe(false);
    // A key that merely CONTAINS an answer word is not an answer key.
    expect(hasAnswerKey("{ blindfolded: true }")).toBe(false);
  });
});

describe("E15/S5 — from a tap to a statistic", () => {
  it("resolves every row end to end", () => {
    expect(LINEAGE.length).toBeGreaterThan(3);
    for (const row of LINEAGE) {
      expect(row.event in KNOWN_EVENTS, `${row.action} → ${row.event}`).toBe(true);
      expect(existsSync(row.computedIn), `${row.action} → ${row.computedIn}`).toBe(true);
      expect(row.action.length).toBeGreaterThan(20);
      expect(row.storedAs).toContain("gym.");
    }
  });

  it("ends each row at a real dictionary entry, or says why it does not", () => {
    for (const row of LINEAGE) {
      if (row.metricId === null) {
        expect(row.terminalNote, `${row.action} ends nowhere and explains nothing`).toBeTruthy();
        expect(row.terminalNote!.length).toBeGreaterThan(60);
      } else {
        expect(() => metric(row.metricId!), row.metricId!).not.toThrow();
        // A row cannot both land in the dictionary and excuse not landing.
        expect(row.terminalNote, `${row.metricId} both lands and excuses itself`).toBeUndefined();
      }
    }
  });

  /**
   * THE STAIRCASE HAS NO DICTIONARY ENTRY, and that is a finding rather than an
   * oversight — it reports a per-person sensitivity in physical units, not a
   * statistic about the instrument. Pinned so that if a threshold metric is
   * ever added, this fails and the page's explanation gets revisited instead of
   * quietly becoming untrue.
   */
  it("pins the fact that the threshold output is not a dictionary metric", () => {
    const staircase = LINEAGE.find((r) => r.event === "threshold_complete");
    expect(staircase, "no lineage row for the staircase").toBeTruthy();
    expect(staircase!.metricId).toBeNull();
    const ids = METRICS.map((m) => m.id);
    for (const id of ids) {
      expect(id, "a threshold metric now exists — revisit the lineage note").not.toMatch(
        /^(threshold|staircase)_/,
      );
    }
  });
});
