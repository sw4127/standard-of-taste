import { describe, it, expect, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";
import { READING_KICKER, READING_TITLE, READING_SHARE_LINE, LISTENER_LABEL } from "@/content/reading/copy";

/**
 * THE SITE'S DEFAULT PREVIEW IMAGE SAYS ONLY WHAT THE READING SAYS (2026-09-24).
 *
 * The image is a PNG, so no page scan reads it: that is how the Prestige Test
 * stayed on it for a day after BA-6 moved the front door. This stubs the image
 * renderer, keeps the element tree it was handed, and reads every text node the
 * PNG would draw. Each must be one of the reading's own sentences, so the card
 * cannot carry a line that is not in `docs/copy-deck-reading.md`, and none may
 * name an instrument.
 */
let drawn: ReactNode = null;
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element: ReactNode) {
      drawn = element;
    }
  },
}));

function textOf(node: ReactNode): string[] {
  if (node === null || node === undefined || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (Array.isArray(node)) return node.flatMap(textOf);
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return [];
}

const ALLOWED = [`STANDARD OF TASTE · ${READING_KICKER}`, READING_TITLE, READING_SHARE_LINE, LISTENER_LABEL];
const INSTRUMENT = /prestige|delicacy|threshold|ranking/i;

describe("the default preview image", () => {
  it("draws only the reading's own sentences, all of them", async () => {
    const mod = await import("./opengraph-image");
    mod.default();
    const text = textOf(drawn);
    expect(text.length).toBeGreaterThan(0);
    expect(text.filter((t) => !ALLOWED.includes(t))).toEqual([]);
    expect([...ALLOWED].sort()).toEqual([...text].sort());
  });

  it("names no instrument, in the picture or its alt text", async () => {
    const mod = await import("./opengraph-image");
    mod.default();
    expect(textOf(drawn).filter((t) => INSTRUMENT.test(t))).toEqual([]);
    expect(mod.alt).not.toMatch(INSTRUMENT);
  });

  it("draws every colour in the comma form Satori can read, taken from the gym's ink", async () => {
    const mod = await import("./opengraph-image");
    mod.default();
    const colours: string[] = [];
    const walk = (n: ReactNode): void => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!isValidElement<{ style?: { color?: string }; children?: ReactNode }>(n)) return;
      if (n.props.style?.color) colours.push(n.props.style.color);
      walk(n.props.children);
    };
    walk(drawn);
    expect(colours.length).toBeGreaterThan(0);
    expect(colours.filter((c) => !/^hsl\(225, 8%, \d+%\)$/.test(c))).toEqual([]);
  });

  it("has alt text built from the same sentences, with nothing typed beside them but the name", async () => {
    const mod = await import("./opengraph-image");
    expect(mod.alt).toBe(`Standard of Taste. ${READING_TITLE} ${READING_SHARE_LINE}`);
  });
});
