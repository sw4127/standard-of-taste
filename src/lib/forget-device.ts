/**
 * FORGETTING THIS BROWSER (E13/S4, Track G3, PM ruling RT-G1 a).
 *
 * RT-G ruled device-local history, and a product that keeps a record of you in
 * one place owes you a way to end it that does not require knowing what
 * devtools are. This is that way.
 *
 * IT CLEARS THE RETEST GATE TOO, and that was ruled rather than assumed
 * (RT-G1 a). The gate is stored in the same browser as the results, so a clear
 * that spared it would leave a person still refused a retest with the session
 * behind that refusal deleted — a "forget me" button that kept something, which
 * is the class of false self-claim this project keeps removing (N3). The
 * cooldown module already concedes on the record that a determined person
 * clears it in four keystrokes and that this is fine: the gate exists to catch
 * the person who forgot, not to stop the person who insists, and the screen
 * explains before any retest why an early number is worse.
 *
 * A NAMESPACE SWEEP, NOT A LIST OF KEYS. The threshold slots are addressed per
 * ladder, so an explicit list would have to be rebuilt every time a family is
 * added — and the day it was not rebuilt, "forget everything" would quietly
 * keep something. Everything this product persists lives under `gym.`, which is
 * asserted by a test rather than by this comment: there is exactly ONE
 * `localStorage` write in the codebase and it is the session store.
 *
 * WHAT IT CANNOT DO, said here so the copy never overstates it: it cannot recall
 * usage events already sent to analytics, and it reaches only the browser it
 * runs in.
 */

/** Everything this product persists is namespaced. Swept, never enumerated. */
export const PERSISTENT_PREFIX = "gym.";

export interface ForgetOutcome {
  /** Keys removed from `localStorage`. */
  removed: number;
  /** Whether the in-flight session state was cleared. */
  clearedSession: boolean;
}

/**
 * Each store is wrapped separately AND ON PURPOSE. `localStorage` throws on
 * access in Safari private browsing and wherever cookies are blocked; if one
 * throw skipped the other store, a person who asked to be forgotten would be
 * told they had been while half of it remained.
 */
export function forgetThisBrowser(): ForgetOutcome {
  let removed = 0;
  let clearedSession = false;

  try {
    if (typeof localStorage !== "undefined") {
      // Collected first, then removed: removing during the walk reindexes the
      // store underneath it and silently skips every other key.
      const doomed: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key !== null && key.startsWith(PERSISTENT_PREFIX)) doomed.push(key);
      }
      for (const key of doomed) localStorage.removeItem(key);
      removed = doomed.length;
    }
  } catch {
    // Nothing persisted, so nothing to forget.
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
      clearedSession = true;
    }
  } catch {
    /* same */
  }

  return { removed, clearedSession };
}
