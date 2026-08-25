import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { contrastRatio, measureTextBands, relativeLuminance } from "./pixel-contrast";
import { GET as biasCard } from "@/app/api/bias-card/route";
import { GET as delicacyCard } from "@/app/api/delicacy-card/route";
import { GET as thresholdCard } from "@/app/api/threshold-card/route";
import { BIAS_POOL_VERSION } from "@/content/bias/items";
import { DELICACY_POOL_VERSION } from "@/content/delicacy/items";

/**
 * E7/S17 — EVERY SHARE CARD, UNDER A CONTRAST METER, ACROSS ALL THREE INSTRUMENTS.
 *
 * The open debt: no card had been checked for contrast since a primary button
 * was found at 1.83:1. That finding was about a page; the cards were never
 * re-examined, and they are the most public surface the product has — a card is
 * what a stranger sees before they see anything else.
 *
 * It runs the real route handlers, so what is measured is the PNG a share would
 * actually serve, and it reads the pixels rather than the CSS. Every previous
 * contrast probe in this project measured the CSS and was wrong three separate
 * ways.
 *
 * THE FIRST DESCRIBE VALIDATES THE METER. A contrast checker is exactly the
 * kind of instrument that returns confident nonsense, and every number below is
 * worthless if it cannot reproduce values that are known independently.
 */
const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const DIR = mkdtempSync(join(tmpdir(), "card-contrast-"));

/** WCAG's own floors. Large text is >=24px, which every card hero comfortably is. */
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

function toRgb(png: Buffer, width: number, height: number): Buffer {
  const f = join(DIR, `${Math.random().toString(36).slice(2)}.png`);
  writeFileSync(f, png);
  void height;
  return execFileSync(FFMPEG, ["-i", f, "-f", "rawvideo", "-pix_fmt", "rgb24", "-v", "error", "pipe:1"], {
    maxBuffer: 1 << 30,
  });
}

async function render(
  handler: (r: Request) => Promise<Response>,
  url: string,
): Promise<{ rgb: Buffer; width: number; height: number }> {
  const res = await handler(new Request(url));
  expect(res.status, `${url} did not render`).toBe(200);
  const png = Buffer.from(await res.arrayBuffer());
  const probe = execFileSync(
    process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path,
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", "-"],
    { input: png, maxBuffer: 1 << 28 },
  )
    .toString()
    .trim()
    .split(",");
  const width = Number(probe[0]);
  const height = Number(probe[1]);
  return { rgb: toRgb(png, width, height), width, height };
}

describe("E7/S17 — the contrast meter, before anything is measured with it", () => {
  it("reproduces WCAG's own worked values", () => {
    // Black on white is exactly 21:1 by definition; mid grey #777 on white is
    // 4.48:1 by the standard's formula. If either drifts, nothing below counts.
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 5);
    expect(contrastRatio({ r: 119, g: 119, b: 119 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(4.48, 2);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 6);
  });

  it("recovers a known ratio from rendered pixels, not just from arithmetic", async () => {
    // The end-to-end check: draw a known pair, put it through the same decode
    // and band-finding the cards go through, and see the known number come back.
    const { ImageResponse } = await import("next/og");
    const res = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            display: "flex", width: "100%", height: "100%", background: "#0B0A08",
            alignItems: "center", justifyContent: "center",
          },
          children: { type: "div", props: { style: { color: "#FFFFFF", fontSize: 90 }, children: "888888" } },
        },
      } as never,
      { width: 600, height: 220 },
    );
    const png = Buffer.from(await res.arrayBuffer());
    const bands = measureTextBands(toRgb(png, 600, 220), 600, 220);
    const expected = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0x0b, g: 0x0a, b: 0x08 });
    expect(bands.length, "the band finder found no text in an image that is only text").toBe(1);
    expect(
      bands[0].ratio,
      `measured ${bands[0].ratio.toFixed(2)} for white on #0B0A08, which is ${expected.toFixed(2)}`,
    ).toBeGreaterThan(expected * 0.9);
  }, 120_000);

  it("measures a short line the same as a long one in the same style", async () => {
    // THE REGRESSION TEST FOR THE BUG THIS FILE FOUND IN ITSELF. The first
    // estimator took the brightest decile of the whole band, so a centred short
    // phrase drowned in background and reported 1.35:1 where the identically
    // styled line above it reported 4.87:1. Nothing about the card differed —
    // only how much of the row the words filled.
    const { ImageResponse } = await import("next/og");
    const draw = async (text: string) => {
      const res = new ImageResponse(
        {
          type: "div",
          props: {
            style: {
              display: "flex", width: "100%", height: "100%", background: "#07090B",
              alignItems: "center", justifyContent: "center",
            },
            children: { type: "div", props: { style: { color: "#8A8A8A", fontSize: 40 }, children: text } },
          },
        } as never,
        { width: 1200, height: 120 },
      );
      const png = Buffer.from(await res.arrayBuffer());
      const bands = measureTextBands(toRgb(png, 1200, 120), 1200, 120);
      expect(bands.length, `no band found for "${text}"`).toBe(1);
      return bands[0].ratio;
    };
    const long = await draw("the smallest compression damage on pb4 I can");
    const short = await draw("still hear");
    expect(
      Math.abs(long - short),
      `same colour and size measured ${long.toFixed(2)}:1 long vs ${short.toFixed(2)}:1 short`,
    ).toBeLessThan(0.4);
  }, 180_000);

  it("would fail a pair that genuinely does not pass", async () => {
    // Proven downward too: a guard that has only ever seen passing input has
    // not been shown to work.
    const { ImageResponse } = await import("next/og");
    const res = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            display: "flex", width: "100%", height: "100%", background: "#0B0A08",
            alignItems: "center", justifyContent: "center",
          },
          children: { type: "div", props: { style: { color: "#2A2622", fontSize: 90 }, children: "888888" } },
        },
      } as never,
      { width: 600, height: 220 },
    );
    const png = Buffer.from(await res.arrayBuffer());
    const bands = measureTextBands(toRgb(png, 600, 220), 600, 220);
    expect(bands.length).toBe(1);
    expect(bands[0].ratio, "near-invisible ink measured as readable").toBeLessThan(AA_LARGE);
  }, 120_000);
});

