/**
 * EVERY SURFACE WHOSE EMISSION ORDER IS DECLARED RATHER THAN DESCRIBED (E19/S1).
 *
 * The copy deck reads this. A surface listed here gets its "what renders with
 * it, in order" sentence composed from the array the product actually runs;
 * a surface not listed here still carries a hand-written one, which is the
 * defect being retired and is tracked per surface until it is.
 *
 * SEPARATE FROM `emission.ts` ON PURPOSE. The specs import that module, so a
 * registry living inside it would close a cycle the moment the second surface
 * was added.
 */
import type { DescribedSpec } from "./emission";
import { SPREAD_EMISSION } from "./spread";

export const EMISSION_SPECS: Record<string, DescribedSpec> = {
  spread: SPREAD_EMISSION,
};
