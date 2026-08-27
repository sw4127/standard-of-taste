import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { MACHINES } from "@/components/OtherMachines";

/**
 * E10/S2 (Track F3) — THE MACHINE CARD IS WRITTEN IN ONE PLACE.
 *
 * `/learn` hand-wrote a second copy of the reveal's card. Both rendered
 * correctly, so nothing was visibly wrong — and that is the point: the copy
 * carried its own inline tint expression, which is why fixing `tint` in E10/S1
 * meant hunting a third site. It was found. The next one might not be.
 *
 * This checks the same rule in both directions as S1's guard:
 *   1. the card's distinguishing markup appears in exactly one source file, and
 *   2. the needle it searches for genuinely matches the duplicate as it stood.
 *
 * WHAT THIS CANNOT PROVE: that the two rendered surfaces are byte-identical to
 * what they emitted before the extraction. That was verified by reading the
 * rendered DOM on both (`/learn` and a threshold reveal) and diffing against a
 * baseline captured before the change. There is no automated substitute here —
 * this repository has no DOM renderer in its test environment.
 */

const CARD = "src/components/MachineCard.tsx";

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
 * The card's signature.
 *
 * The first attempt was `rounded-2xl border p-5`, and running it found five
 * other files — a feedback box in the Prestige flow, one in the Delicacy flow,
 * a section of the premium report, and the two selectable machine GRIDS
 * (`GymFloor`, `/threshold`). None of those is this card; they share generic
 * chrome. A guard that flags five innocents gets deleted by the third person
 * who trips over it, so the needle is the discriminating part instead: this
 * card is the only element in the product with a `hover:bg-white/[0.05]`
 * background lift, which is what makes it a link-card rather than a button or
 * a panel.
 */
const SIGNATURE = "transition hover:bg-" + "white/[0.05]";

describe("the machine card exists in exactly one place", () => {
  it("the needle matches the duplicate as it actually stood", () => {
    /*
     * Non-circular, same discipline as E10/S1: the fixture is the `/learn`
     * block from commit b4b8e1b, byte-for-byte, in a .txt the sweep cannot see.
     * If someone narrows the signature until it stops matching real
     * duplicates, this goes red before the sweep starts passing vacuously.
     */
    const asItWas = readFileSync("src/components/__fixtures__/machine-card-before-e10s2.txt", "utf8");
    expect(asItWas, "the fixture lost its sample").toContain("font-display");
    expect(
      asItWas.includes(SIGNATURE),
      "the needle no longer matches the duplicate this guard exists to catch",
    ).toBe(true);
    // And it does not fire on the generic card chrome used all over the product.
    expect(`className="rounded-2xl border border-white/10 p-4"`.includes(SIGNATURE)).toBe(false);
    expect(`className="mt-7 rounded-2xl border p-5"`.includes(SIGNATURE)).toBe(false);
  });

  it("only MachineCard.tsx carries the card markup", () => {
    const files = tsFiles("src");
    expect(files.length, "found no source files, so this sweep proves nothing").toBeGreaterThan(100);
    const carriers = files.filter((f) => readFileSync(f, "utf8").includes(SIGNATURE)).map(posix);
    expect(
      carriers,
      "These files hand-write the machine card instead of rendering <MachineCard>. " +
        "Both copies will render, and the next fix to the card will reach only some " +
        "of them:\n" + carriers.join("\n"),
    ).toEqual([CARD]);
  });

  it("both consumers render the shared card", () => {
    for (const f of ["src/components/OtherMachines.tsx", "src/app/learn/page.tsx"]) {
      expect(readFileSync(f, "utf8"), `${f} no longer renders <MachineCard>`).toMatch(
        /<MachineCard\b/,
      );
    }
  });
});

describe("the size variants stay declared, not invented", () => {
  const source = readFileSync(CARD, "utf8");

  it("every size the card accepts has both a title size and an anchor rule", () => {
    // The union type, read off the source rather than restated here.
    const union = source.match(/export type MachineCardSize =([^;]+);/);
    expect(union, "MachineCardSize is gone; this test no longer guards anything").not.toBeNull();
    const sizes = [...union![1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
    expect(sizes.length, "expected at least two named variants").toBeGreaterThan(1);
    for (const s of sizes) {
      expect(
        new RegExp(`\\b${s}:`).test(source.split("TITLE_SIZE")[1] ?? ""),
        `size "${s}" has no entry in TITLE_SIZE or ANCHOR_EXTRA`,
      ).toBe(true);
    }
  });

  it("every consumer asks for a size that exists", () => {
    const union = source.match(/export type MachineCardSize =([^;]+);/)![1];
    const sizes = new Set([...union.matchAll(/"([a-z]+)"/g)].map((m) => m[1]));
    const used = tsFiles("src")
      .flatMap((f) => [...readFileSync(f, "utf8").matchAll(/size="([a-z]+)"/g)].map((m) => m[1]));
    expect(used.length, "no consumer passes a size, so this proves nothing").toBeGreaterThan(0);
    for (const u of used) {
      expect(sizes.has(u), `a consumer asks for size="${u}", which is not a declared variant`).toBe(
        true,
      );
    }
  });
});

describe("the card still describes real machines", () => {
  it("every live machine has the fields the card renders", () => {
    const live = MACHINES.filter((m) => m.live);
    expect(live.length, "no machine is live, so no card renders").toBeGreaterThan(0);
    for (const m of live) {
      expect(m.title.length, `${m.id} has no title`).toBeGreaterThan(0);
      expect(m.line.length, `${m.id} has no descriptive line`).toBeGreaterThan(0);
      expect(m.href.startsWith("/"), `${m.id} has a non-local href`).toBe(true);
    }
  });
});
