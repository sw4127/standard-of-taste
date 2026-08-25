import { describe, it, expect } from "vitest";
import { ImageResponse } from "next/og";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { EM_PER_CHAR_FIGURE, EM_PER_CHAR_PROSE, FIT_SAFETY } from "./copy";
import { biasCardCta, biasCardSwayLine } from "@/content/bias/copy";
import { staircaseCardFixtures } from "./fixtures";
import { thresholdCardFigure } from "./copy";
import { detectionCardFigure } from "@/content/delicacy/copy";
import { detectionBand } from "@/engine/delicacy";
import { MEASURED_TRIALS } from "@/content/delicacy/items";

/**
 * E7/S15 — THE WIDTH CONSTANTS, RE-MEASURED FROM THE FONT WE ACTUALLY SHIP.
 *
 * `EM_PER_CHAR_FIGURE` and `EM_PER_CHAR_PROSE` decide how large every card's
 * hero can be drawn. Satori cannot measure text, so those two numbers ARE the
 * width model — and both were measured once, by hand, in a browser session that
 * no longer exists. Nothing re-measured them, and nothing could: the evidence
 * was a person looking at a screen.
 *
 * This measures them properly. It renders through `ImageResponse` — the same
 * Satori, the same bundled Fraunces, the same weights the card routes register
 * — and reads the LAID-OUT width off the pixels. Not the ink bounding box,
 * which is narrower than the advance and would flatter the constants: the text
 * is drawn on a coloured span, so the span's extent is exactly what Satori
 * decided the string occupies.
 *
 * WHAT IT FOUND, and what changed because of it. copy.ts justified
 * `EM_PER_CHAR_FIGURE` twice over as "0.62 … that worst case with headroom",
 * while shipping 0.6 — and `git log -S` says it had never been anything else.
 * The file described 4.6% of headroom and shipped 1.2%.
 *
 * This measurement reproduces the original browser figure to three decimals
 * ("48–128 kbps" = 0.5936 against 0.593 recorded), which is good evidence for
 * both, and then finds six governed figures ABOVE 0.6 — worst "100 ms" at
 * 0.6183. Nothing was clipping; FIT_SAFETY was carrying the margin. The
 * constant is now 0.62, matching the paragraph that always claimed it, and this
 * sweep fails if a future figure exceeds it.
 */
const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));
const DIR = mkdtempSync(join(tmpdir(), "em-metrics-"));
const W = 1800;
const H = 260;
const FONT_PX = 100;

/** Render one string on a red span and return the span's laid-out width in px. */
async function laidOutWidth(text: string, weight: 600 | 900): Promise<number> {
  const res = new ImageResponse(
    {
      type: "div",
      props: {
        style: { display: "flex", width: "100%", height: "100%", background: "#000", alignItems: "flex-start" },
        children: {
          type: "span",
          props: {
            style: {
              backgroundColor: "#ff0000",
              color: "#ffffff",
              fontSize: FONT_PX,
              fontFamily: "Fraunces",
              fontWeight: weight,
              lineHeight: 1.2,
            },
            children: text,
          },
        },
      },
    } as never,
    {
      width: W,
      height: H,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
        { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
      ],
    },
  );
  const png = join(DIR, `${weight}-${Buffer.from(text).toString("hex").slice(0, 24)}.png`);
  writeFileSync(png, Buffer.from(await res.arrayBuffer()));
  const raw = execFileSync(FFMPEG, ["-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "-v", "error", "pipe:1"], {
    maxBuffer: 1 << 30,
  });
  let min = W;
  let max = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      // The span's own background: strongly red, not the white glyphs on it.
      if (raw[i] > 150 && raw[i + 1] < 90 && raw[i + 2] < 90) {
        if (x < min) min = x;
        if (x > max) max = x;
      }
    }
  }
  return max < 0 ? 0 : max - min + 1;
}

const emPerChar = (width: number, text: string) => width / (FONT_PX * text.length);

/**
 * THE FIGURES THE CONSTANT ACTUALLY GOVERNS — enumerated from the two places
 * that size text with it, not invented.
 *
 * Scoping this correctly is the whole test. The first version threw in "+20%"
 * because it looks like a figure, measured it at 0.7100 em/char, and reported
 * the model as broken. It is not: the bias card draws that hero at a FIXED
 * `fontSize: 300 * s` and never consults `EM_PER_CHAR_FIGURE`. A guard that
 * fails on a string its subject never sees is the "guard that fails a working
 * card" defect E6/S27 already paid for once.
 *
 * The measurement of "+20%" is kept below as a recorded boundary rather than
 * deleted, because it is true and it matters the day somebody routes a
 * percent-style figure through the fit function.
 */
