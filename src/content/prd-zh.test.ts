/**
 * THE CHINESE PRD FOLLOWS THE ENGLISH ONE (2026-09-30).
 *
 * `docs/prd-1..4.zh.md` translate the four English parts for the owner's résumé.
 * A translation is the easiest file to leave behind when its source moves, so
 * each Chinese part records its English part's sha256 (over LF endings), as
 * `docs/blueprint.zh.md` does. Any edit to an English part fails here until the
 * Chinese is revised and the new hash recorded, which is when somebody reads
 * both.
 *
 * WHAT IT CANNOT DO: tell whether the Chinese says what the English says. That
 * is Cowork's line-by-line check, and each file says it is a draft until then.
 * Serves BP-GOAL; N3.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PARTS = ["prd-1-use-cases", "prd-2-features", "prd-3-requirements", "prd-4-screens"];

const hashOf = (path: string) =>
  createHash("sha256").update(readFileSync(path, "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");

describe.each(PARTS)("docs/%s.zh.md", (part) => {
  const en = `docs/${part}.md`;
  const zh = readFileSync(`docs/${part}.zh.md`, "utf8");

  it("records its English part's current hash", () => {
    const recorded = new RegExp(`EN-SOURCE ${en.replace(/[.]/g, "\.")} sha256:([0-9a-f]{64})`).exec(zh)?.[1];
    expect(recorded, `${en} changed: revise the Chinese, then record ${hashOf(en)}`).toBe(hashOf(en));
  });

  it("opens with the caveat: not the development language, translated, English sentence structure", () => {
    const head = zh.split("\n").slice(0, 8).join("\n");
    for (const words of ["中文并非主要开发语言", "译自英文原文", "句子结构沿用英文语法", "以英文原文为准"]) {
      expect(head).toContain(words);
    }
  });
});
