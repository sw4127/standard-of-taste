import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * BOTH SURFACES MOUNT THE READING, OR THE BUILD STOPS.
 *
 * The creator-translation block was written for the share page in E8/S8 and was
 * missing from the reveal screen a person actually finishes on until E8/S12
 * found it — the same data, absent from the one place most people would ever
 * see it. Sharing one component makes the two renders identical; it does not
 * stop somebody deleting one of the two mount points.
 *
 * A SOURCE SCAN IS THE WEAKEST KIND OF GUARD and this one is written knowing
 * it. It asserts it FOUND the files and FOUND a mount in each, because a scan
 * that matches nothing passes by having nothing to look at — which is exactly
 * how two guards written in E15 stayed green while guarding nothing. It also
 * requires the mount to carry its props, so an import left behind after the
 * element was deleted cannot satisfy it.
 */
const SURFACES = [
  "src/app/bias/BiasFlow.tsx",
  "src/app/bias/result/page.tsx",
];

describe("the comparison reading is mounted on every prestige surface", () => {
  it("appears, with its props, in each of them", () => {
    expect(SURFACES.length).toBeGreaterThan(1);
    for (const path of SURFACES) {
      const source = readFileSync(path, "utf8");
      expect(source.length, path).toBeGreaterThan(0);

      // The element, not merely the import: an import survives deletion of the
      // element it was for. Whitespace-collapsed, because the two call sites
      // are wrapped differently by the formatter.
      const flat = source.replace(/\s+/g, " ");
      const mount = flat.match(/<ComparisonReading [^>]*\/>/);
      expect(mount, `${path}: no mount found`).not.toBeNull();
      expect(mount![0], path).toContain("accent=");
      expect(mount![0], path).toContain("blind=");
      expect(mount![0], path).toContain("labeled=");
    }
  });
});
