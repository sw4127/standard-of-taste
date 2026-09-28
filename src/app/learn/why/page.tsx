import Explainer, { explainerMetadata } from "../Explainer";
import BlueprintArgument from "@/components/BlueprintArgument";
import { learnPage } from "@/content/learn";
import { bp, caption, type BpId } from "@/content/blueprint";
import { GYM_INK_BRIGHT } from "@/content/instrument-accents";

/**
 * /learn/why — WHY THIS EXISTS (blueprint Part 7; serves BP-INSIGHT).
 *
 * The argument the reading rests on, in premise form, then the three
 * common-sense assumptions the project rejects, then the bridge from what a
 * listener can hear to the words in their prompt. NOTHING HERE IS TYPED: every
 * statement renders from `docs/blueprint.md` through `blueprint.ts`, each with
 * its label, so this page cannot drift from the argument of record. The public
 * form of the second assumption (BP-CA2-PUBLIC) is used, because it attributes
 * each half to its source.
 */

const page = learnPage("why")!;
export const metadata = explainerMetadata(page);

/*
 * The line under each statement comes from its note in the blueprint, never from
 * this file: a typed fallback here once labelled BP-CA2-PUBLIC, an evidenced
 * claim, "a position, not an empirical claim" (N3).
 */
function Statement({ id }: { id: BpId }) {
  const s = bp(id);
  const line = caption(s);
  return (
    <blockquote>
      {s.text}
      {line ? <span className="mt-1 block text-xs not-italic text-muted">{line}</span> : null}
    </blockquote>
  );
}

export default function Page() {
  return (
    <Explainer page={page} kicker="THE READING · THE ARGUMENT">
      <p>
        <strong>The argument.</strong> Each step is labelled with what supports it: evidence, an assumption, or an
        inference from the steps before.
      </p>
      <BlueprintArgument accent={GYM_INK_BRIGHT} />
      <p>
        <strong>Three things common sense says, and the project rejects.</strong>
      </p>
      <Statement id="BP-CA1" />
      <Statement id="BP-CA2-PUBLIC" />
      <Statement id="BP-CA3" />
      <p>
        <strong>The bridge.</strong> Why the reading ends where the hearing tests begin.
      </p>
      <Statement id="BP-BRIDGE" />
    </Explainer>
  );
}
