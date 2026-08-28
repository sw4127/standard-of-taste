import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";
import { flawFamilies, FLAWS_INTRO, FLAWS_LIMITS, type MachineId } from "@/content/flaw-families";
import { MACHINES } from "@/components/OtherMachines";

/**
 * /learn/flaws — THE CREATOR REFERENCE (E11/S3, Track B, blueprint B1).
 *
 * The blueprint's section 2 table, written for the person it is actually for:
 * somebody generating music with AI tools who can hear that a render is wrong
 * and cannot name why. Every other page in this room explains a Hume criterion
 * to a reader; this one hands a vocabulary to a person with a broken file.
 *
 * NOTHING ON THIS PAGE IS TYPED TWICE. The families, their names, their units
 * and the machines that measure them all come out of `flawFamilies()`, which
 * reads the engine, the rendered clip manifest and the shipped pools. Four
 * places once hand-typed a list of families and every one of them named a
 * fourth that has never existed (E11/S1). A reference page is the single worst
 * place in the product for that to happen again, because it is the page people
 * would trust.
 *
 * ACHROMATIC, DELIBERATELY. The reading room is a gym-level surface and the
 * gym has no colour of its own (RT-AG). It would also be wrong on the merits
 * here: every family is measured by two machines, so there is no one accent a
 * block could honestly wear.
 */

const page = learnPage("flaws")!;
export const metadata = explainerMetadata(page);

/** Live machines, by the ids `flawFamilies()` reports. */
function machineLinks(ids: MachineId[]) {
  const found = ids
    .map((id) => MACHINES.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m) && m!.live);

  return found.map((m, i) => (
    <span key={m.id}>
      {i > 0 ? (i === found.length - 1 ? " and " : ", ") : ""}
      <Link href={m.href}>{m.title}</Link>
    </span>
  ));
}

export default function Page() {
  const families = flawFamilies();

  return (
    <Explainer page={page} kicker="REFERENCE · WHAT THE GYM CAN MEASURE">
      <p>{FLAWS_INTRO}</p>

      {families.map((f) => (
        <section key={f.family} className="border-t border-white/10 pt-6">
          <h2 className="font-display text-2xl font-semibold text-white">{f.label}</h2>

          {/* The complaint first, in the words somebody would actually use —
              this is the line a person recognises before they know the name. */}
          <p className="mt-3 text-[15px] italic leading-relaxed text-neutral-200">
            &ldquo;{f.symptom}&rdquo;
          </p>

          <p className="mt-3">{f.mechanism}</p>

          {/* THE PARENTHETICAL IS CONDITIONAL, and reading the rendered page is
              the only reason that is known: lossy's short unit and full unit
              are both "kbps", so the unconditional version published
              "Measured in kbps (kbps)". Pitch and timing carry a real
              expansion ("cents of peak detune"); lossy does not. */}
          <p className="mt-3 text-sm text-muted">
            Measured in <strong>{f.unit}</strong>
            {f.fullUnit === f.unit ? "" : ` (${f.fullUnit})`} by {machineLinks(f.machines)}.
          </p>
        </section>
      ))}

      <p className="border-t border-white/10 pt-6">{FLAWS_LIMITS}</p>
    </Explainer>
  );
}
