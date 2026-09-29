/**
 * THE CHINESE BLUEPRINT IS THE ENGLISH ONE, STATEMENT FOR STATEMENT (bilingual Part 3, 2026-09-29).
 *
 * `docs/blueprint.zh.md` holds the most exposed sentences on the Chinese site,
 * and a translation is the easiest thing in a repository to leave behind when
 * its source moves. So:
 *
 * 1. SAME IDS, SAME ORDER. A statement added to or dropped from the English
 *    fails here until the Chinese follows.
 * 2. THE HASH. The Chinese header records the English file's sha256, computed
 *    over LF line endings so a Windows checkout and a Linux build agree. Any
 *    edit to the English fails this test until the Chinese is revised and the
 *    new hash recorded, which is the moment somebody reads both.
 * 3. IT AGREES WITH ITSELF, as the English must: the conclusion is the insight,
 *    and the third premise is the second challenged assumption's rejection.
 * 4. EVERY PREMISE SHOWS ITS LABEL, in the Chinese wording (N3).
 *
 * WHAT IT CANNOT DO: tell whether the Chinese says what the English says. That
 * is the owner's writing pass, and the file says it is a draft until then.
 * Serves BP-GOAL and BA-12; N3.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BLUEPRINT_PATH, BLUEPRINT_ZH_PATH, captionZh, labelTextZh, loadBlueprint, parseBlueprint } from "./blueprint";

const lf = (s: string) => s.replace(/\r\n/g, "\n");

/** The sha256 of a file's text over LF endings. */
export function sourceHash(path: string): string {
  return createHash("sha256").update(lf(readFileSync(path, "utf8")), "utf8").digest("hex");
}

/** The hash a translation's header records for its source, or null. */
export function recordedHash(translation: string, source: string): string | null {
  const m = new RegExp(`EN-SOURCE ${source.replace(/[.]/g, "\\.")} sha256:([0-9a-f]{64})`).exec(translation);
  return m?.[1] ?? null;
}

const en = loadBlueprint(BLUEPRINT_PATH);
const zhText = readFileSync(BLUEPRINT_ZH_PATH, "utf8");
const zh = parseBlueprint(zhText);

describe("the Chinese blueprint matches the English one", () => {
  it("holds the same statements, in the same order", () => {
    expect(zh.statements.map((s) => s.id)).toEqual(en.statements.map((s) => s.id));
    expect(zh.statements.length).toBeGreaterThanOrEqual(23);
  });

  it("records the English file's current hash, so an English edit fails until the Chinese follows", () => {
    const recorded = recordedHash(zhText, BLUEPRINT_PATH);
    expect(recorded, "the Chinese header records no EN-SOURCE hash").not.toBeNull();
    expect(recorded, `${BLUEPRINT_PATH} changed: revise ${BLUEPRINT_ZH_PATH}, then record ${sourceHash(BLUEPRINT_PATH)}`).toBe(
      sourceHash(BLUEPRINT_PATH),
    );
  });

  it("says its text is a translation and the English governs", () => {
    expect(zhText).toContain("中文为译本，以英文原文为准");
  });

  it("is written in Chinese, statement by statement", () => {
    const untranslated = zh.statements.filter((s) => !/[一-鿿]/.test(s.text)).map((s) => s.id);
    expect(untranslated).toEqual([]);
  });
});

describe("the Chinese blueprint agrees with itself", () => {
  it("concludes exactly the insight (BP-ARG-C = BP-INSIGHT)", () => {
    expect(zh.BP["BP-ARG-C"]).toBe(zh.BP["BP-INSIGHT"]);
  });

  it("uses the second challenged assumption's rejection as its third premise", () => {
    const rejected = zh.BP["BP-CA2"]?.split("否定：")[1];
    expect(rejected, "BP-CA2 has no 否定： clause").toBeTruthy();
    expect(zh.BP["BP-ARG-P3"]).toBe(rejected);
  });

  it("shows every premise's label in its Chinese wording, and the same label as the English", () => {
    const zhLabel = (id: string) => labelTextZh(zh.statements.find((s) => s.id === id)!);
    const premises = en.statements.filter((s) => /^BP-ARG-(P\d|S\d|C)$/.test(s.id));
    expect(premises.filter((s) => !zhLabel(s.id)).map((s) => s.id)).toEqual([]);
    // The English label inside the Chinese brackets is the English note's label.
    expect(premises.filter((s) => !zhLabel(s.id)!.includes(`（${s.label}）`)).map((s) => s.id)).toEqual([]);
  });

  it("captions a premise with its label and its published source, and never an internal reference", () => {
    const p1 = zh.statements.find((s) => s.id === "BP-ARG-P1")!;
    expect(captionZh(p1)).toMatch(/^有依据（EVIDENCED） · Knobloch 与 Zillmann（2002）/);
    const reply = zh.statements.find((s) => s.id === "BP-ARG-REPLY")!;
    expect(captionZh(reply)).toBeNull();
  });
});
