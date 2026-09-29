import type { Metadata } from "next";
import Link from "next/link";
import { localHref, type Locale } from "@/lib/locale";
import { rich, tFor, type T } from "@/lib/i18n";
import COMPANY_ZH from "@/content/zh/copy/company";
import SiteHeader from "@/components/SiteHeader";
import ZhTerms from "@/components/ZhTerms";
import FluidField from "@/components/FluidField";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";
import { bpIn } from "@/content/blueprint";
import { SITE_NAV } from "@/content/site-nav";
import * as C from "@/content/company/copy";
import { ASSUMPTIONS, FORMULA, PLAN, fmt, pctText, MIN_LIFT, BASELINE } from "@/content/company/plan";

/**
 * THE COMPANY VIEW (blueprint Part 6; BA-9, BA-12; BP-BUSINESS, BP-GOAL).
 *
 * One view, two languages (bilingual Part 2): `/company` renders it in English
 * and `/zh/company` in Chinese, from the dictionary keyed by this page's English.
 *
 * Why a fictional streaming company would build the reading, how it would
 * measure it, and what five of its departments would ask. Labelled at the top,
 * because nothing on it was measured: the company does not exist, and every
 * number is a planning assumption or computed from one (`company.test.ts`).
 */

const TITLE = "The company view — Standard of Taste";
const DESCRIPTION =
  "Illustrative: why a fictional streaming service would build the reading, the metrics it would watch, and the A/B test that would decide it.";

export function companyMetadata(locale: Locale): Metadata {
  const t = tFor(locale, COMPANY_ZH);
  return {
    title: t(TITLE),
    description: t(DESCRIPTION),
    alternates: {
      canonical: localHref(locale, "/company"),
      languages: { en: "/company", "zh-Hans": "/zh/company" },
    },
  };
}

const H2 = "font-display text-2xl font-semibold";
const KICK = "text-[0.65rem] font-bold tracking-[0.3em] text-muted";
const BODY = "text-[15px] leading-relaxed text-neutral-300";

function MetricRow({ m, t }: { m: C.Metric; t: T }) {
  return (
    <li className="rounded-xl border border-white/10 p-4">
      <p className="font-semibold text-neutral-100">{t(m.name)}</p>
      <p className="mt-1 text-sm text-neutral-300">{t(m.definition)}</p>
      <p className="mt-1 text-sm text-muted">{t(m.why)}</p>
    </li>
  );
}

