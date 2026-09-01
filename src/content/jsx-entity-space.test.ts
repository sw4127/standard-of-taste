import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A SPACE AFTER AN INLINE TAG DISAPPEARS WHEN THE TEXT BESIDE IT CONTAINS AN
 * HTML ENTITY (E14, 2026-09-02).
 *
 * WHAT WAS SHIPPING. Five public pages rendered two words fused together —
 * "yourblind ratings", "thatis a true judge", "entertainmentproduct",
 * "practiceits material". Eleven instances, on the reading room and on /legal,
 * for an unknown length of time. Nothing caught them: the source is correct,
 * `get_page_text` collapses the difference away, and every test in this repo
 * reads strings rather than rendered markup.
 *
 * THE MECHANISM, CHARACTERISED RATHER THAN GUESSED. The first theory was the
 * ordinary JSX whitespace rule — a closing tag at the end of a line. That
 * theory is WRONG, and a guard built on it would have matched almost none of
 * the real instances. Measured by rendering controlled variants and reading the
 * server's own HTML:
 *
 *   cleared of prejudice — <em>that</em> is a true judge. The Taste Gyms.     -> space KEPT
 *   cleared of prejudice — <em>that</em> is a true judge. The Taste Gym&apos;s. -> space LOST
 *
 * One character apart, same line, same tag. The trigger is the ENTITY: a JSX
 * text node that follows an element and contains an HTML entity loses its
 * LEADING space. Line breaks have nothing to do with it — the same pair
 * reproduces with the tail on one line or wrapped across two.
 *
 * SO THE NEEDLE IS THE MECHANISM, not a proxy for it: a closing inline tag,
 * then whitespace, then text up to the next tag or expression that contains an
 * `&`. Validated the only way a discovery guard can be — it was run against the
 * repository BEFORE the fix and returned exactly the eleven instances an
 * independent detector had already found in the running DOM, then run again
 * after and returned none.
 *
 * THE FIX IS `{" "}` immediately after the closing tag. That makes the space a
 * separate child rather than the leading character of the entity-bearing text
 * node, and the codebase already used the idiom in one place.
 *
 * WHAT THIS CANNOT SEE: a space lost for any other reason, and any file outside
 * `src`. It proves the absence of THIS defect, not of fused words in general.
 */

/** Inline elements whose trailing space is at risk. */
const INLINE = ["em", "strong", "a", "Link", "code", "b", "i"];

interface Hit {
  file: string;
  text: string;
}

export function entitySpaceHits(): Hit[] {
  const pattern = new RegExp("</(?:" + INLINE.join("|") + ")>([^<{]*)", "g");
  const hits: Hit[] = [];
  for (const entry of readdirSync("src", { recursive: true, encoding: "utf8" })) {
    if (typeof entry !== "string" || !entry.endsWith(".tsx")) continue;
    if (entry.includes(".test.")) continue;
    const file = "src/" + entry.split(String.fromCharCode(92)).join("/");
    const source = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(source)) !== null) {
      const tail = m[1];
      // The leading space is the one that vanishes; without one there is
      // nothing to lose.
      if (!/^[ \t]/.test(tail)) continue;
      if (!tail.includes("&")) continue;
      hits.push({ file, text: tail.replace(/\s+/g, " ").slice(0, 60) });
    }
  }
  return hits;
}

describe("a space next to an entity does not silently vanish from the rendered page", () => {
  it("finds no inline tag followed by a space and entity-bearing text", () => {
    const hits = entitySpaceHits();
    expect(
      hits.map((h) => `${h.file} ::${h.text}`),
      "These render as two words fused together. Put {\" \"} after the closing tag:" +
        String.fromCharCode(10) +
        hits.map((h) => `${h.file} ::${h.text}`).join(String.fromCharCode(10)),
    ).toEqual([]);
  });

  /**
   * A NEEDLE THAT MATCHES NOTHING IS INDISTINGUISHABLE FROM A BROKEN ONE, and
   * this needle's whole job is to match nothing. So it is pointed at the exact
   * pair of strings the mechanism was characterised with — one that renders
   * correctly and one that does not.
   */
  it("fires on the shape that loses the space, and not on the shape that keeps it", () => {
    const pattern = new RegExp("</(?:" + INLINE.join("|") + ")>([^<{]*)", "g");
    const fires = (src: string) => {
      pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(src)) !== null) {
        if (/^[ \t]/.test(m[1]) && m[1].includes("&")) return true;
      }
      return false;
    };
    // Measured: this one renders "thatis a true judge".
    expect(fires("prejudice — <em>that</em> is a true judge. The Taste Gym&apos;s method.")).toBe(true);
    // Measured: this one renders correctly. One character apart.
    expect(fires("prejudice — <em>that</em> is a true judge. The Taste Gyms method.")).toBe(false);
    // The repaired form, which is what every fix in this repo looks like.
    expect(fires('prejudice — <em>that</em>{" "}is a true judge. The Taste Gym&apos;s method.')).toBe(false);
  });
});
