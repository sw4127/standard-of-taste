/**
 * THE SITE'S DEFAULT PREVIEW IMAGE IS THE READING'S (2026-09-24; D3 amendment, BA-6).
 *
 * This is the picture a link to `/` or `/reading` unfurls into when it is
 * pasted into a message — for a reviewer sent the link (BP-GOAL), the first
 * thing the product shows. Until 2026-09-24 it still said "Your taste has a
 * number … The Prestige Test →", a day after BA-6 moved the Prestige Test
 * behind the hearing heading; the pages that point at `/opengraph-image`
 * (Threshold, Ranking, the Lab, /method, /learn) were advertising it too. That
 * card now lives at `src/app/bias/opengraph-image.tsx`, where it is true.
 *
 * EVERY WORD HERE IS ALREADY ON THE SITE. The image imports its sentences from
 * the reading's copy rather than typing them, so it adds nothing a writing pass
 * has not seen in `docs/copy-deck-reading.md`, and the label that every
 * simulated listener carries (BA-8) is on the card as well.
 * `opengraph-image.test.ts` fails if a sentence is typed here or an
 * instrument is named.
 *
 * Typography-driven per the design bar: Fraunces, neutral gym ink (the brand's
 * chrome is neutral, not an instrument's accent), no imagery.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { READING_KICKER, READING_TITLE, READING_SHARE_LINE, LISTENER_LABEL } from "@/content/reading/copy";
import { GYM_INK, GYM_INK_BRIGHT } from "@/content/instrument-accents";

export const runtime = "nodejs";
export const alt = `Standard of Taste. ${READING_TITLE} ${READING_SHARE_LINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "src", "fonts");

// The gym's ink tokens, re-punctuated: Satori reads `hsl(225, 8%, 90%)` (the
// Prestige card's gold proves it) but not the CSS4 space-separated form the
// tokens use. Derived rather than copied, so the card follows the site.
const satori = (hsl: string) => hsl.replace(/^hsl\((\S+) (\S+) (\S+)\)$/, "hsl($1, $2, $3)");
const INK_BRIGHT = satori(GYM_INK_BRIGHT);
const INK = satori(GYM_INK);
const SUB = satori(GYM_INK).replace(/\d+%\)$/, "62%)");

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
          backgroundImage: "linear-gradient(145deg, #1c1d23 0%, #101014 45%, #08080a 100%)",
          fontFamily: "Fraunces",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 12, fontWeight: 600, color: INK }}>
          {`STANDARD OF TASTE · ${READING_KICKER}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, color: INK_BRIGHT, lineHeight: 1.06 }}>
            {READING_TITLE}
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: INK, marginTop: 28, maxWidth: 980 }}>
            {READING_SHARE_LINE}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: SUB }}>{LISTENER_LABEL}</div>
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
