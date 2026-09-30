/**
 * /delicacy/result?pv=&p= — the stateless Delicacy Trials permalink.
 *
 * Recomputes the score from the raw picks on every request (§6 principle):
 * the page can only ever show what the engine concludes from the encoded
 * answers. N3 caveat carried from the engine: delicacy HAS a public answer
 * key, so a crafted URL can hold a perfect score — recomputation guarantees
 * consistency, not that an ear produced it; framing stays "a measured
 * session". Viewer-facing: the reveal (what each flaw was) belongs to the
 * taker's own run, not the share target — here the CTA is to go taste.
 *
 * Version gate (the delicacy.ts codec contract): pv must equal the live
 * DELICACY_POOL_VERSION or the link dies gracefully into /delicacy.
 */
import { readableOn } from "@/lib/readable-on";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  computeDelicacyResult,
  decodeDelicacyResponses,
  type DelicacyResult, detectionBand } from "@/engine/delicacy";
import { DELICACY_INSTRUMENT_ID, DELICACY_LIVE, DELICACY_POOL_VERSION, MEASURED_TRIALS } from "@/content/delicacy/items";
import { shareText, detectionTitle, detectionBody } from "@/content/delicacy/copy";
import { baseUrl } from "@/lib/site";
import FluidField from "@/components/FluidField";
import Track from "@/components/Track";
import ShareButton from "@/app/result/ShareButton";
import { CalibrationBlock, FlawLine, InYourWork } from "../RevealBlocks";
import AcrossSessions from "@/components/AcrossSessions";
import AcrossTime from "@/components/AcrossTime";
import ExpertPanel from "@/components/ExpertPanel";
import { computeCalibration } from "@/engine/calibration";
import DownloadButton from "@/app/result/DownloadButton";
import { DELICACY_ICE, DELICACY_ICE_GLOW, DELICACY_FIELD } from "@/content/instrument-accents";
import LanguageBar from "@/components/LanguageBar";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import DELICACY_ZH from "@/content/zh/copy/delicacy";
import { detectionBodyZh, detectionTitleZh, shareTextDelicacyZh } from "@/content/zh/copy/delicacy-lines";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ICE = DELICACY_ICE;
const ICE_GLOW = DELICACY_ICE_GLOW;
const FLUID = DELICACY_FIELD;

/**
 * Prod gate: until the pool of record is live, no share surface exists in
 * production — otherwise dev-pool score URLs would render as legit-looking
 * cards pointing into a room whose audio was never deployed. Dev stays open
 * so the loop is testable against the v0 pool.
 */
const SHARE_OPEN = DELICACY_LIVE || process.env.NODE_ENV !== "production";

function resultFrom(sp: Record<string, string | string[] | undefined>): { result: DelicacyResult; p: string } | null {
  if (!SHARE_OPEN) return null;
  if (sp.pv !== String(DELICACY_POOL_VERSION)) return null;
  const p = typeof sp.p === "string" ? sp.p : undefined;
  const responses = decodeDelicacyResponses(MEASURED_TRIALS, p);
  if (!responses || !p) return null;
  return { result: computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses), p };
}

