/**
 * GET /api/threshold-card?format=&slug=&s=&r=&src=
 *
 * The Gym's share card. Takes the SAME raw payload as
 * /threshold/[slug]/result — a seed and a string of answers — and replays the
 * session in-process rather than accepting a number. No query string can make
 * this card claim a threshold the engine would not compute from those answers
 * (N3), which is the same unforgeability contract /api/bias-card and
 * /api/delicacy-card hold.
 *
 * Typography only: no imagery, Satori's CSS subset, bundled Fraunces.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { replaySession } from "@/engine/staircase-replay";
import { sessionResult } from "@/engine/staircase-session";
import { familyForSlug } from "@/app/threshold/families";
import { thresholdCardFigure, thresholdCardCaption, NO_COHORT_BADGE } from "@/content/staircase/copy";
import { baseUrl } from "@/lib/site";

export const runtime = "nodejs";

const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));

const SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
} as const;
type Format = keyof typeof SIZES;

const ICE = "hsl(190, 75%, 62%)";
const BASE = "#07090B";
const MUTED = "rgba(255,255,255,0.55)";

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = (["story", "square", "og"] as const).includes(
    (searchParams.get("format") ?? "") as Format,
  )
    ? ((searchParams.get("format") ?? "story") as Format)
    : ("story" as Format);

  const family = familyForSlug(searchParams.get("slug") ?? "");
  if (!family) return bad("unknown flaw");

  const seed = Number(searchParams.get("s"));
  const answers = searchParams.get("r") ?? "";
  const sourceId = searchParams.get("src") ?? undefined;

  // A malformed payload is a 400, never a rendered card. Drawing something
  // plausible from a broken link is how a fabricated number reaches a screen.
  let result;
  try {
    result = sessionResult(replaySession(family, seed, answers, sourceId));
  } catch {
    return bad("invalid session payload");
  }

  const figure = thresholdCardFigure(result);
  const caption = thresholdCardCaption(result);
  const host = baseUrl().replace(/^https?:\/\//, "");
  const { w, h } = SIZES[format];
  const isOg = format === "og";
  // One scale factor per format, so square and og are crops of the story
  // composition rather than three separate designs.
  const s = format === "story" ? 1 : format === "square" ? 0.86 : 0.62;
  const px = (n: number) => Math.round(n * s);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: BASE,
          color: "#F4F5F8",
          fontFamily: "Fraunces",
          padding: `${px(90)}px ${px(80)}px`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: px(26),
            letterSpacing: px(8),
            color: MUTED,
            fontWeight: 600,
          }}
        >
          THE TASTE GYM
        </div>

        {/* The figure is the hero. It is the only thing that has to survive a
            thumbnail, so it gets the whole middle of the card. */}
        <div
          style={{
            display: "flex",
            marginTop: px(isOg ? 26 : 64),
            fontSize: px(figure.length > 12 ? 108 : 150),
            lineHeight: 1,
            fontWeight: 900,
            color: ICE,
          }}
        >
          {figure}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: px(isOg ? 20 : 40),
            fontSize: px(34),
            lineHeight: 1.3,
            color: MUTED,
            maxWidth: px(760),
          }}
        >
          {caption}
        </div>

        {/* N3 on the card itself: no percentile, and the reason stated rather
            than the absence left to be filled in by the reader. */}
        {!isOg ? (
          <div
            style={{
              display: "flex",
              marginTop: px(46),
              padding: `${px(12)}px ${px(28)}px`,
              borderRadius: 999,
              border: `${Math.max(1, px(2))}px solid rgba(255,255,255,0.18)`,
              fontSize: px(24),
              color: MUTED,
            }}
          >
            {NO_COHORT_BADGE}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            marginTop: px(isOg ? 26 : 70),
            fontSize: px(26),
            color: MUTED,
          }}
        >
          {`${host}/threshold`}
        </div>
      </div>
    ),
    {
      width: w,
      height: h,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
        { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}
