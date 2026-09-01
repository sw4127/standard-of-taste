import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXPERT_PANEL } from "./vocabulary/expert";
import { COOLDOWN_DEVICE_NOTE } from "./staircase/copy";

/**
 * E13/S3 (Track G2, RT-G b) — WHEREVER THE PRODUCT CLAIMS TO REMEMBER YOU, IT
 * SAYS WHERE THAT MEMORY LIVES.
 *
 * RT-G ruled device-local history, and the ruling came with an obligation
 * attached: history lives in ONE browser and can vanish, and the product must
 * say so where an arc is shown. This is that obligation, as a test.
 *
 * TWO GUARDS, BECAUSE ONE OF THEM CANNOT SEE THE PROBLEM IT MATTERS MOST FOR.
 *
 *  1. A PER-FILE REQUIRED FACT. E12 established that a file joining a guarded
 *     set is not the same as a file being guarded: `docs/index.html` was added
 *     to a corpus, eighteen tests went green, and the PRE-FIX page passed too,
 *     because its claim matched no pattern and the check had nothing to
 *     compare. So every surface below names the fact IT must state, and the
 *     assertion fails by file name.
 *
 *  2. A DISCOVERY SCAN, because a hand-written list of surfaces is exactly the
 *     kind of guard that goes blind by scope — `retired-gates.test.ts` never
 *     walked the repository root for a month and so could not see the two
 *     files a stranger reads first. Any component that READS the session store
 *     or the cooldown is displaying remembered state; if one appears that this
 *     file has never heard of, the scan fails and the list has to be extended
 *     deliberately rather than by whoever remembers.
 *
 * WHAT THIS CANNOT PROVE: that the sentence is legible, well placed, or in the
 * right voice. The voice deck covers hazards in the copy and `read the rendered
 * output` covers placement. This covers presence.
 */

/** Every group must have at least one member present in the disclosure. */
type Surface = {
  file: string;
  /** What this surface asserts it remembers, in plain terms. */
  claims: string;
  /** The copy actually shown to the person. */
  disclosure: () => string;
  mustSay: string[][];
  /** The braced form the file must render, when the copy lives in a content module. */
  rendersConstant?: string;
};

const SURFACES: Surface[] = [
  {
    file: "src/components/AcrossSessions.tsx",
    claims: "what this device has measured, across more than one instrument",
    // Written inline in the JSX, so the file itself is the copy.
    disclosure: () => readFileSync("src/components/AcrossSessions.tsx", "utf8"),
    mustSay: [["this browser"], ["no accounts", "no account"], ["another device"]],
  },
  {
    file: "src/components/ExpertPanel.tsx",
    claims: "every number and every answer behind the stored session",
    disclosure: () => EXPERT_PANEL.blurb,
    mustSay: [["this browser"], ["share"]],
    // Imported there under a local alias, which is why the assertion is on the
    // BRACED RENDERED FORM and not on the exported name: "EXPERT_PANEL.blurb"
    // appears nowhere in that file, and a guard keyed on it passed nothing and
    // would have failed forever for the wrong reason.
    rendersConstant: "{PANEL.blurb}",
  },
  {
    file: "src/app/threshold/ThresholdFlow.tsx",
    claims: "that this person finished a session of this family within the week",
    disclosure: () => COOLDOWN_DEVICE_NOTE,
    mustSay: [["this browser"], ["no account", "no accounts"], ["cleared", "clearing"]],
    rendersConstant: "{COOLDOWN_DEVICE_NOTE}",
  },
];

/**
 * Reading any of these means the surface is showing something remembered about
 * this person. Writers are not listed: recording a session the person just
 * finished makes no claim about a past they cannot see.
 */
const READ_ACCESSORS = [
  "readResult",
  "readHistory",
  "lastRecordedAt",
  "slotSignature",
  "recallBias",
  "recallDelicacy",
  "recallThreshold",
  "cooldownDaysLeft",
  "cooldownFor",
  "readLastCompleted",
];

/**
 * Components that read remembered state but are deliberately NOT disclosure
 * sites, each with the reason. Empty today, and it should stay hard to add to:
 * the reason has to survive somebody reading it later.
 */
const EXEMPT: Record<string, string> = {};

function componentFiles(): string[] {
  const out: string[] = [];
  for (const root of ["src/app", "src/components"]) {
    for (const entry of readdirSync(root, { recursive: true, encoding: "utf8" })) {
      if (typeof entry !== "string") continue;
      if (!entry.endsWith(".tsx")) continue;
      if (entry.includes(".test.")) continue;
      out.push(`${root}/${entry.split(String.fromCharCode(92)).join("/")}`);
    }
  }
  return out;
}

describe("every surface that claims to remember you says where that memory lives", () => {
  it.each(SURFACES.map((s) => [s.file, s] as const))("%s states the fact itself", (file, surface) => {
    const copy = surface.disclosure().toLowerCase();
    const missing = surface.mustSay
      .filter((group) => !group.some((word) => copy.includes(word.toLowerCase())))
      .map((group) => group.join(" / "));
    expect(
      missing,
      `${file} shows ${surface.claims}, so its disclosure must state: ${missing.join("; ")}`,
    ).toEqual([]);
  });

  /**
   * A CONSTANT THAT EXISTS AND IS NEVER RENDERED PASSES THE TEST ABOVE. Asserted
   * in the BRACED form, never the bare identifier — `.includes("ExpertPanel")`
   * matched "ExpertPanelX" and stayed green while the panel was gone.
   */
  it.each(
    SURFACES.filter((s) => s.rendersConstant).map((s) => [s.file, s.rendersConstant!] as const),
  )("%s actually renders %s", (file, braced) => {
    expect(readFileSync(file, "utf8").includes(braced)).toBe(true);
  });
});

describe("no surface reads remembered state without appearing on that list", () => {
  it("finds every component that reads the session store or the cooldown", () => {
    const known = new Set([...SURFACES.map((s) => s.file), ...Object.keys(EXEMPT)]);
    const undisclosed: string[] = [];

    for (const file of componentFiles()) {
      const source = readFileSync(file, "utf8");
      const reads = READ_ACCESSORS.filter((fn) => source.includes(`${fn}(`));
      if (reads.length === 0) continue;
      if (known.has(file)) continue;
      undisclosed.push(`${file} — reads ${reads.join(", ")}`);
    }

    expect(
      undisclosed,
      "These show something remembered about the person and are not on the disclosure list. " +
        "Add the sentence and list the file, or exempt it with a reason:" +
        String.fromCharCode(10) +
        undisclosed.join(String.fromCharCode(10)),
    ).toEqual([]);
  });

  /** The scan is worthless if it cannot see the files it is meant to walk. */
  it("walks far enough to reach the surfaces already listed", () => {
    const walked = new Set(componentFiles());
    for (const surface of SURFACES) {
      expect(walked.has(surface.file), `the scan never reached ${surface.file}`).toBe(true);
    }
    expect(walked.size).toBeGreaterThan(20);
  });
});
