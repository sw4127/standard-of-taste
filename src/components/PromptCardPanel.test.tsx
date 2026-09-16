/**
 * THE PANEL RENDERS WHAT THE CARD COMPUTED, AND ITS OWN DISCLOSURE (E21/T-S5).
 *
 * SOURCE SCANS CANNOT SEE THIS. A component that stops rendering a section
 * still contains the module import, the `.map` and the docblock explaining why
 * it matters — the exact gap `method-prose.test.tsx` was written for when the
 * method page's prose moved out of JSX. So this renders the component and reads
 * the markup.
 *
 * WHAT IT CANNOT DO, and it is a real limit here: `renderToStaticMarkup` runs
 * no effects and no event handlers, so the copy button's BEHAVIOUR is outside
 * it. That was read in the browser instead — the clipboard API rejects with
 * NotAllowedError whenever the document is unfocused, and the fallback selects
 * the text and relabels the button, verified on the rendered page. What this
 * file holds is that the control and the disclosure are on screen at all.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { observer, pCorrect, rng } from "@/analytics/observer";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "@/engine/staircase-session";
import PromptCardPanel from "./PromptCardPanel";
import { CARD_STATEMENT } from "@/content/card/statement";
import { cardSections, CARD_PASTE } from "@/content/card/copy";

function play(family: string, seed: number, atRung: number): StaircaseResult {
  const axis = axisFor(family, undefined);
  const o = observer(axis.magnitudes[atRung], 0.35, 0.02);
  let s = startSession(family, seed, undefined);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");

describe("the prompt card panel", () => {
  const result = play("pitch-drift", 7, 3);
  const html = renderToStaticMarkup(<PromptCardPanel accent="#fff" results={[result]} />);
  const text = strip(html);

  it("rendered a real card from a real session", () => {
    expect(result.kind, "the fixture session produced no threshold").toBe("threshold");
    expect(html.length, "the panel rendered nothing").toBeGreaterThan(400);
  });

  it("renders every line the card computed, and nothing it did not", () => {
    const sections = cardSections([result]);
    expect(sections.length, "the fixture produced no sections").toBeGreaterThan(1);
    for (const section of sections) {
      expect(text, `the panel drops the "${section.heading}" heading`).toContain(section.heading);
      for (const line of section.lines) {
        expect(text, `the panel drops a line: ${line}`).toContain(line);
      }
    }
  });

  it("carries the disclosure the D1 amendment requires", () => {
    expect(
      text,
      "the card speaks to the reader about themselves and does not say so. That is the condition the " +
        "amendment suspended D1 on, and the surface is where it has to be discharged.",
    ).toContain(CARD_STATEMENT);
  });

  it("offers a copy control beside the paste line", () => {
    expect(html, "no copy control is rendered").toContain('data-testid="prompt-card-copy"');
    expect(html, "no paste line is rendered").toContain('data-testid="prompt-card-paste"');
    const paste = cardSections([result]).find((s) => s.heading === CARD_PASTE)!.lines[0];
    expect(text, "the paste line is not the tags the card computed").toContain(paste);
  });

  /**
   * NOTHING RATHER THAN A SHELL. A card with no reading in it is an invitation
   * to fill in blanks, which is the mechanic this product published a refusal
   * of. An empty history renders no element at all — not an empty box, not a
   * prompt to come back.
   */
  it("renders nothing at all when nothing was measured", () => {
    expect(renderToStaticMarkup(<PromptCardPanel accent="#fff" results={[]} />)).toBe("");
  });
});