/** One realistic session per instrument, in the format a share actually posts. */
const CARDS: { name: string; handler: (r: Request) => Promise<Response>; url: string }[] = [
  {
    name: "prestige · og",
    handler: biasCard as never,
    url: `http://x/api/bias-card?format=og&pv=${BIAS_POOL_VERSION}&b=7,5,6,7,6,5,7,8,6,4,5,7,7,4,6,6&l=6,6,5,8,6,6,8,9,5,3,4,8,8,3,6,5`,
  },
  {
    name: "prestige · story",
    handler: biasCard as never,
    url: `http://x/api/bias-card?format=story&pv=${BIAS_POOL_VERSION}&b=5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5&l=3,7,3,7,5,7,7,7,3,3,3,7,7,3,5,3`,
  },
  {
    name: "delicacy · og",
    handler: delicacyCard as never,
    url: `http://x/api/delicacy-card?format=og&pv=${DELICACY_POOL_VERSION}&p=a09,b17,b25,a19,a17,a25,a09,a17,a05,a09,a17,b25,b09,b27,a25`,
  },
  {
    name: "delicacy · story",
    handler: delicacyCard as never,
    url: `http://x/api/delicacy-card?format=story&pv=${DELICACY_POOL_VERSION}&p=a09,b17,b25,a19,a17,a25,a09,a17,a05,a09,a17,b25,b09,b27,a25`,
  },
  {
    name: "threshold · og",
    handler: thresholdCard as never,
    url: "http://x/api/threshold-card?format=og&slug=compression&s=7&r=1111110011011011011011011011011&src=pb4",
  },
  {
    name: "threshold · story",
    handler: thresholdCard as never,
    url: "http://x/api/threshold-card?format=story&slug=pitch&s=4242&r=111111011011011011",
  },
];

describe("E7/S17 — every share card, across all three instruments", () => {
  it("no line of text on any card falls below the large-text floor", { timeout: 300_000 }, async () => {
    const rows: string[] = [];
    const failures: string[] = [];
    for (const card of CARDS) {
      const { rgb, width, height } = await render(card.handler, card.url);
      const bands = measureTextBands(rgb, width, height);
      rows.push(`${card.name}  (${width}x${height}, ${bands.length} text bands)`);
      for (const b of bands) {
        const ink = `rgb(${b.ink.r.toFixed(0)},${b.ink.g.toFixed(0)},${b.ink.b.toFixed(0)})`;
        const ground = `rgb(${b.ground.r.toFixed(0)},${b.ground.g.toFixed(0)},${b.ground.b.toFixed(0)})`;
        const line = `   rows ${String(b.top).padStart(4)}-${String(b.bottom).padStart(4)}  ${b.ratio.toFixed(2)}:1  ${ink} on ${ground}`;
        rows.push(line);
        if (b.ratio < AA_LARGE) failures.push(`${card.name} rows ${b.top}-${b.bottom}: ${b.ratio.toFixed(2)}:1`);
      }
    }
    writeFileSync(
      join(process.cwd(), "docs", "analytics", "e7-card-contrast.txt"),
      [
        "E7/S17 SHARE CARD CONTRAST — MEASURED FROM RENDERED PIXELS [real renders]",
        "Route handlers invoked directly; contrast read from the PNG, not from CSS.",
        `Floors: ${AA_LARGE}:1 for large text (every card hero qualifies), ${AA_NORMAL}:1 for normal.`,
        "Ink is the brightest decile of each band (glyph cores, not antialiased edges);",
        "ground is the mode of the darker half of the SAME band, so a gradient is handled.",
        "",
        ...rows,
        "",
        failures.length === 0 ? "No band below the large-text floor." : `BELOW FLOOR: ${failures.join(" · ")}`,
        "",
        "Regenerated by src/lib/card-contrast.test.ts on every run.",
      ].join("\n"),
    );
    expect(failures, `Text on a share card is below ${AA_LARGE}:1:\n${rows.join("\n")}`).toEqual([]);
  });
});
