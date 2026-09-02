import type { Metadata } from "next";
import Jump from "@/components/Jump";
import { FALSIFIED } from "@/content/lab/falsified";
import { GYM_INK } from "@/content/instrument-accents";

/**
 * THE REGISTRY OF FALSIFIED HYPOTHESES (E15/S7, Track J2).
 *
 * The Lab was planned with a panel of running experiments. There are none —
 * there is no traffic to run them on — so that panel would have been a form
 * with nothing in it. This is the true version of the same idea: everything
 * this project believed, tested, and had to abandon.
 *
 * NO DATA-SOURCE BADGE. These are decisions and the evidence behind them, not
 * measurements of respondents; each entry carries its own citation instead.
 *
 * THE COMPLETENESS CLAIM IS ON THE PAGE, because it is the only thing that
 * makes a self-reported failure list worth reading. It is enforced by
 * `falsified.test.ts`, which parses the record out of `docs/` — see that file.
 */

export const metadata: Metadata = {
  title: "Falsified — The Lab",
  description:
    "Everything this project believed, tested, and had to abandon — each with the measurement that killed it, what shipped instead, and the citation you can check.",
  alternates: { canonical: "/lab/falsified" },
  openGraph: {
    title: "Falsified — The Lab",
    description: "Everything this project believed, tested, and had to abandon.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const INK = GYM_INK;

export default function Falsified() {
  // Newest first: a reader who stops after three entries should see the most
  // recent thinking, not the oldest.
  const entries = [...FALSIFIED].sort((a, b) => b.date.localeCompare(a.date));
  const measured = entries.filter((e) => e.kind === "measured").length;
  const guarded = entries.filter((e) => e.guard).length;

  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">
        THE LAB · FALSIFIED
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        Things this project believed that turned out to be wrong.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        The Lab was planned with a panel of running experiments — each with its hypothesis and
        stopping rule written down before it ran. There are none, because there is nobody to run
        them on. This is the true version of the same page: not what we intend to test, but what we
        tested and had to give up.
      </p>

      {/* The completeness claim is the only thing that makes a self-reported
          list of failures worth reading, so it is stated first, with the
          mechanism, rather than being implied. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: INK }}>
          WHY THIS LIST IS NOT CURATED
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          A list of your own mistakes is worth nothing if you chose which ones to print — that is
          the same selection bias the Prestige Test exists to measure, committed on the page that
          boasts about catching it. So this page is not written by hand. Every belief recorded as
          falsified in this project&apos;s engineering record appears here, and an automated check
          reads that record and fails the build if one is missing. Dropping an embarrassing entry
          is not something a future session can do quietly.
        </p>
        <p className="mt-3 font-mono text-[0.6rem] tracking-[0.15em] text-muted">
          {entries.length} ENTRIES · {measured} KILLED BY MEASUREMENT · {guarded} STILL GUARDED BY A
          TEST
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-mono text-[0.6rem] tracking-[0.18em] text-muted">{entry.date}</p>
              <p className="font-mono text-[0.6rem] tracking-[0.18em] text-muted">
                {entry.kind === "measured" ? "KILLED BY MEASUREMENT" : "KILLED BY ARGUMENT"}
              </p>
            </div>

            {/* The belief is set as the claim it was, in quotation marks and in
                the product's display face — a reader should be able to feel
                that somebody meant it. */}
            {entry.beliefs.map((belief) => (
              <p
                key={belief}
                className="mt-2 font-display text-lg font-semibold leading-snug text-neutral-100"
              >
                &ldquo;{belief}&rdquo;
              </p>
            ))}

            <dl className="mt-4 flex flex-col gap-3">
              <div>
                <dt className="text-[0.6rem] font-bold tracking-[0.2em]" style={{ color: INK }}>
                  WHAT KILLED IT
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-neutral-300">{entry.killedBy}</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-bold tracking-[0.2em] text-muted">
                  WHAT HAPPENED INSTEAD
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{entry.consequence}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3">
              {entry.sources.map((source) => (
                <code key={source.path} className="font-mono text-[0.6rem] text-muted">
                  {source.path}
                </code>
              ))}
              {entry.guard && (
                <code className="font-mono text-[0.6rem]" style={{ color: INK }}>
                  guarded by {entry.guard}
                </code>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-14 text-sm text-muted">
        <Jump href="/lab" accent={INK}>Back to the Lab</Jump>
      </p>
    </div>
  );
}
