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
/*
 * THE 2026-09-13 MOVE WAS THE PRODUCT'S NAME, NOT A CLAUSE (RT-N1 a).
 *
 * The fingerprint changed because /legal names the product and the product was
 * renamed from "The Taste Gym" to "Standard of Taste". A word-level diff of the
 * extracted terms showed the ONLY tokens that moved were those three words and
 * their capitalised forms — no obligation, permission, retention period or
 * contact detail changed.
 *
 * SO THE DATE DID NOT MOVE, and that is the judgment this guard exists to force
 * somebody to make rather than to make for them. "Last updated" answers "have
 * the terms you agreed to changed", and they have not; a reader who agreed to
 * these terms yesterday has agreed to exactly the same ones today, under a name
 * this page now shares with the rest of the product.
 */
export const LEGAL_LAST_UPDATED = "September 2026";

/**
 * Fingerprint of the terms as of that date, maintained by the test that checks
 * it. It is not secret and not security: it is a tripwire on prose.
 */
// 2026-09-23: the clauses about the retired legacy quizzes were removed
// (RT-2 (2026-09-22) a) — substantive, and still September 2026. Later the same
// day the snack returned (RT-4 c): the personality sentence narrowed to the
// instruments, the two person-speaking surfaces named, the snack's data clauses
// restored.
// RT-7 (2026-09-23) b: the snack is a playful verdict, exempt from the offer register.
export const LEGAL_COPY_FINGERPRINT = "a30ea8aac655b9ee";
