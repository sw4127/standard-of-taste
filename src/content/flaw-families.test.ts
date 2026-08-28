import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";
import { STAIRCASE_FAMILIES, familyUnit } from "@/engine/staircase-manifest";
import { FAMILY_LABEL } from "@/content/staircase/copy";
import { MEASURED_TRIALS } from "@/content/delicacy/items";
import { MACHINES } from "@/components/OtherMachines";
import { flawFamilies, flawFamilyList, FLAWS_INTRO, FLAWS_LIMITS } from "./flaw-families";
import { LEARN_PAGES, learnPage } from "./learn";

/**
 * E11/S1 (Track B) — THE PRODUCT TESTS THREE FLAW FAMILIES, AND FOUR PLACES
 * SAID FOUR.
 *
 * This guard checks two different things, and the split matters:
 *
 *   1. COMPLETENESS — the creator-facing registry covers exactly the families
 *      the engine has, in both directions. `tsc` already enforces this through
 *      `Record<DegradationFamily, …>`, but a green test run is not a green
 *      build (E10 finding 6) and this file is what runs on every commit.
 *
 *   2. ABSENCE — no source file names a degradation the pipeline cannot
 *      render. This one is narrow and I would rather say so than let a future
 *      session assume it is broad: it catches ONE phrase, the one this slice
 *      removed. It cannot tell you that a page has invented a different flaw,
 *      because "a family that does not exist" has no general surface form.
 *      What it does buy is that this specific claim cannot come back, which is
 *      exactly what was needed — it had already come back four times.
 */

/** Every `.ts`/`.tsx` under `src/`, tests included. No exceptions list. */
function tsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) tsFiles(p, out);
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

const posix = (p: string) => p.split(sep).join("/");

/**
 * A line break, built rather than escaped.
 *
 * Two attempts to script this file into place turned a backslash-n escape
 * into a real line break and produced an unterminated string — the same
 * class of accident as the literal ${line} that scripted insertion wrote
 * into fifteen files in E10. The escape that keeps going wrong is simply not
 * used, exactly as `voice.ts` stopped using word boundaries for it.
 */
const NEWLINE = String.fromCharCode(10);

describe("the creator registry covers exactly the families that exist", () => {
  it("every engine family is assembled, and nothing else is", () => {
    const assembled = flawFamilies().map((f) => f.family);
    // Both directions in one equality: a missing family fails, and an invented
    // one fails too. An `every`-style check would only ever catch the first.
    expect(assembled).toEqual([...DEGRADATION_FAMILIES]);
  });

  it("every family has a name, so none can render as a raw slug", () => {
    /*
     * `FAMILY_LABEL` is typed `Record<string, string>` and `familyLabel` falls
     * back to the key, so a family added to the engine renders "pitch-drift" at
     * a person instead of failing. Tightening that type would need casts at
     * four call sites and is not this slice's job; asserting the same property
     * here costs one line and closes the same hole.
     */
    const missing = DEGRADATION_FAMILIES.filter((f) => !FAMILY_LABEL[f]);
    expect(missing, `families with no display name: ${missing.join(", ")}`).toEqual([]);
  });

  it("both creator sentences are present and are not each other", () => {
    for (const f of flawFamilies()) {
      expect(f.symptom.length, `${f.family} symptom`).toBeGreaterThan(20);
      expect(f.mechanism.length, `${f.family} mechanism`).toBeGreaterThan(20);
      expect(f.symptom).not.toBe(f.mechanism);
    }
  });
});

describe("everything except the two sentences is derived", () => {
  it("the unit comes from the rendered manifest, not from this file", () => {
    for (const f of flawFamilies()) {
      expect(f.fullUnit, `${f.family} full unit`).toBe(familyUnit(f.family));
      expect(f.unit, `${f.family} short unit`).toBe(familyUnit(f.family).split(" ")[0]);
      expect(f.unit.length).toBeGreaterThan(0);
    }
  });

  /**
   * THE CLAIM "THIS MACHINE TESTS THIS FLAW" IS READ OFF THE SHIPPED POOLS.
   *
   * Asserted against the pools independently here rather than against
   * `machinesFor`, which would only prove the function agrees with itself.
   */
  it("each family names the machines whose pool actually contains it", () => {
    const inDelicacy = new Set(MEASURED_TRIALS.map((t) => t.family));
    for (const f of flawFamilies()) {
      const expected: string[] = [];
      if (inDelicacy.has(f.family)) expected.push("delicacy");
      if (STAIRCASE_FAMILIES.includes(f.family)) expected.push("threshold");
      expect(f.machines, `${f.family}`).toEqual(expected);
      expect(f.machines.length, `${f.family} is tested by no machine`).toBeGreaterThan(0);
    }
  });

  it("every machine id it names is a real machine", () => {
    const ids = new Set(MACHINES.map((m) => m.id));
    for (const f of flawFamilies()) {
      for (const id of f.machines) expect(ids.has(id), `${id} is not in MACHINES`).toBe(true);
    }
  });

  /**
   * THE PRESTIGE TEST MEASURES NONE OF THESE, AND THAT IS A FACT, NOT AN
   * OVERSIGHT.
   *
   * `MachineId` includes "bias" because the id set is `OtherMachines`', and
   * narrowing it would fork a second vocabulary of machine ids for one call
   * site. But a type wider than its domain is how `Machine.field` sat fully
   * populated and read by nothing (E10 finding 8), so the narrowing that is
   * NOT in the type is asserted here instead: the Prestige Test damages no
   * audio, it relabels it, so it can never appear beside a flaw family.
   */
  it("never claims the Prestige Test measures a flaw family", () => {
    for (const f of flawFamilies()) {
      expect(f.machines, `${f.family}`).not.toContain("bias");
    }
  });

  it("the prose list names every family and joins them readably", () => {
    const list = flawFamilyList();
    for (const f of DEGRADATION_FAMILIES) {
      expect(list, `${f} missing from the prose list`).toContain(FAMILY_LABEL[f].toLowerCase());
    }
    expect(list).toContain(" and ");
    expect(list.split(",").length).toBe(DEGRADATION_FAMILIES.length - 1);
  });
});

