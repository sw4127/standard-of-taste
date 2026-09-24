/**
 * THE PRESTIGE TEST'S OWN PREVIEW IMAGE (moved 2026-09-24).
 *
 * This was the site's default OG image (2026-07-16 brief §3.B4), written when
 * the Prestige Test was the front door. Since BA-6 the reading is, and the
 * default at `src/app/opengraph-image.tsx` is the reading's; this file moved
 * here so `/bias` keeps the card that describes it. `/bias/result` overrides it
 * with its dynamic card via generateMetadata.
 *
 * Typography-driven per the design bar: Fraunces, gym gold, no imagery.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { numberWord, numberWordLeading } from "@/content/vocabulary/numbers";
import { BIAS_CLIP_COUNT, BIAS_SESSION_MINUTES } from "@/content/instrument-shape";

export const runtime = "nodejs";
export const alt =
  "Standard of Taste — your taste has a number. The Prestige Test measures how far a famous name can move your ratings.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "src", "fonts");

const GOLD = "hsl(42, 80%, 62%)";
const CREAM = "#f5f1e8";
const SUB = "#a89f8d";

export default function OgImage() {
  const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
  const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundImage:
            "linear-gradient(145deg, #2a2213 0%, #17120a 45%, #0b0a08 100%)",
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{ display: "flex", fontSize: 30, letterSpacing: 14, fontWeight: 600, color: GOLD }}
        >
          STANDARD OF TASTE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 900,
              color: CREAM,
              lineHeight: 1.02,
            }}
          >
            Your taste has a number.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 600,
              color: SUB,
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            {`${numberWordLeading(BIAS_CLIP_COUNT)} clips, rated twice — the gap is how far a famous name can move you.`}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: SUB }}>
            {`Free · ${numberWord(BIAS_SESSION_MINUTES)} minutes · no sign-up`}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: GOLD }}>
            The Prestige Test →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
        { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
      ],
    },
  );
}
