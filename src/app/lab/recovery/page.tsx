import type { Metadata } from "next";
import Link from "next/link";
import ScatterPlot from "@/components/lab/ScatterPlot";
import SourceBadge from "@/components/lab/SourceBadge";
import { assignBiasParams, syntheticDelicacyItems } from "@/analytics/simulate";
import { recoveryScatter, runRecovery, type RecoveryPoint } from "@/analytics/recovery";
import { BIAS_CLIPS } from "@/content/bias/items";
import { PRESTIGE_GOLD } from "@/content/instrument-accents";

/**
 * Parameter-recovery panel (artifact pivot §2/§4).
 *
 * Everything on this page is COMPUTED AT BUILD TIME by the same functions the
 * test suite runs — not copied from a test log, not stored in a JSON that can
 * drift. The seed is fixed, so the page is deterministic and reproducible: the
 * numbers a reader sees are the numbers `npx vitest run src/analytics` prints.
 *
 * Cost: ~2s of build time. Worth it — the alternative is a materialized
 * artifact that can silently disagree with the code it claims to describe.
 */

export const metadata: Metadata = {
  title: "Parameter recovery — The Lab",
  description:
    "Does the estimator return the parameters that generated the data? Known-vs-estimated item difficulty across sample sizes, with error decomposed into sampling noise and systematic bias.",
  alternates: { canonical: "/lab/recovery" },
  openGraph: {
    title: "Parameter recovery — The Lab",
    description: "Validating the estimator by parameter recovery, before fielding it.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const GOLD = PRESTIGE_GOLD;
const SEED = 4001;
const REPS = 20;
const SAMPLE_SIZES = [50, 200, 1000];
const ITEMS = syntheticDelicacyItems(77, 40);
const BIAS_ITEMS = assignBiasParams(BIAS_CLIPS, 7);

/**
 * The test-length demonstration: same cohort size, different test lengths.
 * Computed rather than quoted — a hardcoded "r = 0.62" in the copy is exactly
 * the drift risk the rest of this page is built to avoid.
 */
const LENGTH_DEMO_N = 400;
const LENGTH_DEMO = [10, 60].map((k) => ({
  trials: k,
  r: runRecovery({
    seed: 909,
    sampleSizes: [LENGTH_DEMO_N],
    reps: 10,
    delicacyItems: syntheticDelicacyItems(77, k),
    biasItems: BIAS_ITEMS,
  }).points[0].thetaCorrelation,
}));

const num = (x: number | null, dp = 3) => (x === null ? "n/a" : x.toFixed(dp));

function TableRow({ p }: { p: RecoveryPoint }) {
  return (
    <tr className="border-t border-white/10">
      <td className="py-2 pr-4 font-mono text-neutral-200">{p.n}</td>
      <td className="py-2 pr-4 font-mono text-neutral-400">{p.reps}</td>
      <td className="py-2 pr-4 font-mono text-neutral-200">{num(p.itemPCorrelation)}</td>
      <td className="py-2 pr-4 font-mono" style={{ color: GOLD }}>{num(p.itemPRmse)}</td>
      <td className="py-2 pr-4 font-mono text-neutral-200">{num(p.discriminationCorrelation)}</td>
      <td className="py-2 pr-4 font-mono text-neutral-200">{num(p.thetaCorrelation)}</td>
      <td className="py-2 pr-4 font-mono text-neutral-200">{num(p.alpha)}</td>
      <td className="py-2 pr-4 font-mono text-neutral-400">{num(p.trueReliability)}</td>
      <td className="py-2 pr-4 font-mono text-neutral-200">{num(p.meanBetaSe)}</td>
      <td className="py-2 font-mono text-neutral-200">{num(p.meanBetaBias)}</td>
    </tr>
  );
}

export default function RecoveryPanel() {
  const report = runRecovery({
    seed: SEED,
    sampleSizes: SAMPLE_SIZES,
    reps: REPS,
    delicacyItems: ITEMS,
    biasItems: BIAS_ITEMS,
  });
  const scatters = SAMPLE_SIZES.map((n) => ({ n, points: recoveryScatter(SEED + n, n, ITEMS) }));
  const best = report.points[report.points.length - 1];
  const worst = report.points[0];

  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">
        <Link href="/lab" className="transition hover:text-white">
          THE LAB
        </Link>{" "}
        / PARAMETER RECOVERY
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Does the estimator work?
        </h1>
        <SourceBadge source="SIMULATED" />
      </div>

      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        You cannot check an estimator against real data, because with real data nobody knows the
        right answer. So you generate responses from parameters you chose yourself, hide them, and
        see whether the estimator finds its way back. Error should shrink as the sample grows. If it
        does not, the problem is the code — and you learn that <em>before</em> you put the
        instrument in front of anyone.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5">
        <p className="text-sm leading-relaxed text-neutral-300">
          <strong className="font-semibold text-white">What this does not prove.</strong>{" "}
          Recovering
          an item&rsquo;s difficulty here shows only that the arithmetic returns what was put in. It
          is not evidence about any real listener, it says nothing about whether a degradation is
          audible, and if real responses do not behave like this model — they will not, exactly —
          the estimates inherit that mismatch. Recovery bounds implementation error, not model
          error.
        </p>
      </div>

      {/* ------------------------------------------------------------ scatter */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Known vs. estimated item difficulty
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Each dot is one of {ITEMS.length} items. The dashed line is perfect recovery. The cloud
          should tighten onto it as the cohort grows — and it should stay <em>centred</em> on it,
          because a cloud sitting parallel to the line would mean bias rather than noise.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {scatters.map(({ n, points }) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <ScatterPlot
                points={points.map((p) => ({
                  x: p.trueP,
                  y: p.estimatedP,
                  label: `${p.itemId}: true ${p.trueP.toFixed(3)}, estimated ${p.estimatedP.toFixed(3)}`,
                }))}
                domain={[0.5, 1]}
                xLabel="known p"
                yLabel="estimated p"
                caption={`n = ${n}`}
                ariaLabel={`Scatter plot of estimated against known item difficulty for ${points.length} items at a sample size of ${n}. Root mean squared error ${num(
                  report.points.find((p) => p.n === n)!.itemPRmse,
                )}.`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- table */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">The recovery table</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {REPS} independent replications per row — a single cohort at n=50 can beat a single cohort
          at n=1000 on luck alone, so every figure is an average over repeated draws.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <table className="w-full min-w-[52rem] text-left text-xs">
            <thead>
              <tr className="font-mono text-[0.6rem] tracking-[0.15em] text-muted">
                <th className="pb-2 pr-4 font-normal">N</th>
                <th className="pb-2 pr-4 font-normal">REPS</th>
                <th className="pb-2 pr-4 font-normal">r(p)</th>
                <th className="pb-2 pr-4 font-normal">RMSE(p)</th>
                <th className="pb-2 pr-4 font-normal">r(a)</th>
                <th className="pb-2 pr-4 font-normal">r(θ)</th>
                <th className="pb-2 pr-4 font-normal">α</th>
                <th className="pb-2 pr-4 font-normal">TRUE REL</th>
                <th className="pb-2 pr-4 font-normal">SE(β̄)</th>
                <th className="pb-2 font-normal">BIAS(β̄)</th>
              </tr>
            </thead>
            <tbody>
              {report.points.map((p) => (
                <TableRow key={p.n} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ----------------------------------------------------------- findings */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">What the table says</h2>
        <div className="mt-5 flex flex-col gap-3">
          <Finding title="The estimator recovers item difficulty.">
            RMSE falls from {num(worst.itemPRmse)} at n={worst.n} to {num(best.itemPRmse)} at n=
            {best.n}, with a correlation of {num(best.itemPCorrelation)} against the known values.
            Reliability (α = {num(best.alpha)}) lands within{" "}
            {num(Math.abs(best.alpha! - best.trueReliability))}{" "}
            of the model&rsquo;s true reliability. This is the column that says the arithmetic is
            right.
          </Finding>
          <Finding title="More respondents will not sharpen an individual's score.">
            Per-person error is set by how many trials that person answered, not by how many other
            people took the test. Sample size buys item statistics and cohort precision; test length
            buys individual precision. They are different currencies, and the table keeps them in
            different columns. At a fixed cohort of {LENGTH_DEMO_N}, lengthening the delicacy test
            from {LENGTH_DEMO[0].trials} trials to {LENGTH_DEMO[1].trials} lifts ability recovery
            from r = {num(LENGTH_DEMO[0].r, 2)} to r = {num(LENGTH_DEMO[1].r, 2)} — the same effort
            spent where it actually works.
          </Finding>
          <Finding title="And more respondents will not fix the instrument's bias.">
            SE(β̄) — sampling noise — falls from {num(worst.meanBetaSe)} to {num(best.meanBetaSe)} as
            the cohort grows. BIAS(β̄) does not: it sits at roughly {num(best.meanBetaBias)} points at
            every sample size, because the prestige instrument systematically <em>understates</em>{" "}
            susceptibility. Anchoring and the scale ceiling both push the same direction. Recruiting
            ten thousand people would not move it; only a design change would.
          </Finding>
        </div>
      </section>

      <p className="mt-12 max-w-2xl text-xs leading-relaxed text-muted">
        Computed at build time by <code className="font-mono">src/analytics/recovery.ts</code> with
        seed {SEED}; the item bank is {ITEMS.length} synthetic trials with drawn discrimination and
        difficulty. These are the same functions the test suite runs, so the figures above and the
        assertions in <code className="font-mono">src/analytics/recovery.test.ts</code> cannot
        disagree.
      </p>
    </div>
  );
}

function Finding({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300">{children}</p>
    </article>
  );
}
