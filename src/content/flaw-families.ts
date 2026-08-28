/**
 * THE FLAW FAMILIES, NAMED FOR THE PERSON WHOSE TRACK IS BROKEN (E11/S1, Track B).
 *
 * Blueprint section 2: the product is for people generating music with AI tools,
 * whose recurring problem is that "a generation sounds cheap or wrong, they
 * cannot name why, and they regenerate blind". Serves that directly — it is the
 * naming half. Nothing here is measured, computed, or claimed about a person
 * (D1); it is a description of a manipulation the pipeline performs.
 *
 * WHY THIS FILE EXISTS AT ALL, when three other modules already say something
 * about each family:
 *
 *   `FAMILY_LABEL`  (staircase/copy)  "Pitch drift"        — the name
 *   `FAMILY_BLURB`  (staircase/copy)  "the whole track…"   — what the pipeline did
 *   `FLAW_LABELS`   (delicacy/items)  "The pitch drifts"   — the answer button
 *
 * All three are written for someone already inside a trial, who has just heard
 * the clip. None of them is written for someone who has NOT heard anything and
 * is trying to work out which flaw is wrecking their own render. That is a
 * different sentence, so it is a new field rather than a rewrite of an existing
 * one — the three above are load-bearing in flows this does not touch.
 *
 * ONLY THE TWO CREATOR SENTENCES ARE DECLARED HERE. The name, the unit and the
 * instruments are DERIVED, because every one of them has already been wrong in
 * this repository once:
 *   - the unit comes from `familyUnit`, which reads the rendered clip manifest;
 *   - the instruments come from the shipped pools, not from a list of machines;
 *   - the family set is `DEGRADATION_FAMILIES`, and `Record<DegradationFamily,…>`
 *     means adding a family to the engine fails `tsc` here rather than rendering
 *     a raw slug at somebody.
 *
 * THE FOURTH FAMILY THAT NEVER EXISTED. Until this slice, four separate places
 * told readers the trials introduce a fourth degradation — a buried incorrect
 * pitch — which the pipeline has never rendered and no instrument has ever
 * scored. Two of those places were live pages. `flaw-families.test.ts` sweeps
 * every `.ts`/`.tsx` under `src/` for the exact phrase and allows NO
 * exceptions, which is why the phrase itself does not appear in this comment:
 * an exception list is how the third copy of `tint` survived E10/S1. The real
 * pre-fix text lives in `__fixtures__/` where the sweep cannot see it.
 */
import { DEGRADATION_FAMILIES, type DegradationFamily } from "@/engine/delicacy";
import { STAIRCASE_FAMILIES, familyUnit } from "@/engine/staircase-manifest";
import { FAMILY_LABEL, shortUnit } from "@/content/staircase/copy";
import { MEASURED_TRIALS } from "@/content/delicacy/items";

/** A machine, by the id `@/components/OtherMachines` knows it as. */
export type MachineId = "bias" | "delicacy" | "threshold";

/**
 * The two sentences that are actually new.
 *
 * `symptom` is deliberately the thing a person says BEFORE they have a word for
 * it — the complaint, not the diagnosis. It is what someone would search for.
 * `mechanism` is what is physically true of the audio. Splitting them is the
 * point: the gap between the two is the vocabulary the blueprint says is
 * missing, and a single merged sentence closes it too early to be useful.
 */
export interface FlawFamilyCreatorCopy {
  symptom: string;
  mechanism: string;
}

/**
 * DECLARED, not derived — these are prose and have no source of truth in code.
 *
 * NOTE FOR THE WRITING PASS: these six sentences are new copy written by
 * engineering and have not had one. They are registered in `voice.test.ts`, so
 * they cannot contain a NAMED hazard; that is not the same as being good.
 */
const CREATOR_COPY: Record<DegradationFamily, FlawFamilyCreatorCopy> = {
  "pitch-drift": {
    symptom: "It sounds sour or slightly seasick, and nothing you can point at is off-key.",
    mechanism:
      "The whole take slides out of tune while it plays. It starts where it should and ends somewhere else, so no single note is wrong — the drift is.",
  },
  "timing-smear": {
    symptom: "It feels rubbery and unanchored. The groove will not lock, however hard the drums are pushed.",
    mechanism:
      "The beat wanders off the grid and back again in slow waves. No individual hit is late enough to notice on its own; the pattern of them is.",
  },
  "lossy-artifact": {
    symptom: "It sounds cheap, underwater or brittle — like a good idea saved one too many times.",
    mechanism:
      "Low-bitrate compression throws away quiet detail. Cymbals turn grainy and reverb tails go swishy and airless, while the loud middle survives intact.",
  },
};

/** One family, assembled: two written sentences and four derived facts. */
export interface FlawFamily {
  family: DegradationFamily;
  /** The name the instruments already use for it. */
  label: string;
  /** "cents", "ms", "kbps" — what a threshold in this family is quoted in. */
  unit: string;
  /** "cents of peak detune" — the unit as the pipeline recorded it. */
  fullUnit: string;
  symptom: string;
  mechanism: string;
  /** Machines whose SHIPPED pool contains this family, in gym order. */
  machines: MachineId[];
}

/**
 * Which machines actually test a family, read off what shipped.
 *
 * NOT a hand-written mapping. `Machine.field` and `FluidField.baseColor` were
 * both fully populated, fully documented and read by nothing (E10 finding 8);
 * the lesson recorded there is to ask what READS a value. So this asks what
 * each instrument's pool CONTAINS. If a family is dropped from the delicacy
 * pool, this stops claiming the Delicacy Trials measure it, without anyone
 * remembering to come here.
 */
const DELICACY_POOL_FAMILIES = new Set<string>(MEASURED_TRIALS.map((t) => t.family));

function machinesFor(family: DegradationFamily): MachineId[] {
  const out: MachineId[] = [];
  if (DELICACY_POOL_FAMILIES.has(family)) out.push("delicacy");
  if (STAIRCASE_FAMILIES.includes(family)) out.push("threshold");
  return out;
}

/**
 * Every flaw family the product can actually test, in engine order.
 *
 * A function rather than a constant because `familyUnit` throws when a family
 * has no rendered clips — a module-level constant would make that throw an
 * import-time crash on every page that touches this file, including ones with
 * nothing to do with flaws.
 */
export function flawFamilies(): FlawFamily[] {
  return DEGRADATION_FAMILIES.map((family) => {
    const fullUnit = familyUnit(family);
    return {
      family,
      label: FAMILY_LABEL[family],
      unit: shortUnit(fullUnit),
      fullUnit,
      symptom: CREATOR_COPY[family].symptom,
      mechanism: CREATOR_COPY[family].mechanism,
      machines: machinesFor(family),
    };
  });
}

/**
 * The families as a prose list, joined readably and in engine order.
 *
 * The example output is deliberately NOT written out here: `flaw-families.test.ts`
 * forbids any source line that hand-types two or more family names, and a doc
 * comment demonstrating the list would be the first thing that guard caught. It
 * caught exactly this line when the guard was first run.
 *
 * DELIBERATELY LIGHTER THAN `flawFamilies()`: no manifest read, so it is safe
 * to call at module scope. `learn.ts` is a plain data module evaluated on
 * import by the sitemap and every explainer page; calling `familyUnit` there
 * would turn a missing clip render into an import-time crash on pages that
 * have nothing to do with audio.
 *
 * This exists because the same list was hand-typed on two reading-room
 * surfaces and both had been wrong since before the Delicacy Trials opened.
 */
export function flawFamilyList(): string {
  const names = DEGRADATION_FAMILIES.map((f) => FAMILY_LABEL[f].toLowerCase());
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
