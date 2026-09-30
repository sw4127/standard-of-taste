/**
 * EVERY EVENT CARRIES THE PAGE'S LANGUAGE (bilingual Part 4; D6, N3).
 *
 * The Chinese instruments show a different stimulus (the Prestige labels, every
 * instruction), so a Chinese sitting must be separable from an English one in the
 * dataset. This holds `eventPayload`, which `track` sends, to that.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventPayload } from "./analytics";

function at(pathname: string) {
  const store = new Map<string, string>();
  vi.stubGlobal("window", { location: { pathname, search: "" } });
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("the language on every event", () => {
  it("is zh on a Chinese page and en on an English one", () => {
    at("/zh/bias");
    expect(eventPayload({ pct: 3 }).lang).toBe("zh");
    at("/bias");
    expect(eventPayload({}).lang).toBe("en");
  });

  it("keeps the event's own properties", () => {
    at("/zh/threshold/pitch");
    expect(eventPayload({ family: "pitch-drift" })).toMatchObject({ family: "pitch-drift", lang: "zh" });
  });
});
