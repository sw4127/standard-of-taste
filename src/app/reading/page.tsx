import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import FluidField from "@/components/FluidField";
import BlueprintArgument from "@/components/BlueprintArgument";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import { GYM_FIELD, GYM_INK_BRIGHT, FIELD_READING } from "@/content/instrument-accents";
import { READING_KICKER, READING_TITLE, WHY_HEADING, WHY_LEAD } from "@/content/reading/copy";
import { READING_STATEMENT } from "@/content/reading/statement";
import { SITE_NAV } from "@/content/site-nav";
import ReadingFlow from "./ReadingFlow";

/**
 * THE READING — the product's flagship (D3 amendment, BA-6).
 *
 * A listener's recent plays, read into lines that can be checked against the
 * plays, argued with, and carried into a prompt (BP-INSIGHT, BP-UNMET). The
 * flow is client-side — picking a listener, rejecting lines, choosing readings —
 * and runs the same deterministic engine the tests run. This page is a server
 * component for one reason: the "why this works" section renders the argument
 * from `docs/blueprint.md`, which only the server can read.
 *
 * D1 IS SUSPENDED HERE, BY NAME (CLAUDE.md, "D1 amendment, third surface"), and
 * the page says so on itself in the amendment's own words (`READING_STATEMENT`).
 */

export const metadata: Metadata = {
  title: "The reading — Standard of Taste",
  description:
    "Four weeks of an illustrative listener's plays, read into lines you can check against the plays, argue with, and carry into a prompt.",
  alternates: { canonical: "/reading" },
};

export default function ReadingPage() {
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={GYM_FIELD} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader links={SITE_NAV.filter((l) => l.href !== "/reading")} />
        <div className={PROSE_MEASURE}>
          <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{READING_KICKER}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">{READING_TITLE}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">{READING_STATEMENT}</p>

          <Suspense fallback={null}>
            <ReadingFlow />
          </Suspense>

          <section id="why" className="mt-16 border-t border-white/10 pt-8">
            <h2 className="font-display text-2xl font-semibold">{WHY_HEADING}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{WHY_LEAD}</p>
            <div className="mt-6">
              <BlueprintArgument accent={GYM_INK_BRIGHT} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