describe("the fourth family that never existed cannot come back", () => {
  /*
   * ASSEMBLED FROM HALVES so this file does not match its own sweep. The
   * fixture form is better where it works (E10 finding 4), and it is used
   * below for the sample — but the NEEDLE has to live in the test, and a
   * needle read from the fixture would prove only that the fixture contains
   * itself.
   */
  const PHANTOM = "wrong" + " note";

  it("appears in no source file, with no exceptions", () => {
    const offenders = tsFiles("src")
      .filter((p) => readFileSync(p, "utf8").toLowerCase().includes(PHANTOM))
      .map(posix);
    expect(
      offenders,
      "these files name a degradation family the pipeline has never rendered:\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });

  /**
   * THE SWEEP ABOVE CATCHES ONE PHRASE. THIS CATCHES THE HABIT.
   *
   * Red-teaming S1 against itself: a guard for the literal words the defect
   * happened to use is not a guard against the defect, which was "somebody
   * hand-typed the list of families into a sentence". Written differently
   * tomorrow — "an out-of-key note", "a bad chord" — the phrase sweep says
   * clean, exactly as `tint`'s sweep said clean past four copies written with
   * `slice` instead of a regex (E10 finding 1).
   *
   * So the rule is stated by what a line DOES rather than by how it is
   * spelled: any single line naming two or more families is enumerating them,
   * and enumerating them is `flawFamilyList()`'s job. A hand-typed list can be
   * correct on the day it is written — the FAQ's was not, but it could have
   * been — and then rot silently, which is the failure this actually needs
   * stopping.
   *
   * It caught its own author immediately: the helper's doc comment spelled the
   * example output out, and that line had to go.
   */
  it("no source line hand-types two or more family names", () => {
    const names = DEGRADATION_FAMILIES.map((f) => FAMILY_LABEL[f].toLowerCase());
    const offenders: string[] = [];
    for (const p of tsFiles("src")) {
      readFileSync(p, "utf8")
        .split(NEWLINE)
        .forEach((line, i) => {
          const low = line.toLowerCase();
          if (names.filter((n) => low.includes(n)).length >= 2) {
            offenders.push(`${posix(p)}:${i + 1}: ${line.trim().slice(0, 120)}`);
          }
        });
    }
    expect(
      offenders,
      "these lines enumerate the flaw families by hand instead of calling " +
        "flawFamilyList(), so they will not follow the engine:" + NEWLINE + offenders.join(NEWLINE),
    ).toEqual([]);
  });

  it("that enumeration guard fires on a hand-typed list", () => {
    // Assembled at runtime so this line does not trip the sweep it is testing.
    const names = DEGRADATION_FAMILIES.map((f) => FAMILY_LABEL[f].toLowerCase());
    const handTyped = `degradations - ${names.join(", ")} - and you identify the original`;
    expect(names.filter((n) => handTyped.toLowerCase().includes(n)).length).toBeGreaterThanOrEqual(2);
  });

  it("the needle detects the real defect, as it really was", () => {
    /*
     * NON-CIRCULAR: this reads the four sites as they stood at d740cde,
     * byte-for-byte, from a fixture the sweep cannot see (it scans .ts/.tsx).
     * If the needle ever stops matching what it was written for, this goes red
     * — which is the failure mode of every guard in this repository that only
     * ever said "clean".
     */
    const before = readFileSync("src/content/__fixtures__/phantom-family-before-e11s1.txt", "utf8");
    const hits = before.split("\n").filter((l) => l.toLowerCase().includes(PHANTOM));
    expect(
      hits.length,
      "the needle no longer matches the four sites this guard exists to catch:\n" + before,
    ).toBe(4);
  });

  it("the two live surfaces now name the three real families instead", () => {
    /*
     * The FAQ answer and the explainer paragraph are where two of the four
     * sites were. Both now interpolate the derived list, so this asserts the
     * replacement is really in the shipped strings and not merely that the old
     * words are gone — a file can satisfy an absence check by saying nothing.
     */
    const faq = readFileSync("src/content/learn.ts", "utf8");
    const explainer = readFileSync("src/app/learn/delicacy/page.tsx", "utf8");
    expect(faq).toContain("${FAMILY_LIST}");
    expect(explainer).toContain("{flawFamilyList()}");
    expect(flawFamilies().length).toBe(3);
  });
});

describe("the reference page is built from the registry, not typed", () => {
  const SRC = "src/app/learn/flaws/page.tsx";

  it("is registered in the reading room, so the index, sitemap and JSON-LD carry it", () => {
    const entry = learnPage("flaws");
    expect(entry, "the /learn/flaws registry entry is missing").toBeDefined();
    expect(LEARN_PAGES.map((p) => p.slug)).toContain("flaws");
    expect(entry!.teaser.length).toBeGreaterThan(20);
    expect(entry!.description.length).toBeGreaterThan(40);
  });

  /**
   * THE POINT OF THE WHOLE SLICE, ASSERTED. A reference page is the worst
   * place in the product to hand-type a family list, because it is the page a
   * reader would trust. This fails if the page ever stops mapping over the
   * registry, or starts naming a family in its own words.
   */
  it("renders the families by mapping the registry", () => {
    const src = readFileSync(SRC, "utf8");
    expect(src, "the page no longer maps over flawFamilies()").toContain("flawFamilies()");
    expect(src).toContain("families.map(");
    // No family is spelled out in the page's own source.
    const typed = flawFamilies()
      .map((f) => f.label)
      .filter((label) => src.includes(label));
    expect(typed, `these family names are hand-typed into ${SRC}`).toEqual([]);
  });

  it("shows the unit and the machines from the registry, not from prose", () => {
    const src = readFileSync(SRC, "utf8");
    expect(src).toContain("{f.unit}");
    expect(src).toContain("{f.fullUnit}");
    expect(src).toContain("machineLinks(f.machines)");
    for (const f of flawFamilies()) {
      expect(src, `${f.unit} is hand-typed into the page`).not.toContain(`>${f.unit}<`);
    }
    /*
     * The unit expansion must not repeat the unit. `lossy-artifact` has
     * fullUnit === unit ("kbps"), and the first version of this page shipped
     * "Measured in kbps (kbps)" — found by reading the built HTML, not by any
     * test. This asserts the branch that stops it exists at all.
     */
    expect(src, "the unit expansion is unconditional and will repeat itself").toContain(
      "f.fullUnit === f.unit",
    );
    expect(
      flawFamilies().some((f) => f.fullUnit === f.unit),
      "no family exercises the equal-unit branch any more; if that is deliberate, delete the branch",
    ).toBe(true);
  });

  /**
   * THE HONESTY BLOCK IS NOT OPTIONAL (N3). Three named flaws read as "the
   * flaws" unless the page says otherwise, and the sentence that says
   * otherwise is the one a later tidy-up would cut as filler.
   */
  /*
   * THE FIRST VERSION OF THIS SEARCHED FOR THE BARE NAME AND STAYED GREEN
   * WHILE THE BLOCK WAS DELETED — the import line still contained it. That is
   * the third needle in this session to match a part of the file that was not
   * the point (E10 finding 1, and twice more in E11/S2). It asserts the
   * BRACED form, which exists only where the value is actually rendered.
   */
  it("states that three is what we can measure, not what exists", () => {
    const src = readFileSync(SRC, "utf8");
    expect(src, "the N3 limits block is not rendered").toContain("{FLAWS_LIMITS}");
    expect(src, "the intro is not rendered").toContain("{FLAWS_INTRO}");
    expect(FLAWS_LIMITS.toLowerCase()).toContain("not a list of everything");
    expect(FLAWS_INTRO.length).toBeGreaterThan(60);
  });

  /**
   * NO CAUSAL PROMISE, ANYWHERE ON THE PAGE (blueprint hard lines: "no causal
   * promise that training improves anyone's output"). The creator framing is
   * exactly where that promise would be tempting to make.
   */
  it("promises nothing about the reader's own output", () => {
    const strings = [FLAWS_INTRO, FLAWS_LIMITS, ...learnPage("flaws")!.faq.flatMap((f) => [f.q, f.a])];
    const PROMISES = [
      "will improve your",
      "makes your tracks",
      "fix your mix",
      "better renders",
      "will catch them in your",
    ];
    const found = strings.flatMap((t) =>
      PROMISES.filter((p) => t.toLowerCase().includes(p)).map((p) => `${p} — ${t.slice(0, 70)}`),
    );
    expect(found).toEqual([]);
  });
});
