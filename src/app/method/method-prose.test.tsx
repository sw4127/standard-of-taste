/**
 * THE PAGE STILL SAYS WHAT IT SAID (E20/S1).
 *
 * The /method page's framing prose moved out of JSX into
 * `content/method/prose.ts`, so the copy deck and the voice gate could read the
 * same string the page shows. A move like that is exactly where a sentence
 * quietly loses a word, an emphasis or a link, and a source scan cannot see it:
 * the page now contains a `.map` where it used to contain the sentence.
 *
 * SO THIS RENDERS THE PAGE AND READS THE RESULT. It asserts the rendered text
 * against the module's strings rather than against a copy typed here -- a
 * second copy is the defect the move was undoing -- and it separately pins the
 * two things markup-as-data can silently drop: the emphasised word must render
 * inside an <em>, and every link label must render inside an anchor pointing at
 * its own href.
 *
 * WHAT IT CANNOT DO: prove the page LOOKS right. Spacing, order on screen and
 * legibility were read in the browser and there is no substitute for that here.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MethodPage from "./page";
import { METHOD_AS_OF } from "@/content/method/claims";
import {
  METHOD_CLOSING_LINKS,
  METHOD_HEADLINE,
  METHOD_KICKER,
  METHOD_LEDE,
  methodClosing,
} from "@/content/method/prose";

const html = renderToStaticMarkup(MethodPage());
/** The rendered page as a reader meets it: tags gone, whitespace collapsed. */
const text = html
  .replace(/<[^>]*>/g, "")
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

describe("the /method page renders its framing prose", () => {
  it("rendered a real page, so nothing below passes vacuously", () => {
    expect(html.length).toBeGreaterThan(4000);
    expect(text.length).toBeGreaterThan(2000);
  });

  it("shows the kicker, the headline and the closing line", () => {
    for (const sentence of [METHOD_KICKER, METHOD_HEADLINE, methodClosing(METHOD_AS_OF)]) {
      expect(text, `missing from the rendered page: ${sentence.slice(0, 48)}`).toContain(sentence);
    }
  });

  it("shows both lede paragraphs whole", () => {
    for (const paragraph of METHOD_LEDE) {
      expect(
        text,
        `a lede paragraph is not rendered whole: ${paragraph.text.slice(0, 48)}`,
      ).toContain(paragraph.text);
    }
  });

  /*
   * THE EMPHASIS AND THE LINKS ARE THE PART THAT CAN VANISH WITHOUT BREAKING
   * ANYTHING. Both are found by searching the sentence for a word, so a rewrite
   * that drops the word renders a correct-looking paragraph with no italic and
   * a closing line with no links to the reading room or the Lab.
   */
  it("italicises the word the module names, in a tag", () => {
    const emphasised = METHOD_LEDE.filter((p) => p.emphasis);
    expect(emphasised.length, "no paragraph asks for emphasis, so this checks nothing").toBe(1);
    for (const paragraph of emphasised) {
      expect(html).toContain(`<em>${paragraph.emphasis}</em>`);
    }
  });

  it("renders every closing link as an anchor to its own href", () => {
    expect(METHOD_CLOSING_LINKS.length).toBe(2);
    for (const link of METHOD_CLOSING_LINKS) {
      const anchor = new RegExp(
        `<a[^>]*href="${link.href}"[^>]*>${link.label}</a>`.replace(/\//g, "/"),
      );
      expect(anchor.test(html), `no anchor to ${link.href} around "${link.label}"`).toBe(true);
    }
  });

  it("puts each link label in the sentence exactly once, or the split is ambiguous", () => {
    const sentence = methodClosing(METHOD_AS_OF);
    for (const link of METHOD_CLOSING_LINKS) {
      const count = sentence.split(link.label).length - 1;
      expect(count, `"${link.label}" appears ${count} times in the closing line`).toBe(1);
    }
  });

  /*
   * THE SAME AMBIGUITY, ON THE OTHER SIDE. `withEmphasis` italicises the FIRST
   * occurrence of its word, and nothing said the word had to occur once. The
   * paragraph already contains "refusal" twice and "refused" once; a rewrite
   * that adds an earlier "refused" moves the italic to a different word with no
   * failure anywhere, which is a silent change to what the page stresses.
   */
  it("puts each emphasised word in its paragraph exactly once", () => {
    const emphasised = METHOD_LEDE.filter((p) => p.emphasis);
    expect(emphasised.length, "no paragraph asks for emphasis, so this checks nothing").toBe(1);
    for (const paragraph of emphasised) {
      const count = paragraph.text.split(paragraph.emphasis as string).length - 1;
      expect(
        count,
        `"${paragraph.emphasis}" appears ${count} times in its paragraph, so which one gets the ` +
          "italic is decided by position rather than by intent",
      ).toBe(1);
    }
  });
});
