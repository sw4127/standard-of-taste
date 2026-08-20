import type { Metadata } from "next";
import Link from "next/link";
import { knownLimits, ladderLevels, familyUnit, STAIRCASE_RENDERED_AT } from "@/engine/staircase-manifest";
import { eligibleSources, isRetiredSource } from "@/engine/staircase-pool";
import { familyLabel, shortUnit } from "@/content/staircase/copy";
import { LIMIT_KIND_COPY, LIMIT_KIND_ORDER, RETIRED_SOURCE_NOTE } from "@/content/staircase/limits";

/**
 * WHAT THE INSTRUMENT CANNOT DO (E5/S7).
 *
 * THIS PAGE IS A CONDITION, NOT A FEATURE. PM ruling RT-85a accepted labelling
 * a lossy level in kbps — exact on every window by construction — ON CONDITION
 * that the damage variation behind that label be STATED rather than hidden. The
 * pipeline has been writing those statements into `staircase.json` since
 * 2026-08-19 and, until this page existed, nothing read them. Nine measured
 * limits sat in a file nobody could see, which makes the condition unmet and
 * the label unearned.
 *
 * EVERY SENTENCE HERE WAS WRITTEN BY THE THING THAT MEASURED IT. The statements
 * are rendered verbatim from the manifest, not re-worded here — a second
 * description of a measurement is a second thing to go stale, and this repo has
 * been bitten by that at the rung table, the window plan and the damage field.
 *
 * NO DATA-SOURCE BADGE, deliberately, and the same reasoning as Layer A on the
 * instrument-health page: these are acoustic measurements of audio files. There
 * are no respondents involved, so SIMULATED would be wrong and REAL would imply
 * a cohort that does not exist.
 */

export const metadata: Metadata = {
  title: "What this instrument cannot do — The Lab",
  description:
    "Every limit the clip pipeline measured in the threshold instrument and could not fix: rungs that are not separable, levels whose damage varies by passage, and the bottom of what the rulers can report.",
  alternates: { canonical: "/lab/instrument-limits" },
  openGraph: {
    title: "What this instrument cannot do — The Lab",
    description: "The measured limits of the threshold instrument, stated rather than hidden.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const GOLD = "hsl(42 80% 62%)";

export default function InstrumentLimits() {
  const all = knownLimits();
  const byKind = LIMIT_KIND_ORDER.map((kind) => ({
    kind,
    meta: LIMIT_KIND_COPY[kind],
    items: all.filter((l) => l.kind === kind),
  })).filter((g) => g.items.length > 0);

  // Anything the pipeline reports that this page has no section for. Rendered
  // rather than dropped: a limit nobody thought to categorise is exactly the
  // one that would vanish silently.
  const uncategorised = all.filter((l) => !LIMIT_KIND_ORDER.includes(l.kind));

  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">THE LAB · THRESHOLD INSTRUMENT</p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        What this instrument cannot do.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        Every ladder in the threshold test was measured against the audio it is made of, and{" "}
        <span className="text-white">{all.length} of those measurements came back imperfect</span>. They are
        listed here in the words of the pipeline that found them. None of them is a bug that was left
        unfixed — each one is a place where the physics of the material, not the code, sets a limit on
        what can be claimed.
      </p>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        This page exists because of a specific decision: compression levels are labelled in kilobits
        per second, which is exact on every passage, and that label was only allowed on the condition
        that the variation behind it be stated in public.
      </p>

      <p className="mt-6 text-xs text-muted">
        Pool rendered {STAIRCASE_RENDERED_AT}. Acoustic measurements of audio files — no respondents
        are involved, so there is no data-source badge on this page.
      </p>

      <LadderTable />

      <div className="mt-14 space-y-12">
        {byKind.map(({ kind, meta, items }) => (
          <section key={kind}>
            <h2 className="font-display text-2xl font-semibold tracking-tight">{meta.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{meta.blurb}</p>
            <ul className="mt-5 space-y-3">
              {items.map((l) => (
                <li
                  key={`${l.family}-${l.sourceId ?? ""}-${l.window ?? ""}-${l.level}-${l.kind}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-[0.6rem] font-bold tracking-[0.25em]" style={{ color: GOLD }}>
                    {familyLabel(l.family).toUpperCase()}
                    {l.sourceId ? ` · ${l.sourceId}` : ""}
                    {l.window ? ` · ${l.window}` : ""}
                    {l.level !== undefined ? ` · ${l.level} ${shortUnit(familyUnit(l.family))}` : ""}
                  </p>
                  {/* Verbatim from the manifest. Not re-worded here — see the header. */}
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{l.statement}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {uncategorised.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Other measured limits</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Reported by the pipeline in a category this page does not yet explain.
            </p>
            <ul className="mt-5 space-y-3">
              {uncategorised.map((l) => (
                <li key={l.statement} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[0.6rem] font-bold tracking-[0.25em] text-muted">{l.kind}</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">{l.statement}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">A source we do not present</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{RETIRED_SOURCE_NOTE}</p>
      </section>

      <p className="mt-14 text-sm text-muted">
        <Link href="/lab" className="transition hover:text-white" style={{ color: GOLD }}>
          Back to the Lab
        </Link>
      </p>
    </div>
  );
}

/**
 * The ladders themselves, so a reader can see what the limits are limits ON.
 * Generated from the manifest rather than transcribed.
 */
function LadderTable() {
  const rows: Array<{ label: string; unit: string; levels: number[]; retired?: boolean }> = [
    { label: "Pitch drift", unit: familyUnit("pitch-drift"), levels: ladderLevels("pitch-drift") },
    { label: "Timing smear", unit: familyUnit("timing-smear"), levels: ladderLevels("timing-smear") },
    ...eligibleSources("lossy-artifact", true).map((s) => ({
      label: `Compression · ${s}`,
      unit: familyUnit("lossy-artifact"),
      levels: ladderLevels("lossy-artifact", s),
      retired: isRetiredSource("lossy-artifact", s),
    })),
  ];

  return (
    <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[0.6rem] font-bold tracking-[0.25em] text-muted">
            <th className="px-4 py-3">LADDER</th>
            <th className="px-4 py-3">UNIT</th>
            <th className="px-4 py-3">RUNGS, GENTLEST FIRST</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-white/5 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 font-semibold">
                {r.label}
                {r.retired ? <span className="ml-2 text-[0.6rem] tracking-widest text-muted">NOT PRESENTED</span> : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{shortUnit(r.unit)}</td>
              <td className="px-4 py-3 font-mono text-xs tabular-nums text-neutral-300">{r.levels.join(" · ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