export default function CompanyView({ locale }: { locale: Locale }) {
  const t = tFor(locale, COMPANY_ZH);
  // English kickers are set in capitals; Chinese has none to set.
  const caps = (s: string) => (locale === "en" ? s.toUpperCase() : t(s));
  const business = bpIn(locale, "BP-BUSINESS");
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={GYM_FIELD} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader locale={locale} links={SITE_NAV.filter((l) => l.href !== "/company")} />
        <div className={PROSE_MEASURE}>
          <p className="mt-10 rounded-lg border border-dashed border-white/35 px-3 py-2 text-xs leading-relaxed text-muted">
            {t(C.COMPANY_LABEL)}
          </p>
          <p className={`mt-8 ${KICK}`}>{t(C.COMPANY_KICKER)}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight"><ZhTerms>{t(C.COMPANY_TITLE)}</ZhTerms></h1>

          <section className="mt-12">
            <h2 className={H2}><ZhTerms>{t(C.CASE_HEADING)}</ZhTerms></h2>
            <blockquote className="mt-4 border-l-2 border-white/30 pl-4 text-[17px] leading-relaxed text-neutral-100">
              {business.text}
              {/* The label, not the ID (2026-09-24, RT-1 a): "BP-BUSINESS" is the repository's
                  name for this statement and means nothing on the page; ASSUMED / EVIDENCED is
                  what tells a reader how far to trust it (N3). */}
              <span className="mt-2 block text-xs text-muted">{business.label}</span>
            </blockquote>
            <ul className={`mt-5 flex list-disc flex-col gap-2 pl-5 ${BODY}`}>
              {C.FIT_LINES.map((l) => (
                <li key={l}>{t(l)}</li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{t(C.METRICS_HEADING)}</h2>
            <p className={`mt-5 ${KICK}`}>{t("NORTH STAR")}</p>
            <ul className="mt-2">
              <MetricRow m={C.NORTH_STAR} t={t} />
            </ul>
            <p className={`mt-5 ${KICK}`}>{t("SUPPORTING")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {C.SUPPORTING.map((m) => (
                <MetricRow key={m.name} m={m} t={t} />
              ))}
            </ul>
            <p className={`mt-5 ${KICK}`}>{t("GUARDRAILS")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {C.GUARDRAILS.map((m) => (
                <MetricRow key={m.name} m={m} t={t} />
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{t(C.TEST_HEADING)}</h2>
            <p className={`mt-4 ${BODY}`}>{t(C.TEST_DESIGN)}</p>
            <p className={`mt-3 ${BODY}`}>{t(C.PRIMARY_METRIC)}</p>

            <p className={`mt-6 ${KICK}`}>{caps(C.ASSUMPTIONS_HEADING)}</p>
            <p className="mt-1 text-sm text-muted">{t(C.ASSUMPTIONS_NOTE)}</p>
            <dl className="mt-3 flex flex-col gap-3">
              {ASSUMPTIONS.map((a) => (
                <div key={a.id} className="rounded-xl border border-dashed border-white/20 p-4">
                  <dt className="text-sm text-neutral-100">
                    {rich(t("{label}: {value}"), {
                      label: t(a.label),
                      value: <span className="font-semibold">{t(a.shown)}</span>,
                    })}
                    <span className="ml-2 font-mono text-[0.6rem] font-bold tracking-[0.18em] text-muted">
                      {t("PLANNING ASSUMPTION")}
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-muted">{t(a.reason)}</dd>
                </div>
              ))}
            </dl>

            <p className={`mt-6 ${BODY}`}>{t(C.FORMULA_LEAD)}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/15 bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-neutral-200">
              {t(FORMULA)}
            </pre>
            <p className="mt-3 text-[17px] text-neutral-100">
              {rich(t("{from} → {to}: {count}"), {
                from: pctText(BASELINE.value),
                to: pctText(BASELINE.value + MIN_LIFT.value),
                count: <span className="font-semibold">{t("{n} visitors per arm", { n: fmt(PLAN.perArm) })}</span>,
              })}
            </p>
            <p className={`mt-3 ${BODY}`}>{t(C.OTHER_BASELINES_LEAD)}</p>
            <ul className="mt-1 text-sm text-neutral-300">
              {PLAN.others.map((o) => (
                <li key={o.baseline}>
                  {t("{from} → {to}: {count}", {
                    from: pctText(o.baseline),
                    to: pctText(o.baseline + MIN_LIFT.value),
                    count: t("{n} visitors per arm", { n: fmt(o.perArm) }),
                  })}
                </li>
              ))}
            </ul>

            <p className={`mt-6 ${KICK}`}>{caps(C.KILL_HEADING)}</p>
            <ul className={`mt-2 flex list-disc flex-col gap-2 pl-5 ${BODY}`}>
              {C.KILL_LINES.map((l) => (
                <li key={l}>{t(l)}</li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{t(C.STAKEHOLDERS_HEADING)}</h2>
            <div className="mt-5 flex flex-col gap-4">
              {C.STAKEHOLDERS.map((s) => (
                <article key={s.team} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className={KICK}>{caps(s.team)}</p>
                  <p className="mt-2 font-semibold text-neutral-100">{t(s.question)}</p>
                  <p className={`mt-2 ${BODY}`}>{t(s.answer)}</p>
                  {/* `s.cites` stays in the data and its test, not on the page (RT-1 a):
                      statement IDs are repository jargon to a reviewer, and BA-12 keeps the
                      process pitch in the repository and on /method. */}
                  {s.source ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {rich(t("{what}, {date}. {link}"), {
                        what: t(s.source.what),
                        date: t(s.source.date),
                        link: (
                          <a href={s.source.url} className="underline underline-offset-4" rel="noopener noreferrer">
                            {t("Source")}
                          </a>
                        ),
                      })}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <Link
            href={localHref(locale, "/reading")}
            className="mt-12 inline-flex min-h-[44px] items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-black"
          >
            {t(C.TRY_IT)}
          </Link>
        </div>
      </div>
    </main>
  );
}
