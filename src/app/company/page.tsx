import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import FluidField from "@/components/FluidField";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";
import { bp } from "@/content/blueprint";
import { SITE_NAV } from "@/content/site-nav";
import * as C from "@/content/company/copy";
import { ASSUMPTIONS, FORMULA, PLAN, fmt, pctText, MIN_LIFT, BASELINE } from "@/content/company/plan";

/**
 * THE COMPANY VIEW (blueprint Part 6; BA-9, BA-12; BP-BUSINESS, BP-GOAL).
 *
 * Why a fictional streaming company would build the reading, how it would
 * measure it, and what five of its departments would ask. Labelled at the top,
 * because nothing on it was measured: the company does not exist, and every
 * number is a planning assumption or computed from one (`company.test.ts`).
 */

export const metadata: Metadata = {
  title: "The company view — Standard of Taste",
  description:
    "Illustrative: why a fictional streaming service would build the reading, the metrics it would watch, and the A/B test that would decide it.",
  alternates: { canonical: "/company" },
};

const H2 = "font-display text-2xl font-semibold";
const KICK = "text-[0.65rem] font-bold tracking-[0.3em] text-muted";
const BODY = "text-[15px] leading-relaxed text-neutral-300";

function MetricRow({ m }: { m: C.Metric }) {
  return (
    <li className="rounded-xl border border-white/10 p-4">
      <p className="font-semibold text-neutral-100">{m.name}</p>
      <p className="mt-1 text-sm text-neutral-300">{m.definition}</p>
      <p className="mt-1 text-sm text-muted">{m.why}</p>
    </li>
  );
}

export default function CompanyPage() {
  const business = bp("BP-BUSINESS");
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={GYM_FIELD} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader links={SITE_NAV.filter((l) => l.href !== "/company")} />
        <div className={PROSE_MEASURE}>
          <p className="mt-10 rounded-lg border border-dashed border-white/35 px-3 py-2 text-xs leading-relaxed text-muted">
            {C.COMPANY_LABEL}
          </p>
          <p className={`mt-8 ${KICK}`}>{C.COMPANY_KICKER}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">{C.COMPANY_TITLE}</h1>

          <section className="mt-12">
            <h2 className={H2}>{C.CASE_HEADING}</h2>
            <blockquote className="mt-4 border-l-2 border-white/30 pl-4 text-[17px] leading-relaxed text-neutral-100">
              {business.text}
              <span className="mt-2 block text-xs text-muted">BP-BUSINESS · {business.label}</span>
            </blockquote>
            <ul className={`mt-5 flex list-disc flex-col gap-2 pl-5 ${BODY}`}>
              {C.FIT_LINES.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{C.METRICS_HEADING}</h2>
            <p className={`mt-5 ${KICK}`}>NORTH STAR</p>
            <ul className="mt-2">
              <MetricRow m={C.NORTH_STAR} />
            </ul>
            <p className={`mt-5 ${KICK}`}>SUPPORTING</p>
            <ul className="mt-2 flex flex-col gap-2">
              {C.SUPPORTING.map((m) => (
                <MetricRow key={m.name} m={m} />
              ))}
            </ul>
            <p className={`mt-5 ${KICK}`}>GUARDRAILS</p>
            <ul className="mt-2 flex flex-col gap-2">
              {C.GUARDRAILS.map((m) => (
                <MetricRow key={m.name} m={m} />
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{C.TEST_HEADING}</h2>
            <p className={`mt-4 ${BODY}`}>{C.TEST_DESIGN}</p>
            <p className={`mt-3 ${BODY}`}>{C.PRIMARY_METRIC}</p>

            <p className={`mt-6 ${KICK}`}>{C.ASSUMPTIONS_HEADING.toUpperCase()}</p>
            <p className="mt-1 text-sm text-muted">{C.ASSUMPTIONS_NOTE}</p>
            <dl className="mt-3 flex flex-col gap-3">
              {ASSUMPTIONS.map((a) => (
                <div key={a.id} className="rounded-xl border border-dashed border-white/20 p-4">
                  <dt className="text-sm text-neutral-100">
                    {a.label}: <span className="font-semibold">{a.shown}</span>
                    <span className="ml-2 font-mono text-[0.6rem] font-bold tracking-[0.18em] text-muted">
                      PLANNING ASSUMPTION
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-muted">{a.reason}</dd>
                </div>
              ))}
            </dl>

            <p className={`mt-6 ${BODY}`}>{C.FORMULA_LEAD}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/15 bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-neutral-200">
              {FORMULA}
            </pre>
            <p className="mt-3 text-[17px] text-neutral-100">
              {pctText(BASELINE.value)} → {pctText(BASELINE.value + MIN_LIFT.value)}:{" "}
              <span className="font-semibold">{fmt(PLAN.perArm)} visitors per arm</span>
            </p>
            <p className={`mt-3 ${BODY}`}>{C.OTHER_BASELINES_LEAD}</p>
            <ul className="mt-1 text-sm text-neutral-300">
              {PLAN.others.map((o) => (
                <li key={o.baseline}>
                  {pctText(o.baseline)} → {pctText(o.baseline + MIN_LIFT.value)}: {fmt(o.perArm)} visitors per arm
                </li>
              ))}
            </ul>

            <p className={`mt-6 ${KICK}`}>{C.KILL_HEADING.toUpperCase()}</p>
            <ul className={`mt-2 flex list-disc flex-col gap-2 pl-5 ${BODY}`}>
              {C.KILL_LINES.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className={H2}>{C.STAKEHOLDERS_HEADING}</h2>
            <div className="mt-5 flex flex-col gap-4">
              {C.STAKEHOLDERS.map((s) => (
                <article key={s.team} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className={KICK}>{s.team.toUpperCase()}</p>
                  <p className="mt-2 font-semibold text-neutral-100">{s.question}</p>
                  <p className={`mt-2 ${BODY}`}>{s.answer}</p>
                  <p className="mt-2 text-xs text-muted">Serves {s.cites}</p>
                  {s.source ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {s.source.what}, {s.source.date}.{" "}
                      <a href={s.source.url} className="underline underline-offset-4" rel="noopener noreferrer">
                        Source
                      </a>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <Link
            href="/reading"
            className="mt-12 inline-flex min-h-[44px] items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-black"
          >
            {C.TRY_IT}
          </Link>
        </div>
      </div>
    </main>
  );
}
