import type { Metadata } from "next";
import Link from "next/link";
import {
  METHOD_AS_OF,
  METHOD_FINDINGS,
  METHOD_SECTIONS,
  METHOD_REFUSALS,
  sectionClaims,
  type ClaimSource,
} from "@/content/method/claims";

/**
 * `/method` — how this project is run, with the product as its evidence
 * (E9/S5, Track E; approved RT-158a / RT-159a, organised per blueprint E2).
 *
 * WHAT MAKES THIS PAGE DIFFERENT FROM AN "ABOUT" PAGE. Nothing here is asserted
 * in free prose. Every block comes from `src/content/method/claims.ts`, where it
 * carries the document it rests on and a passage inside that document, and
 * `claims.test.ts` opens the document on every test run to check the passage is
 * still there. If a source is reworded, this page fails the build rather than
 * quietly becoming untrue.
 *
 * INFERENCE IS MARKED IN THE MARKUP, NOT JUST IN THE DATA (RT-159a). An entry
 * whose `kind` is "inferred" renders under a visible label saying the reading is
 * the engineer's rather than the record's. That condition is the reason the page
 * was approved, so the marking is structural: it comes from the same field the
 * test pins, and there is no way to render an inferred entry without it.
 *
 * PATHS ARE NOT LINKS, deliberately. Naming a file is checkable by anyone with
 * the repository; linking to a line on a public host is a claim about a URL, and
 * this repository's own record includes a research memo in which four of eleven
 * cited repositories returned 404. Nothing on this page can 404.
 */

export const metadata: Metadata = {
  title: "The method — The Taste Gym",
  description:
    "How this project is run: the rules it refuses work under, what each refusal cost, and the worst finding it has recorded against itself. Every claim cites a document in the repository.",
  alternates: { canonical: "/method" },
  openGraph: {
    title: "The method — The Taste Gym",
    description:
      "The rules, the refusals, the price each one carried, and the finding this project recorded against itself.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const GOLD = "hsl(42 80% 62%)";

/**
 * The documents a block rests on, named so a reader can open them.
 *
 * FULL OPACITY, NOT `text-muted/80` (E9/S7, measured on the rendered page).
 * At 80% these came out at **4.37:1** against the page background — under the
 * 4.5:1 WCAG AA floor for 11px text, and that figure is the optimistic bound,
 * because the ambient field paints gold over the base and lightens it further.
 * On a page whose entire proposition is that a reader can go and check the
 * sources, the citations were the least readable thing on it. Full opacity
 * measures 6.33:1, and it is the lowest ratio anywhere on the page.
 */
function Sources({ sources }: { sources: ClaimSource[] }) {
  const paths = [...new Set(sources.map((s) => s.path))];
  return (
    <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
      {paths.map((p, i) => (
        <span key={p}>
          {i > 0 ? " · " : ""}
          {p}
        </span>
      ))}
    </p>
  );
}

/**
 * The inference label. Rendered from `kind`, never hand-placed — a marking that
 * an author has to remember to add is a marking that will one day be missing
 * from the paragraph that most needed it.
 *
 * IT GOES ABOVE THE PASSAGE, NOT BELOW IT (E9/S5, found by reading the rendered
 * page). It was under the text on the first render, which meant a reader took
 * the whole inference as record and was told afterwards. A disclosure that
 * arrives after the thing it qualifies is not a disclosure.
 *
 * AND IT DOES NOT SAY "MY" (same read). On a page with no byline — RT-V(a)
 * ruled role, not name — "my reading" leaves the reader guessing whose. The
 * label names the role, which is the thing that makes it weigh less than a
 * quotation.
 */
function InferenceMark() {
  return (
    <p className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[hsl(28_75%_66%)]">
      Inference — the engineer&apos;s reading, not a recorded ruling
    </p>
  );
}

export default function MethodPage() {
  return (
    <article>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">
        THE HOUSE RULES · HOW THIS IS RUN
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        What this project refused, and what each refusal cost.
      </h1>

      <div className="mt-7 space-y-5 text-[15px] leading-relaxed text-neutral-300">
        <p>
          The instruments on this site are the visible part. The part worth reading about is the
          operating model that produced them — a written constitution, two review protocols, and a
          decision record that has repeatedly deleted finished work for being untrue rather than for
          being broken.
        </p>
        <p>
          Any project can list what it built. This page lists what it <em>refused</em>, because a
          refusal is the only decision with a verifiable cost attached, and because a page of things
          that went well is a brochure. Each block below names the document it comes from. Those
          documents are in the repository, and a test opens every one of them on every run to check
          the quoted passage is still there — if a source is reworded, this page fails the build
          instead of quietly becoming false.
        </p>
      </div>

      {/* The operating model, in the ruled reader order (blueprint E1). The
          order is data, not the order these blocks happen to be typed in —
          see METHOD_SECTIONS and the test that pins it. */}
      {METHOD_SECTIONS.map((section) => (
        <section key={section.id} className="mt-14">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-muted">
            {section.audience}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold" style={{ color: GOLD }}>
            {section.heading}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">{section.lede}</p>
          <div className="mt-6 space-y-7">
            {sectionClaims(section).map((c) => (
              <div key={c.id} className="border-l-2 border-white/12 pl-5">
                {c.kind === "inferred" ? <InferenceMark /> : null}
                <p className="text-[15px] leading-relaxed text-neutral-300">{c.text}</p>
                <Sources sources={c.sources} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold" style={{ color: GOLD }}>
          Four refusals
        </h2>
        <div className="mt-6 space-y-10">
          {METHOD_REFUSALS.map((r) => (
            <div key={r.id} className="border-l-2 border-white/12 pl-5">
              <h3 className="font-display text-lg font-semibold text-white">{r.what}</h3>
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-muted">
                Refused under {r.rule}
              </p>
              {r.kind === "inferred" ? <InferenceMark /> : null}
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-300">{r.refusal}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-300">
                <span className="font-semibold text-white">What it cost. </span>
                {r.price}
              </p>
              <Sources sources={r.sources} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold" style={{ color: GOLD }}>
          The worst finding against itself
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">
          A review process is only worth describing if it catches things. This is the worst thing
          this one has caught, dated, with the rule it broke — and it is still open.
        </p>
        <div className="mt-6 space-y-10">
          {METHOD_FINDINGS.map((f) => (
            <div key={f.id} className="border-l-2 border-white/12 pl-5">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-muted">
                {f.date} · broke {f.rule}
              </p>
              {f.kind === "inferred" ? <InferenceMark /> : null}
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-300">{f.finding}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-300">
                <span className="font-semibold text-white">Since then. </span>
                {f.consequence}
              </p>
              <Sources sources={f.sources} />
            </div>
          ))}
        </div>
      </section>

      <p className="mt-14 text-[13px] leading-relaxed text-muted">
        Standing facts on this page last checked {METHOD_AS_OF}. The instruments themselves are in
        the <Link href="/learn" className="text-[hsl(42_60%_58%)] transition hover:text-white">reading room</Link>;
        the measurements behind them are in{" "}
        <Link href="/lab" className="text-[hsl(42_60%_58%)] transition hover:text-white">the Lab</Link>,
        including a page listing what the instruments cannot do.
      </p>
    </article>
  );
}
