import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * NO DOCUMENT MAY DESCRIBE A RETIRED GATE AS OUTSTANDING (E8/S10, Track F2).
 *
 * THE DEFECT THIS EXISTS FOR, in the words it actually shipped in:
 *
 *   docs/launch-post-kit.md  "DO NOT POST until launch-checklist item 1 is
 *                             green (pb4/pb8 ear pass, pb6 professional review)"
 *   src/content/bias/items.ts "pb4/pb8 joined after that pass and await the
 *                             same check"
 *
 * Both named the PM ear pass, which was abolished on 2026-08-08. The first sat
 * in the launch kit and the second in a file that SHIPS. A gate nobody performs
 * any more, written as a thing still to be done, is a false statement in the
 * repository (N3) — and worse than an ordinary stale line, because it points
 * whoever reads it at a sign-off they cannot give. The PM asked three times for
 * a map of blueprint-versus-built; documents that lie about their own gates are
 * how that map goes wrong.
 *
 * WHY A TEST AND NOT JUST A FIX. Fixing the two sentences leaves the class open,
 * and this repo has already re-learned that lesson with the rung tables and the
 * damage field. The rule is now enforced, and the enforcement is proved in both
 * directions below — a guard that has only ever returned "clean" is not known to
 * check anything.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: forbid MENTIONING the gates. The repo must
 * be able to say "Layer A replaced the PM ear pass", and the retirement records
 * in `docs/launch-checklist.md` and `docs/ear-pass-delicacy.md` are the point,
 * not a violation. Only the combination of a retired gate AND language that
 * makes it outstanding trips this, and only when nothing nearby says otherwise.
 */

/** Gates abolished by the artifact pivot, 2026-08-07 / 2026-08-08. */
const RETIRED_GATE = /\b(?:pm\s+)?(?:ear[\s-]pass|voice[\s-]pass|ear[\s-]passes)\b/i;

/** Language that makes something an outstanding obligation. */
const OUTSTANDING =
  /\b(?:await|awaits|awaiting|pending|do not post until|blocked on|not yet|outstanding|still needs|sign-?offs?)\b/i;

/**
 * Language that marks the mention as historical. Checked on the line and its
 * neighbours, because a docblock routinely puts the correction one line away
 * from the claim it corrects.
 */
const HISTORICAL =
  /\b(?:retired|abolished|superseded|replaced|replaces|no longer|historical|history|states|corrected|used to|gone|deleted|not a pm|never|former)\b/i;

/**
 * FOUR LINES, NOT TWO, and the widening was forced by a real false positive.
 *
 * `delicacy.test.ts` narrates the pool's four successive states — "blocked
 * pending a PM ear pass", "blocked pending a PM voice pass" — under a comment
 * that says the history IS the point. Those lines are correct and must stay;
 * the sentence exonerating them sat three lines above the first offender, so a
 * two-line window convicted them. A paragraph is the unit in which a docblock
 * corrects itself, so the window is a paragraph.
 */
const CONTEXT_LINES = 4;

const ROOTS = ["docs", "src", "scripts"];
const EXTENSIONS = [".md", ".ts", ".tsx", ".mjs"];
/**
 * Handoffs are dated records of what was true that day; they are not claims
 * about now. THIS FILE is skipped too, and not as a convenience: it has to
 * quote the offending sentences verbatim to prove it catches them, so a guard
 * that scanned itself would convict its own evidence.
 */
const SKIP = /handoff-\d{4}-\d{2}-\d{2}|retired-gates\.test\.ts|[/\\]node_modules[/\\]|\.next[/\\]/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (SKIP.test(path)) continue;
    if (statSync(path).isDirectory()) walk(path, out);
    else if (EXTENSIONS.some((e) => path.endsWith(e))) out.push(path);
  }
  return out;
}

interface Offence {
  path: string;
  line: number;
  text: string;
}

/** Exported so the reverse proof runs the SAME rule the forward test does. */
export function findStaleGateClaims(text: string, path = "<inline>"): Offence[] {
  const lines = text.split("\n");
  const out: Offence[] = [];
  lines.forEach((line, i) => {
    if (!RETIRED_GATE.test(line) || !OUTSTANDING.test(line)) return;
    const context = lines.slice(Math.max(0, i - CONTEXT_LINES), i + CONTEXT_LINES + 1).join(" ");
    if (HISTORICAL.test(context)) return;
    out.push({ path, line: i + 1, text: line.trim() });
  });
  return out;
}

