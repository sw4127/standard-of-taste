import type { Metadata } from "next";
import Link from "next/link";
import { THRESHOLD_VIOLET, THRESHOLD_VIOLET_GLOW, THRESHOLD_FIELD, tint } from "@/content/instrument-accents";
import FluidField from "@/components/FluidField";
import { THRESHOLD_SLUGS, familyForSlug } from "./families";
import { FAMILY_BLURB, familyLabel, quantity, shortUnit } from "@/content/staircase/copy";
import { axisFor, sessionMinutes } from "@/engine/staircase-session";
import { isSourceLocked } from "@/engine/staircase-pool";
import LanguageBar from "@/components/LanguageBar";
import { localHref, type Locale } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import THRESHOLD_ZH from "@/content/zh/copy/threshold";
import { FAMILY_BLURB_ZH } from "@/content/zh/copy/threshold-lines";
import { familyLabelZh, quantityZh, quantityZhGlossed } from "@/content/zh/copy/across";

/**
 * PICK A FLAW (E5/S7).
 *
 * ONE FAMILY PER SESSION is a ruling, not a layout choice (RT-59a): the
 * staircase converges on one kind of damage at a time, and interleaving three
 * would mean three half-measured ladders instead of one measured one. So the
 * machine's front door is a choice of which flaw to chase tonight.
 *
 * EVERY NUMBER ON THIS PAGE IS DERIVED FROM THE ENGINE — the ladder's range,
 * the number of rungs, the session length. Written down, they would be three
 * more copies of facts that have already changed twice this month.
 */

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). `/zh/threshold` renders this page with
 * `locale="zh"`; the numbers still come from the engine, and the quantities carry
 * their units in Chinese (cents in Chinese, glossed at first use; ms and kbps as written).
 */
export function thresholdIndexMetadata(locale: Locale): Metadata {
  const t = tFor(locale, THRESHOLD_ZH);
  return {
    title: t("Find your threshold — Standard of Taste"),
    description: t(
      "Three adaptive listening tests, one per kind of damage. Each finds the smallest flaw you can still catch and reports it in physical units — cents, milliseconds, kilobits per second.",
    ),
    alternates: { canonical: localHref(locale, "/threshold"), languages: { en: "/threshold", "zh-Hans": "/zh/threshold" } },
    openGraph: {
      title: t("Find your threshold — Standard of Taste"),
      description: t("How small a flaw can you actually hear? Measured, in physical units."),
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export const metadata = thresholdIndexMetadata("en");

const ICE = THRESHOLD_VIOLET;
const FLUID = THRESHOLD_FIELD;
const BRAND = "rgba(244,245,248,0.72)";


export default function ThresholdIndex({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, THRESHOLD_ZH);
  const zh = locale === "zh";
  // The first cents on the Chinese page carries the glossary's bracketed English.
  let glossed = false;
  const q = (v: number, unit: string) => {
    if (!zh) return quantity(v, unit);
    if (!glossed && shortUnit(unit) === "cents") {
      glossed = true;
      return quantityZhGlossed(v, unit);
    }
    return quantityZh(v, unit);
  };
  const machines = THRESHOLD_SLUGS.map((slug) => {
    const family = familyForSlug(slug)!;
    // Lossy locks to one recording, so its ladder differs per source; the index
    // shows the widest one it can actually present.
    const axis = isSourceLocked(family) ? axisFor(family, "pb1") : axisFor(family);
    return {
      slug,
      family,
      axis,
      minutes: sessionMinutes(family),
    };
  });

  return (
    <>
    <LanguageBar locale={locale} width="max-w-lg" />
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} intensity={0.6} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            {t("STANDARD OF TASTE")}
          </p>
          <Link href={localHref(locale, "/")} className="text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white">
            {t("THE GYM FLOOR")}
          </Link>
        </div>

        <h1 className="mt-7 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
          {t("How small a flaw can you hear?")}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          {rich(
            t(
              "Three kinds of damage, one per session. Each test walks the flaw down until you stop being sure, and gives you the size where that happened — {strong}",
            ),
            { strong: <span className="text-foreground">{t("a physical quantity, not a score.")}</span> },
          )}
        </p>

        <ul className="mt-7 flex flex-col gap-3">
          {machines.map(({ slug, family, axis, minutes }) => (
            <li key={slug}>
              <Link
                href={localHref(locale, `/threshold/${slug}`)}
                className="group flex flex-col rounded-2xl border p-5 transition duration-300 active:scale-[0.99]"
                style={{ borderColor: tint(ICE, 0.3), background: "rgba(255,255,255,0.03)" }}
              >
                <p className="font-display text-xl font-semibold">{zh ? familyLabelZh(family) : familyLabel(family)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{zh ? FAMILY_BLURB_ZH[family] : FAMILY_BLURB[family]}</p>
                <p className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">
                    {t("~{minutes} min · {rungs} rungs · {lo} to {hi}", {
                      minutes,
                      rungs: axis.labels.length,
                      lo: q(Math.min(...axis.labels), axis.unit),
                      hi: q(Math.max(...axis.labels), axis.unit),
                    })}
                  </span>
                  <span
                    className="font-bold transition-transform group-hover:translate-x-0.5"
                    style={{ color: ICE }}
                  >
                    {t("Start →")}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-muted">
          {t(
            "Free · no sign-up · headphones required, not advised — laptop speakers cannot reproduce most of what this measures.",
          )}
        </p>

        <p className="mt-8 text-sm text-muted">
          <Link href={localHref(locale, "/lab/instrument-limits")} className="transition hover:text-white" style={{ color: ICE }}>
            {t("What this instrument cannot do.")}
          </Link>{" "}
          {t("Every limit we measured and could not fix.")}
        </p>
      </div>
    </main>
    </>
  );
}
