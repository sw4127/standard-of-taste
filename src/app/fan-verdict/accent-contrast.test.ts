import { describe, it, expect } from "vitest";
import { playerMeta } from "@/content/world-cup/roster";
import { buildCardDesign } from "@/content/world-cup/design";
import { readableOn, contrastRatio, parseColor } from "@/lib/readable-on";

/**
 * E6/S20 — every accent this surface can render, against the ink now chosen
 * for it (PM ruling RT-123a a).
 *
 * WHY THIS EXISTS AND NOT A SPOT CHECK. E6/S19 changed how the primary share
 * button picks its text colour, and `/fan-verdict` is the one caller that
 * passes a VARIABLE accent — one per nation, none of which I had ever looked
 * at. "Correct by construction" is exactly what anyone would have said about
 * the hardcoded white it replaced, which measured 1.83:1 on a live page.
 *
 * So this enumerates every accent the roster can actually produce, rather than
 * sampling: the default, and one per nation in the roster.
 */
function everyAccent(): { label: string; accent: string }[] {
  const out = [{ label: "default (no player)", accent: buildCardDesign({}).palette.accent }];
  const nations = [...new Set(Object.values(playerMeta).map((m) => m.nation))].sort();
  for (const nation of nations) {
    out.push({ label: nation, accent: buildCardDesign({ nation }).palette.accent });
  }
  return out;
}

describe("E6/S20 — fan-verdict accents are readable with the ink S19 picks", () => {
  it("has accents to check at all", () => {
    const all = everyAccent();
    expect(all.length).toBeGreaterThan(3);
    // A roster that stopped varying the accent would make this test vacuous
    // while still passing, which is the failure mode of every sweep.
    expect(new Set(all.map((a) => a.accent)).size).toBeGreaterThan(1);
  });

  it("every accent is a colour readableOn can actually read", () => {
    // The fallback returns white for anything unparseable, which would silently
    // restore the exact defect S19 fixed. If a new palette format appears, this
    // fails rather than quietly shipping 1.83:1 again.
    const unreadable = everyAccent().filter((a) => parseColor(a.accent) === null);
    expect(
      unreadable.map((a) => `${a.label}: ${a.accent}`),
      "these fall back to white without anyone measuring them",
    ).toEqual([]);
  });

  it("every accent clears AA with its chosen ink", () => {
    const failures: string[] = [];
    for (const { label, accent } of everyAccent()) {
      const ink = readableOn(accent);
      const ratio = contrastRatio(ink, accent);
      if (ratio === null || ratio < 4.5) {
        failures.push(`${label} (${accent}) with ${ink}: ${ratio?.toFixed(2) ?? "unparseable"}`);
      }
    }
    expect(failures, failures.join("; ")).toEqual([]);
  });

  it("would have failed on the old hardcoded white", () => {
    // Proven in both directions: the same accents, judged against the colour
    // that used to ship, must NOT pass. A test that only ever sees green is not
    // known to be checking anything.
    const passedOnWhite = everyAccent().filter((a) => (contrastRatio("#fff", a.accent) ?? 0) >= 4.5);
    expect(passedOnWhite.length).toBeLessThan(everyAccent().length);
  });
});

/**
 * E6/S21 — the SECOND hardcoded white on this page, found by sweeping the
 * rendered routes rather than by grepping for a spelling I guessed.
 *
 * S19 fixed `ShareButton`. This page also paints its funnel CTA with
 * `text-white` on the same per-nation accent, and on England's it measured
 * 4.17:1 against a 4.5 bar — a near-miss, which is the kind that survives a
 * glance. Both controls on this page now choose their ink the same way, so
 * this test covers the page rather than one component.
 */
describe("E6/S21 — every control on the page, not just the share button", () => {
  it("the funnel CTA clears AA on every accent too", () => {
    const failures: string[] = [];
    for (const { label, accent } of everyAccent()) {
      const ratio = contrastRatio(readableOn(accent), accent);
      if (ratio === null || ratio < 4.5) failures.push(`${label} ${accent}: ${ratio?.toFixed(2)}`);
    }
    expect(failures, failures.join("; ")).toEqual([]);
  });

  it("pins the near-miss that white produced on the tightest accent", () => {
    // ENG's #e8344e with white is 4.17 — under the bar, and close enough to it
    // that nobody would catch it by eye. The number is recorded so a future
    // change back to white fails loudly instead of looking fine.
    const eng = everyAccent().find((a) => a.accent.toLowerCase() === "#e8344e");
    expect(eng, "ENG accent is no longer in the roster").toBeTruthy();
    expect(contrastRatio("#fff", eng!.accent)!).toBeLessThan(4.5);
    expect(contrastRatio(readableOn(eng!.accent), eng!.accent)!).toBeGreaterThan(4.5);
  });
});
