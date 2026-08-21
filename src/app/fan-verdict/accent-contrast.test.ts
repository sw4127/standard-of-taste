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
