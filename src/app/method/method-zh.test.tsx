/**
 * /zh/method KEEPS WHAT MAKES /method WORTH READING (red-team, bilingual Part 2).
 *
 * The English page is held by source-reading tests: every inferred entry wears
 * the inference mark, the counts are slotted, the closing links resolve. Those
 * tests read JSX, so they cannot see what the Chinese page SHOWS: an empty or
 * softened label, a closing whose link label no longer matches, an emphasis that
 * lands on the wrong word. This renders the Chinese page and checks what a reader
 * gets. Serves BA-12, RT-159a (an inference must be marked as one), N3.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MethodPage from "./page";
import METHOD_ZH from "@/content/zh/copy/method";
import {
  METHOD_AGENTS,
  METHOD_AGENTS_LEDE,
  METHOD_FINDINGS,
  METHOD_REFUSALS,
  METHOD_REVERSALS,
  METHOD_SECTIONS,
  sectionClaims,
} from "@/content/method/claims";
import { METHOD_CLOSING_LINKS, METHOD_LEDE } from "@/content/method/prose";

const html = renderToStaticMarkup(MethodPage({ locale: "zh" }));
const text = html.replace(/<[^>]*>/g, "");
const count = (hay: string, needle: string) => hay.split(needle).length - 1;

const LABEL = "Inference — the engineer's reading, not a recorded ruling";
const inferred = [
  ...METHOD_SECTIONS.flatMap((s) => sectionClaims(s)),
  ...METHOD_REFUSALS,
  ...METHOD_REVERSALS,
  ...METHOD_FINDINGS,
  METHOD_AGENTS_LEDE,
  ...METHOD_AGENTS,
].filter((e) => e.kind === "inferred").length;

describe("the Chinese /method", () => {
  it("marks every inferred entry, in Chinese, with the approved label", () => {
    expect(METHOD_ZH[LABEL]).toBe("推论（INFERENCE）：工程师的看法，并非记录在案的裁定");
    expect(inferred).toBeGreaterThan(0);
    expect(count(text, METHOD_ZH[LABEL])).toBe(inferred);
  });

  it("links the closing to both destinations, the Chinese one where it exists", () => {
    expect(html).toContain('href="/zh/learn/why"');
    expect(html).toContain('href="/lab/instrument-limits"');
    for (const l of METHOD_CLOSING_LINKS) expect(count(text, METHOD_ZH[l.label]), l.label).toBe(1);
  });

  it("puts each emphasis on one word, as the English does", () => {
    for (const p of METHOD_LEDE.filter((x) => x.emphasis)) {
      expect(count(METHOD_ZH[p.text], METHOD_ZH[p.emphasis!]), p.emphasis).toBe(1);
      expect(html).toContain(`<em>${METHOD_ZH[p.emphasis!]}</em>`);
    }
  });

  it("states the counts from the arrays, as digits", () => {
    expect(text).toContain(`${METHOD_REFUSALS.length} 项否决`);
    expect(text).toContain(`${METHOD_REVERSALS.length} 次改判`);
  });
});