describe("no retired gate is described as outstanding", () => {
  const files = ROOTS.flatMap((r) => walk(r));

  it("scans a real corpus, not an empty one", () => {
    expect(files.length).toBeGreaterThan(100);
    // The rule can only bind if the corpus actually contains the phrases.
    const mentions = files.filter((f) => RETIRED_GATE.test(readFileSync(f, "utf8")));
    expect(mentions.length).toBeGreaterThan(3);
  });

  it("finds none anywhere in docs, src or scripts", () => {
    const offences = files.flatMap((f) => findStaleGateClaims(readFileSync(f, "utf8"), f));
    expect(
      offences.map((o) => `${o.path}:${o.line}  ${o.text}`),
      "These describe a gate abolished on 2026-08-08 as if it were still owed. " +
        "Either the sentence is wrong, or the gate came back and this test should be updated deliberately.",
    ).toEqual([]);
  });

  /**
   * PROVEN IN BOTH DIRECTIONS, on the exact specimens that motivated it. A gate
   * that cannot catch the line it was written for is decoration — the same
   * argument `voice.test.ts` makes about the paid-tier guard.
   */
  it("catches the two sentences that shipped", () => {
    const kit =
      "**Gate: DO NOT POST until launch-checklist item 1 is green (pb4/pb8 ear pass, pb6 professional review).**";
    const items =
      " * PM ear pass of record: manifest.pmEarPass (no veto, 2026-07-12); pb4/pb8 joined after that pass and await the same check.";
    expect(findStaleGateClaims(kit)).toHaveLength(1);
    expect(findStaleGateClaims(items)).toHaveLength(1);
  });

  it("catches a sequencing step that asks for the sign-off", () => {
    expect(findStaleGateClaims("1. PM sign-offs (pb4/pb8/pb6) → checklist item 1 green.")).toHaveLength(0);
    // …but naming the gate in the same breath does trip it.
    expect(findStaleGateClaims("1. PM ear pass sign-offs (pb4/pb8) → checklist item 1 green.")).toHaveLength(1);
  });

  /** It must not fire on the sentences the repo needs to be able to write. */
  it.each([
    "This is the computed verdict that REPLACES the PM ear pass.",
    "Layer A replaced the PM ear pass — a gate only one person can discharge.",
    "a recorded PM ear pass no longer grants passage on its own",
    "The PM ear pass was retired; nothing is pending on it.",
    "PM ear pass and PM voice pass are not outstanding — they were ABOLISHED.",
  ])("stays quiet on a legitimate mention: %s", (line) => {
    expect(findStaleGateClaims(line)).toEqual([]);
  });

  /**
   * A SIGN-OFF THE MANIFEST RECORDS AS DONE MAY NOT BE DESCRIBED AS PENDING
   * (E8/S11).
   *
   * pb6's professional review was obtained and WRITTEN DOWN on 2026-07-12, in
   * `manifest.json` — the file `items.ts` names as its own authority. The
   * docblock in that derived file nevertheless said "pb6 is PROVISIONAL
   * (professional reviewer pending)" for months, and the PM had to say more
   * than once that the review existed before anyone checked the manifest.
   *
   * That is the two-tables defect pointing the expensive way: a derived comment
   * inventing an obligation its source says is discharged. The cost is not a
   * wrong string — it is a person being asked repeatedly for something they
   * already gave.
   *
   * So the manifest is the assertion, and the prose is checked against it.
   */
  it("pb6's professional review is recorded in the manifest, and no file calls it pending", () => {
    const manifest = readFileSync("src/content/bias/manifest.json", "utf8");
    expect(manifest).toContain("pb6 passed the professional review");

    const claimsPending = files.filter((f) => {
      const text = readFileSync(f, "utf8");
      return /pb6[^.\n]{0,80}(?:provisional|reviewer pending|review pending|awaits? .{0,20}review)/i.test(text);
    });
    expect(
      claimsPending,
      "These call pb6's professional review outstanding; the manifest records it as passed on 2026-07-12.",
    ).toEqual([]);
  });

  /** The correction two lines up must exonerate the line, not just the same line. */
  it("reads the surrounding lines, not only the offending one", () => {
    const withContext = [
      " * THE PM EAR PASS IS RETIRED (2026-08-08).",
      " *",
      " * pb4/pb8 joined after that pass and await the same check.",
    ].join("\n");
    expect(findStaleGateClaims(withContext)).toEqual([]);
  });
});
