import type { Metadata } from "next";
import Link from "next/link";
import SourceBadge from "@/components/lab/SourceBadge";
import { METRICS, type MetricDefinition } from "@/content/lab/metrics";
import { LAB_PANELS, LIVE_PANELS, PENDING_PANELS } from "@/content/lab/panels";
import { FUNNEL_SPEC, sessionsForPrecision, stepTrigger } from "@/content/lab/funnel-spec";
import { GYM_INK } from "@/content/instrument-accents";

/**
 * The Lab index (artifact pivot §4) — the analytics surface, in the product,
 * public. S3 ships the shell plus ONE live panel: the metric dictionary.
 *
 * Deliberately NOT shipping empty chrome for the five pending panels. A grid of
 * hollow cards would look like a dashboard and prove nothing, which is the
 * theater N2 exists to stop. Pending work is listed as a roadmap, named by the
 * slice that builds it, so the claim stays checkable.
 */

export const metadata: Metadata = {
  title: "The Lab — The Taste Gym",
  description:
    "The measurement layer, in the open: every metric defined with its formula, owner, acceptance band, and caveat — plus the provenance of every number shown.",
  alternates: { canonical: "/lab" },
  openGraph: {
    title: "The Lab — The Taste Gym",
    description: "Every metric this product computes, defined in the open — formula, owner, target, caveat.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

/* The Lab belongs to no instrument (RT-AG, RT-AR:a). */
const INK = GYM_INK;

/**
 * DERIVED, NOT TYPED. The funnel specification wants to say that nothing here
 * rests on real responses, and a hand-written "0" would be a claim nobody
 * checks — the exact defect E15/S1 removed from three other pages. This counts
 * the page's own badges instead, so the sentence disappears by itself on the
 * day a panel is fielded.
 */
const REAL_PANELS = LAB_PANELS.filter((p) => p.dataSource === "REAL").length;

const OWNER_LABEL: Record<MetricDefinition["owner"], string> = {
  instrument: "Instrument",
  psychometrics: "Psychometrics",
  ops: "Ops",
};

/** What each owner is accountable for — the KPI tree's second level. */
const OWNER_BLURB: Record<MetricDefinition["owner"], string> = {
  instrument: "What a single session measures about one person.",
  psychometrics: "Whether the instrument and the estimator can be trusted at all.",
  ops: "Whether enough people have been through it to say anything.",
};

/** Group the dictionary by owner so it reads as a structure, not a list. */
const OWNER_ORDER: MetricDefinition["owner"][] = ["instrument", "psychometrics", "ops"];

export default function LabIndex() {
  const grouped = OWNER_ORDER.map((owner) => ({
    owner,
    metrics: METRICS.filter((m) => m.owner === owner),
  })).filter((g) => g.metrics.length > 0);

  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">THE LAB</p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        The measurement layer, with the lid off.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        Most products show you a score and hide the machine. This page is the machine. Every number
        the gym computes is defined here — the formula, who owns it, what good would look like, and
        the caveat that has to travel with it. Where a number has no defensible target yet, it says
        so instead of inventing one.
      </p>

      {/* The honesty notice is not a footnote. It is the first thing that
          establishes what kind of page this is. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SourceBadge source="SIMULATED" />
          <SourceBadge source="REAL" />
          <SourceBadge source="MIXED" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-300">
          Every panel that shows data carries one of these badges. Right now the instrument has
          never been fielded, so <strong className="font-semibold text-white">no real cohort
          exists</strong> and nothing here is a percentile. Numbers generated from a known model to
          validate the pipeline are labelled <span className="font-mono text-xs">SIMULATED</span>{" "}
          wherever they appear. When real responses arrive they flow through the identical
          pipeline — the only thing that changes is the badge.
        </p>
      </div>

      {/* ------------------------------------------------------- live panels */}
      {LIVE_PANELS.some((p) => p.href) && (
        <section className="mt-14" aria-labelledby="panels">
          <h2 id="panels" className="font-display text-2xl font-semibold tracking-tight">
            Panels
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {LIVE_PANELS.filter((p) => p.href).map((p) => (
              <Link
                key={p.id}
                href={p.href!}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-[hsl(225_8%_90%)]">
                    {p.title}
                  </h3>
                  {p.dataSource && <SourceBadge source={p.dataSource} />}
                </div>
                <p className="mt-1.5 text-sm text-muted">{p.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ live panel: dictionary */}
      <section className="mt-14" aria-labelledby="metric-dictionary">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="metric-dictionary" className="font-display text-2xl font-semibold tracking-tight">
            Metric dictionary
          </h2>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-muted">
            {METRICS.length} METRICS · {grouped.length} OWNERS
          </p>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {LAB_PANELS[0].blurb}
        </p>

        {/* The index. Sixteen definitions is reference material, and reference
            material without a way in is hostile — this is the KPI tree at a
            glance, and it is what makes the cards below anchor targets rather
            than a scroll. */}
        <nav aria-label="Metric index" className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {grouped.map((group) => (
            <div key={group.owner}>
              <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: INK }}>
                {OWNER_LABEL[group.owner].toUpperCase()}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{OWNER_BLURB[group.owner]}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {group.metrics.map((m) => (
                  <li key={m.id}>
                    <a
                      href={`#metric-${m.id}`}
                      className="group flex items-baseline justify-between gap-3 text-[13px] text-neutral-300 transition hover:text-white"
                    >
                      <span className="underline-offset-4 group-hover:underline">{m.label}</span>
                      <span className="shrink-0 font-mono text-[0.6rem] text-muted">
                        {m.target ? "▸" : "—"}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="mt-5 font-mono text-[0.6rem] tracking-[0.15em] text-muted">
          ▸ HAS AN ACCEPTANCE TARGET · — NO DEFENSIBLE TARGET YET
        </p>

        {grouped.map((group) => (
          <div key={group.owner} className="mt-12">
            <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: INK }}>
              {OWNER_LABEL[group.owner].toUpperCase()}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {group.metrics.map((m) => (
                <article
                  key={m.id}
                  id={`metric-${m.id}`}
                  // scroll-mt keeps the heading clear of the viewport edge when
                  // jumped to from the index.
                  className="scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition target:border-white/30"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-lg font-semibold">{m.label}</h3>
                    <code className="font-mono text-[0.6rem] tracking-[0.15em] text-muted">{m.id}</code>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{m.definition}</p>

                  {/* Wide content scrolls inside its own box — the page body
                      must never scroll sideways on a phone. */}
                  <div className="mt-3 overflow-x-auto">
                    <code className="block whitespace-pre rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-neutral-200">
                      {m.formula}
                    </code>
                  </div>

                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                    <div className="flex gap-1.5">
                      <dt className="text-muted">Target</dt>
                      <dd className={m.target ? "text-neutral-200" : "text-muted italic"}>
                        {m.target ?? "none defensible yet"}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted">Unit</dt>
                      <dd className="text-neutral-200">{m.unit}</dd>
                    </div>
                    <div className="flex min-w-0 gap-1.5">
                      <dt className="text-muted">Computed in</dt>
                      <dd className="truncate font-mono text-[0.7rem] text-neutral-200">{m.computedIn}</dd>
                    </div>
                  </dl>

                  {m.caveat && (
                    <p className="mt-3 border-l-2 border-white/15 pl-3 text-xs leading-relaxed text-muted">
                      {m.caveat}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ---------------------------------------------------------- roadmap */}
      <section className="mt-16" aria-labelledby="pending">
        <h2 id="pending" className="font-display text-2xl font-semibold tracking-tight">
          Not built yet
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Listed rather than mocked up. An empty panel is not a panel — and a date is not a
          reason, so each of these says what is actually in the way.
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {PENDING_PANELS.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-dashed border-white/10 px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-base font-semibold text-neutral-300">
                  {p.title}
                </span>
                {p.plannedIn && (
                  <span className="font-mono text-[0.6rem] tracking-[0.18em] text-muted">
                    {p.plannedIn}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{p.blurb}</p>
              {/* The reason is the point of this list, so it is set apart from
                  the description rather than trailing it as an aside. */}
              <p className="mt-2 border-l-2 border-white/15 pl-3 text-xs leading-relaxed text-neutral-300">
                {p.absent}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------- the funnel, specified */}
      {/*
        PM ruling RT-J, re-framed. He rejected both offered options — an empty
        panel and a plain "it waits on traffic" — the first because it claims
        data exists, the second because it demonstrates nothing. This is the
        third thing: the specification, which needs no respondents and is the
        part of the work a reader of this page is actually assessing.

        NOTHING HERE IS A RATE. No counts, no percentages, no chart. The panel
        stays unbuilt; this is what it would be.
      */}
      <section className="mt-16" aria-labelledby="funnel-spec">
        <h2 id="funnel-spec" className="font-display text-2xl font-semibold tracking-tight">
          The funnel, specified
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The panel above is not built, so here is what it would be. Every step names the event it
          would be counted from, and each description is the one the code&apos;s own event registry
          carries — not a second copy written here, which would be free to drift from what actually
          fires.
        </p>

        <ol className="mt-6 flex flex-col gap-px overflow-hidden rounded-2xl border border-white/10">
          {FUNNEL_SPEC.map((step, i) => (
            <li
              key={step.event}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-white/[0.03] px-4 py-3"
            >
              <span className="font-mono text-[0.6rem] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-sm font-semibold text-neutral-200">
                {step.label}
              </span>
              <code className="font-mono text-[0.65rem]" style={{ color: INK }}>
                {step.event}
              </code>
              <span className="w-full text-xs leading-relaxed text-muted sm:w-auto sm:flex-1">
                {stepTrigger(step)}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: INK }}>
            WHAT IT WOULD TAKE
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            A step&apos;s rate cannot be published until it can be estimated. At the worst case for
            a proportion — a rate near half, where the uncertainty is largest — one step needs{" "}
            <strong className="font-semibold text-white">
              {sessionsForPrecision(5)} sessions reaching it
            </strong>{" "}
            before its rate is known to within five percentage points, and{" "}
            {sessionsForPrecision(10)} to within ten. Those are requirements per step, not for the
            funnel: the last step is the expensive one.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            How many arrivals it takes to put {sessionsForPrecision(5)} people at the bottom depends
            on the pass-through between steps, which has never been measured here — so this page
            does not estimate it. {REAL_PANELS === 0 ? "No panel on this page carries a REAL badge." : null}
          </p>
        </div>
      </section>
    </div>
  );
}