function cardUrl(format: "story" | "square" | "og", p: string): string {
  return `/api/delicacy-card?format=${format}&pv=${DELICACY_POOL_VERSION}&p=${encodeURIComponent(p)}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return delicacyResultMetadata(searchParams, "en");
}

/** In either language (bilingual Part 4); the card image itself stays English (Satori has no Chinese face). */
export async function delicacyResultMetadata(searchParams: SearchParams, locale: Locale): Promise<Metadata> {
  const t = tFor(locale, DELICACY_ZH);
  const alternates = { languages: { en: "/delicacy/result", "zh-Hans": "/zh/delicacy/result" } };
  const data = resultFrom(await searchParams);
  if (!data) return { title: t("The Delicacy Trials"), alternates };
  const title = t("{k}/{n} originals caught — The Delicacy Trials", { k: data.result.nCorrect, n: data.result.nTrials });
  // The score is out of the SCORED set, so the description counts that set —
  // quoting the 18-pair pool next to an out-of-15 score would overstate it (N3).
  const description = t(
    "{n} scored pairs of clips; one of each is quietly damaged. A coin flip gets half. Find the key in the wine.",
    { n: MEASURED_TRIALS.length },
  );
  const og = `${baseUrl()}${cardUrl("og", data.p)}`;
  return {
    title,
    description,
    robots: DELICACY_POOL_VERSION > 0 ? undefined : { index: false },
    alternates,
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function DelicacyResultPage({
  searchParams,
  locale = "en",
}: {
  searchParams: SearchParams;
  locale?: Locale;
}) {
  const t = tFor(locale, DELICACY_ZH);
  const zh = locale === "zh";
  const data = resultFrom(await searchParams);
  if (!data) redirect(localHref(locale, "/delicacy"));
  const { result, p } = data;
  const band = detectionBand(result.nCorrect, result.nTrials);
  // Recomputed here exactly as the flow recomputes it — the payload carries the
  // per-trial confidence, so this is the same number the taker already saw.
  const calibration = computeCalibration(
    result.receipts.map((r) => ({ confidence: r.confidence, correct: r.correct })),
  );
  const permalink = `${baseUrl()}${localHref(locale, "/delicacy/result")}?pv=${DELICACY_POOL_VERSION}&p=${encodeURIComponent(p)}`;

  return (
    <>
    {/* The permalink recomputes from its address, so switching language keeps the result. */}
    <LanguageBar locale={locale} width="max-w-lg" />
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12 text-center">
      <FluidField colors={FLUID} intensity={0.7} scrim={false} vignette />
      <Track event="delicacy_result_view" props={{ nCorrect: result.nCorrect }} />
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: ICE }}>
          {t("THE DELICACY TRIALS")}
        </p>
        <p className="mt-6 font-display text-7xl font-semibold leading-none" style={{ color: ICE, textShadow: `0 0 60px ${ICE_GLOW}` }}>
          {result.nCorrect}
          <span className="text-4xl" style={{ color: "rgba(255,255,255,0.55)" }}>
            /{result.nTrials}
          </span>
        </p>
        <p className="mt-3 text-sm text-muted">{t("originals identified")}</p>
        <h1 className="mt-6 font-display text-3xl font-semibold">{zh ? detectionTitleZh(band) : detectionTitle(band)}</h1>
        <p className="mt-3 max-w-sm text-left text-base leading-relaxed text-muted">
          {zh ? detectionBodyZh(band) : detectionBody(band)}
        </p>

        {/* RT-142(a), E7/S10b: the taker's OWN performance, recomputed from the
            same payload the score comes from. It used to exist only inside the
            flow, so sharing your permalink and coming back showed you less than
            you had already seen — your calibration read vanished.
            NOT the per-pair disclosure: that is the answer key, and this page is
            a share target (see the docblock at the top of this file). */}
        <FlawLine result={result} locale={locale} />
        <InYourWork result={result} locale={locale} />
        <CalibrationBlock cal={calibration} locale={locale} />
        <AcrossTime accent={ICE} own={{ kind: "delicacy", picks: p }} />
        <AcrossSessions accent={ICE} own={{ kind: "delicacy", picks: p }} />
        <ExpertPanel accent={ICE} instrument={{ kind: "delicacy" }} own={{ kind: "delicacy", picks: p }} />

        {/* The card itself — server-rendered, long-press-saveable in webviews. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardUrl("square", p)}
          alt={t("Delicacy Trials card: {k} of {n} originals caught", { k: result.nCorrect, n: result.nTrials })}
          className="mt-8 w-full max-w-xs rounded-2xl border border-white/10"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ShareButton
            url={permalink}
            text={zh ? shareTextDelicacyZh(result.nCorrect, result.nTrials) : shareText(result.nCorrect, result.nTrials)}
            label={t("Share these ears")}
            event="delicacy_share"
            primary
            accent={ICE}
          />
          <DownloadButton url={cardUrl("story", p)} label={t("Story card")} filename="delicacy-trials-story.png" />
        </div>

        <p className="mt-8 text-sm text-muted">{t("Someone sent you their score? They're daring you.")}</p>
        <Link
          href={localHref(locale, "/delicacy")}
          className="mt-3 rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
          style={{ color: readableOn(ICE), background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
        >
          {t("Get your ears tested")}
        </Link>
        <p className="mt-6 text-xs text-muted">
          {t("Provisional read — percentiles arrive when the cohort does, not before.")}
        </p>
      </div>
    </main>
    </>
  );
}
