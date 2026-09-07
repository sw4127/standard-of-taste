/**
 * WHEN THE TERMS LAST CHANGED, AND A CHECK THAT SAYS SO (E19/S13).
 *
 * WHY A CONSTANT IS NOT THE FIX ON ITS OWN. Cowork's batch-2 return flagged the
 * date on `/legal` as "a date written in by hand on the page a reader opens to
 * find out what they are agreeing to. It was correct on the day it shipped and
 * is wrong on every day after the next edit." Moving it into a constant makes
 * it easier to update and does nothing at all about the failure — which is not
 * that the date is hard to change, but that changing the PAGE does not change
 * the date.
 *
 * SO THE PAGE IS FINGERPRINTED. `legal-updated.test.ts` hashes the terms and
 * fails when the hash moves without this date moving with it. Edit a word of
 * `/legal` and the build tells you the date is now a false claim, which is the
 * only version of this that a person cannot forget.
 *
 * NO GIT, DELIBERATELY. The obvious alternative reads the file's last commit
 * date, which is more precise and breaks in a shallow clone, in an export, and
 * in any checkout where the file was touched for an unrelated reason — a
 * reformat would move the date on a document nobody amended. A hash of the
 * words answers the question a reader is actually asking: have the terms
 * changed since this date.
 */

/** Month and year the terms last changed in substance. */
export const LEGAL_LAST_UPDATED = "September 2026";

/**
 * Fingerprint of the terms as of that date, maintained by the test that checks
 * it. It is not secret and not security: it is a tripwire on prose.
 */
export const LEGAL_COPY_FINGERPRINT = "e82fd94c323b9d7a";