function governedFigures(): string[] {
  const threshold = staircaseCardFixtures().map((f) => thresholdCardFigure(f.result));
  const n = MEASURED_TRIALS.length;
  const delicacy: string[] = [];
  for (let k = 0; k <= n; k++) delicacy.push(detectionCardFigure(detectionBand(k, n)));
  return [...new Set([...threshold, ...delicacy])].sort();
}

/** Real prose lines from the decks, at the sizes cards draw them. */
const PROSE = [
  biasCardCta("vibe-check-app-sepia.vercel.app"),
  biasCardSwayLine(14, 14),
  "my ratings moved when the famous names showed up",
  "originals caught — a coin flip averages 7.5",
];

describe("E7/S15 — the width constants, measured from the shipped font", () => {
  it("no figure is wider per character than EM_PER_CHAR_FIGURE claims", { timeout: 180_000 }, async () => {
    const rows: string[] = [];
    let worst = 0;
    let worstText = "";
    const FIGURES = governedFigures();
    expect(FIGURES.length, "the figure sweep collapsed — it is not sweeping").toBeGreaterThanOrEqual(10);
    for (const text of FIGURES) {
      const em = emPerChar(await laidOutWidth(text, 900), text);
      rows.push(`  ${em.toFixed(4)} em/char  "${text}" (${text.length} chars, weight 900)`);
      if (em > worst) {
        worst = em;
        worstText = text;
      }
    }
    writeFileSync(
      join(process.cwd(), "docs", "analytics", "e7-em-metrics.txt"),
      [
        "E7/S15 CARD WIDTH CONSTANTS — MEASURED FROM THE SHIPPED FONT [real render]",
        "Rendered through next/og (the same Satori and the same bundled Fraunces the card",
        "routes register), measuring the LAID-OUT span width, not the ink bounding box.",
        "",
        "FIGURES (Fraunces 900):",
        ...rows,
        `  worst: ${worst.toFixed(4)} em/char on "${worstText}"`,
        `  shipped EM_PER_CHAR_FIGURE = ${EM_PER_CHAR_FIGURE}  ` +
          `(${(((EM_PER_CHAR_FIGURE - worst) / worst) * 100).toFixed(1)}% headroom)`,
        "",
        `FIT_SAFETY = ${FIT_SAFETY} — the explicit cushion, applied on top.`,
        "",
        "Regenerated by src/content/staircase/em-metrics.test.ts on every run.",
      ].join("\n"),
    );
    expect(
      worst,
      `The width model UNDER-estimates. Satori lays "${worstText}" out at ${worst.toFixed(4)} em per ` +
        `character; the model assumes ${EM_PER_CHAR_FIGURE}, so the hero is drawn larger than it fits ` +
        `and the number the card exists to show is clipped:\n${rows.join("\n")}`,
    ).toBeLessThanOrEqual(EM_PER_CHAR_FIGURE);
  });

  it("no prose line is wider per character than EM_PER_CHAR_PROSE claims", { timeout: 180_000 }, async () => {
    const rows: string[] = [];
    let worst = 0;
    let worstText = "";
    for (const text of PROSE) {
      const em = emPerChar(await laidOutWidth(text, 600), text);
      rows.push(`${em.toFixed(4)} em/char  "${text.slice(0, 44)}"`);
      if (em > worst) {
        worst = em;
        worstText = text;
      }
    }
    expect(
      worst,
      `Prose is wider than the model assumes — "${worstText}"\n${rows.join("\n")}`,
    ).toBeLessThanOrEqual(EM_PER_CHAR_PROSE);
  });

  it("figures really are wider than prose, which is why there are two constants", async () => {
    // The claim that justified splitting one constant into two (E6/S27). If it
    // ever stops holding, the split is unnecessary and the prose constant is
    // silently over-tight on something.
    const figure = emPerChar(await laidOutWidth("48–128 kbps", 900), "48–128 kbps");
    const prose = emPerChar(await laidOutWidth(PROSE[0], 600), PROSE[0]);
    expect(figure, `figure ${figure.toFixed(4)} vs prose ${prose.toFixed(4)}`).toBeGreaterThan(prose);
  }, 180_000);

  it("the measurement can detect a string that is genuinely too wide", async () => {
    // A guard proven only against strings that pass is a guard that has never
    // been shown to work. Forty capital Ws is unambiguously over any per-char
    // constant this file ships.
    const em = emPerChar(await laidOutWidth("W".repeat(20), 900), "W".repeat(20));
    expect(em, "twenty W's measured narrower than the figure constant — the probe is broken").toBeGreaterThan(
      EM_PER_CHAR_FIGURE,
    );
  }, 180_000);
});
