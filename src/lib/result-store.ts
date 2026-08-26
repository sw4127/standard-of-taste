/**
 * WHAT THIS DEVICE HAS MEASURED SO FAR (E8/S7, 2026-08-27).
 *
 * WHY IT EXISTS. RT-A(a)+(c): every result screen gets its own paragraph, AND a
 * combined view appears once more than one instrument has been run. The
 * combined view needs to know what else this person has done, and there are no
 * accounts and no database. This is the lightest store that can answer it.
 *
 * IT STORES RAW ANSWERS, NEVER A RESULT — and that is the whole design.
 *
 * The obvious implementation caches the computed numbers: threshold 18 cents,
 * bias +20%, delicacy 8/15. That would make the store a SECOND SOURCE OF TRUTH
 * for every figure the engines compute, and the moment a pool version, a
 * ladder, or an estimator changes, this device starts reporting numbers the
 * current engine would never produce — silently, on a page that says it
 * measured them. So what is written here is exactly the payload the SHARE URL
 * carries, and reading recomputes through the same engine the share page uses.
 * A stored session and a shared link cannot disagree, because they are the same
 * bytes through the same function.
 *
 * It also means nothing here is forgeable into a better result. Editing
 * localStorage by hand can only change which ANSWERS you claim to have given,
 * and the engine will score those answers honestly (N3) — the same property
 * `/bias/result` and `/threshold/[slug]/result` already have.
 *
 * POOL VERSIONS ARE GATED ON READ, NOT ON WRITE. Payload tokens are positional:
 * their meaning is the item order of the pool that produced them, and decoding
 * last month's answers against a reordered pool would score different questions
 * without erroring. Every entry carries the version it was recorded against and
 * a mismatch is dropped, exactly as the share pages hard-reject one.
 *
 * DEVICE-LOCAL, AND HONEST ABOUT IT — same standing as the retest cooldown
 * (RT-89a). Clearing site data loses it; nobody is being kept from anything.
 *
 * EVERY CALL IS WRAPPED. `localStorage` is not merely absent on the server: it
 * THROWS in Safari private browsing and wherever cookies are blocked. An
 * unguarded read there would white-screen a result page over a convenience.
 */

const KEY_PREFIX = "gym.result.";

/** Bumped only if the ENVELOPE changes. Pool versions live inside `poolVersion`. */
export const STORE_VERSION = 1;

export type StoredInstrument = "bias" | "delicacy" | "threshold";

/**
 * The raw payload for one finished session, in the same shape its share URL
 * uses. `slug` and `seed`/`answers` belong to the threshold ladders; `ratings`
 * to the prestige passes; `picks` to the delicacy trials.
 */
export type StoredPayload =
  | { kind: "bias"; blind: string; labeled: string }
  | { kind: "delicacy"; picks: string }
  | { kind: "threshold"; slug: string; seed: number; answers: string; sourceId?: string };

export interface StoredEntry {
  v: number;
  /** The pool/instrument version these answers were given against. */
  poolVersion: number;
  savedAt: number;
  payload: StoredPayload;
}

/**
 * Threshold sessions are stored PER LADDER, so a person who measures pitch and
 * then compression keeps both. The other two instruments have one session each.
 */
function keyFor(instrument: StoredInstrument, slug?: string): string {
  return instrument === "threshold" ? `${KEY_PREFIX}threshold.${slug}` : KEY_PREFIX + instrument;
}

/**
 * Validated on the way OUT, not trusted on the way in.
 *
 * Anything in localStorage is attacker-controlled in the only sense that
 * matters here — the user's own devtools, a half-written value from a killed
 * tab, or an envelope written by a version of this code that no longer exists.
 * A malformed entry returns null rather than throwing, and rather than reaching
 * a decoder that would throw further away from the cause.
 */
function parse(raw: string | null, poolVersion: number): StoredEntry | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const e = data as Partial<StoredEntry>;
  if (e.v !== STORE_VERSION) return null;
  if (e.poolVersion !== poolVersion) return null;
  if (typeof e.savedAt !== "number" || !Number.isFinite(e.savedAt)) return null;

  const p = e.payload as Partial<StoredPayload> | undefined;
  if (!p || typeof p !== "object") return null;
  switch (p.kind) {
    case "bias":
      if (typeof p.blind !== "string" || typeof p.labeled !== "string") return null;
      break;
    case "delicacy":
      if (typeof p.picks !== "string") return null;
      break;
    case "threshold":
      if (typeof p.slug !== "string" || typeof p.answers !== "string") return null;
      if (typeof p.seed !== "number" || !Number.isInteger(p.seed) || p.seed < 0) return null;
      if (p.sourceId !== undefined && typeof p.sourceId !== "string") return null;
      break;
    default:
      return null;
  }
  return e as StoredEntry;
}

/** One stored session, or null. Never throws. */
export function readResult(
  instrument: StoredInstrument,
  poolVersion: number,
  slug?: string,
): StoredEntry | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return parse(localStorage.getItem(keyFor(instrument, slug)), poolVersion);
  } catch {
    return null;
  }
}

/**
 * Record a finished session. Overwrites the previous one for that instrument.
 *
 * LAST SESSION WINS, deliberately. The alternative is a history, and a history
 * invites "your best result" — which would be selection on the answer, the
 * exact bias E5/S2 measured and RT-90a(b) removed. One slot per instrument
 * cannot be cherry-picked.
 */
export function recordResult(
  instrument: StoredInstrument,
  poolVersion: number,
  payload: StoredPayload,
  now: number,
): void {
  try {
    if (typeof localStorage === "undefined") return;
    const entry: StoredEntry = { v: STORE_VERSION, poolVersion, savedAt: now, payload };
    const slug = payload.kind === "threshold" ? payload.slug : undefined;
    localStorage.setItem(keyFor(instrument, slug), JSON.stringify(entry));
  } catch {
    // The person finished their session and got their number. The only casualty
    // is that the combined view will not know about it.
  }
}

/** Forget one stored session. Used by tests and by any future "clear" control. */
export function forgetResult(instrument: StoredInstrument, slug?: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(keyFor(instrument, slug));
  } catch {
    /* nothing to do */
  }
}

/**
 * Fires when ANOTHER tab writes — the person who finished the prestige test in
 * one window while a result page sits open in another. Same reason and same
 * shape as `subscribeCooldown`.
 */
export function subscribeResults(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
