/**
 * EVERY INSTRUMENT THE COMBINED VIEW COUNTS CAN ALSO SEE IT (E19/S7).
 *
 * WHAT WENT WRONG. `acrossLines` counts the Ranking Test as one of the
 * instruments a device can hold, and `dossierLine` names the question it asked.
 * So a listener who ran the Ranking Test and one other instrument saw the
 * combined view on the OTHER instrument's screen — naming this one — and never
 * on the Ranking Test's own reading. The vocabulary layer was taught about the
 * instrument when it shipped in E17; the MOUNT was never added.
 *
 * NOTHING FAILED, AND THAT IS THE INTERESTING PART. A component that is absent
 * renders nothing, produces no string, and appears in no fixture, so every
 * guard this project has — the deck coverage check, the template census, the
 * voice gate — was structurally incapable of seeing it. They all work from what
 * the product SAYS. This one works from what it counts.
 *
 * DERIVED FROM `AcrossInput`, NEVER FROM A TYPED LIST. The roster is the set of
 * result kinds the combined view can be handed, so a fifth instrument added to
 * that type fails here on the day it ships rather than a year later.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { AcrossInput } from "@/content/vocabulary/across";

/**
 * The instrument kinds the combined view counts, as the `own` payload spells
 * them. `thresholds` is plural in the input and "threshold" on the payload;
 * that mapping is the only hand-written thing here and it is one line.
 */
const COUNTED: Array<{ field: keyof AcrossInput; kind: string }> = [
  { field: "bias", kind: "bias" },
  { field: "delicacy", kind: "delicacy" },
  { field: "spread", kind: "spread" },
  { field: "thresholds", kind: "threshold" },
];

/** Windows paths arrive with the other separator; compare on one shape. */
const posix = (path: string) => path.split(String.fromCharCode(92)).join("/");

function sourcesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path));
    else if (name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("the combined view reaches every instrument it counts", () => {
  const files = sourcesUnder("src/app").map((path) => ({ path, text: readFileSync(path, "utf8") }));

  it("found the app sources, so nothing below passes vacuously", () => {
    expect(files.length).toBeGreaterThan(5);
    expect(files.some((f) => f.text.indexOf("AcrossSessions") !== -1)).toBe(true);
  });

  /**
   * COVERAGE IS DERIVED FROM THE ROUTE DIRECTORY, and the two versions before
   * this one are worth the paragraph.
   *
   * The first asked whether some file contained both `AcrossSessions` and the
   * result kind. Removing the mount from the Ranking Test did not fail it: the
   * surviving import line and the expert panel's payload satisfied both halves
   * of a file-wide search. Proximity mistaken for a relationship — the same
   * defect as the thing being guarded.
   *
   * The second read the kind out of the `<AcrossSessions ...>` element itself,
   * which is correct and still wrong here: the Threshold result passes its
   * payload as a VARIABLE, so a real mount looked like a missing one. A guard
   * that cries about a screen which does carry the block teaches everyone to
   * ignore it.
   *
   * So: an instrument is covered when the route directory that serves it
   * mounts the element. That is what "the instrument's own screen" means, it
   * survives a payload being hoisted into a variable, and it would have caught
   * the original defect — nothing under `src/app/spread/` mounted anything.
   * The directory's existence is asserted, so an instrument whose route stops
   * matching its kind fails loudly instead of passing.
   */
  const mounts = (dir: string) =>
    files.some((f) => posix(f.path).startsWith(dir) && f.text.indexOf("<AcrossSessions") !== -1);

  it("mounts on the route that serves each counted instrument", () => {
    const missing: string[] = [];
    for (const { kind } of COUNTED) {
      const dir = `src/app/${kind}`;
      expect(
        files.some((f) => posix(f.path).startsWith(dir)),
        `no route directory ${dir} — this instrument's kind no longer matches its route, and the ` +
          "coverage check below would pass by looking at nothing",
      ).toBe(true);
      if (!mounts(dir)) missing.push(kind);
    }
    expect(
      missing,
      "the combined view counts these instruments and names them in the dossier, but no result " +
        "surface mounts it on their own screen — so it will describe them everywhere except there:",
    ).toEqual([]);
  });

  it("is never handed a kind the layer does not count", () => {
    const known = new Set(COUNTED.map((c) => c.kind));
    const strangers = new Set<string>();
    for (const { text } of files) {
      let at = text.indexOf("<AcrossSessions");
      while (at !== -1) {
        const close = text.indexOf("/>", at);
        const element = close === -1 ? text.slice(at) : text.slice(at, close);
        for (const hit of element.matchAll(/kind: "([a-z]+)"/g)) {
          if (!known.has(hit[1])) strangers.add(hit[1]);
        }
        at = text.indexOf("<AcrossSessions", at + 1);
      }
    }
    expect([...strangers], "these result kinds are handed to a view that cannot count them:").toEqual([]);
  });
});
