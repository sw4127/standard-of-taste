/**
 * GET /api/delicacy-card?format=&pv=&p=
 *
 * The Delicacy Trials share card. Takes the RAW picks (same ?p= as
 * /delicacy/result) and RECOMPUTES the score in-process — a pure function of
 * its query params, CDN-cacheable, and consistent-by-construction: no query
 * string can make the card claim a score the engine wouldn't compute from
 * those picks (N3; the engine's answer-key note applies — consistency, not
 * proof of ear). Typography-driven, no imagery, Satori CSS subset only
 * (flexbox, bundled Fraunces) — same contract as /api/bias-card.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { computeDelicacyResult, decodeDelicacyResponses } from "@/engine/delicacy";
import { DELICACY_INSTRUMENT_ID, DELICACY_LIVE, DELICACY_POOL_VERSION, MEASURED_TRIALS } from "@/content/delicacy/items";
import { delicacyVerdict } from "@/content/delicacy/copy";
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

export async function GET(request: Request) {
  // Same prod gate as /delicacy/result: no card exists in production until
  // the pool of record is live (dev stays open for loop testing).
  if (!DELICACY_LIVE && process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "instrument not live" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  const { searchParams } = new URL(request.url);
  const format: Format = (["story", "square", "og"] as const).find((f) => f === searchParams.get("format")) ?? "story";

  // Codec versioning contract: a card renders only against the pool version
  // that produced the picks — stale/absent pv must never score today's pool.
  if (searchParams.get("pv") !== String(DELICACY_POOL_VERSION)) {
    return new Response(JSON.stringify({ error: "pool version mismatch" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const responses = decodeDelicacyResponses(MEASURED_TRIALS, searchParams.get("p") ?? undefined);
  if (!responses) {
    return new Response(JSON.stringify({ error: "invalid picks" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const result = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
  const verdict = delicacyVerdict(result.nCorrect, result.nTrials);
  const flawLine =
    result.flawAccuracy !== null
      ? `named the flaw ${result.flawCorrect} of ${result.flawEligible} times`
      : null;
  const host = baseUrl().replace(/^https?:\/\//, "");

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  const s = format === "story" ? 1 : format === "square" ? 0.86 : 0.62;

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
          backgroundColor: BASE,
          backgroundImage:
            "linear-gradient(160deg, rgba(93,196,222,0.13) 0%, rgba(7,9,11,0) 38%), linear-gradient(340deg, rgba(93,196,222,0.09) 0%, rgba(7,9,11,0) 42%)",
          color: "#fff",
          padding: 64 * s,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26 * s,
            fontFamily: "Fraunces",
            fontWeight: 600,
            letterSpacing: "0.42em",
            color: ICE,
          }}
        >
          THE DELICACY TRIALS
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            marginTop: (isOg ? 18 : 44) * s,
            lineHeight: 1,
            fontFamily: "Fraunces",
            fontWeight: 900,
            color: ICE,
          }}
        >
          <div style={{ display: "flex", fontSize: 300 * s }}>{String(result.nCorrect)}</div>
          <div style={{ display: "flex", fontSize: 140 * s, color: MUTED, paddingBottom: 14 * s }}>
            {`/${result.nTrials}`}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 22 * s, fontSize: 30 * s, color: MUTED }}>
          originals caught — a coin flip calls 3
        </div>
        <div
          style={{
            display: "flex",
            marginTop: (isOg ? 26 : 58) * s,
            fontSize: 76 * s,
            lineHeight: 1.05,
            fontFamily: "Fraunces",
            fontWeight: 900,
          }}
        >
          {verdict.title}
        </div>
        {flawLine && !isOg ? (
          <div
            style={{
              display: "flex",
              marginTop: 30 * s,
              padding: `${12 * s}px ${28 * s}px`,
              borderRadius: 999,
              border: "1.5px solid rgba(255,255,255,0.18)",
              fontSize: 26 * s,
              color: MUTED,
            }}
          >
            {flawLine}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: (isOg ? 28 : 72) * s,
            fontSize: 26 * s,
            fontFamily: "Fraunces",
            fontWeight: 600,
            color: ICE,
          }}
        >
          {`${host}/delicacy — get your ears tested`}
        </div>
      </div>
    ),
    {
      width: w,
      height: h,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900 as const, style: "normal" as const },
        { name: "Fraunces", data: fontSemi, weight: 600 as const, style: "normal" as const },
      ],
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
