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
 * IT IS A HISTORY NOW, AND IT CANNOT BE CHERRY-PICKED (E13/S1, RT-G b).
 *
 * Until now each slot held exactly one session and the second one destroyed the
 * first. The reason was good and it still binds: a history invites "your best
 * result", which is selection on the answer — the same bias E5/S2 measured and
 * RT-90a(b) removed from the product. So the history is kept in TIME ORDER and
 * the module exposes no way to ask for a best, a maximum, or a personal record.
 * `readResult` still answers "the latest", which is what every shipped surface
 * asks; `readHistory` answers "all of them, oldest first", which is what an arc
 * needs. Neither can rank. That is the whole safety property, and there is a
 * test that fails if a member named for a superlative ever appears here.
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

/**
 * Bumped only if the ENVELOPE changes. Pool versions live inside `poolVersion`.
 *
 * 2 (E13/S1, RT-G b) — one slot per instrument became a chronological LIST.
 * A v1 envelope is still read, as a history of one; nobody loses the session
 * they already have.
 */
export const STORE_VERSION = 2;

/**
 * HOW MANY SESSIONS ONE SLOT KEEPS, newest wins, oldest evicted.
 *
 * With a 7-day cooldown per family, 24 threshold sessions is about six months
 * of coming back. The entries are tens of bytes each, so the cap is not about
 * space; it is about a list that grows without limit having no defined
 * behaviour at all. Eviction is plain FIFO and drops the OLDEST — the tempting
 * alternative, keeping the very first session as a permanent baseline and
 * evicting the second, would leave a hole in the middle of a time series that
 * any arc display would then draw as though the sessions were evenly spaced.
 */
export const HISTORY_CAP = 24;

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
function parseSession(data: unknown, envelopeVersion: number): StoredEntry | null {
  if (typeof data !== "object" || data === null) return null;
  const e = data as Partial<StoredEntry>;
  if (typeof e.poolVersion !== "number" || !Number.isFinite(e.poolVersion)) return null;
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
  // `v` is the ENVELOPE's, carried onto every session so callers keep the shape
  // they had before the slot became a list.
  return { v: envelopeVersion, poolVersion: e.poolVersion, savedAt: e.savedAt, payload: p as StoredPayload };
}

/**
 * The whole slot, oldest first, with anything malformed dropped rather than
 * throwing — one corrupt session must not cost a person the other twenty-three.
 * No pool-version filtering happens here; that is the caller's gate.
 *
 * A v1 ENVELOPE IS MIGRATED ON READ, not rewritten on disk. Someone who
 * measured their pitch drift last month has exactly one session, and dropping
 * it because the envelope grew a list would be this module deleting the record
 * it exists to keep. It becomes a history of one, and the next write persists
 * it in the new shape.
 */
function parseEnvelope(raw: string | null): StoredEntry[] {
  if (raw === null) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof data !== "object" || data === null) return [];
  const env = data as { v?: unknown; sessions?: unknown; payload?: unknown };

  if (env.v === 1) {
    const one = parseSession(env, 1);
    return one ? [one] : [];
  }
  if (env.v !== STORE_VERSION) return [];
  if (!Array.isArray(env.sessions)) return [];

  const out: StoredEntry[] = [];
  for (const s of env.sessions) {
    const parsed = parseSession(s, STORE_VERSION);
    if (parsed) out.push(parsed);
  }
  return out;
}

/**
 * Every session in this slot that was answered against `poolVersion`, OLDEST
 * FIRST. Sessions recorded against another pool are left on disk but not
 * returned: their answer tokens are positional, so scoring them against today's
 * item order would answer different questions without erroring.
 */
export function readHistory(
  instrument: StoredInstrument,
  poolVersion: number,
  slug?: string,
): StoredEntry[] {
  try {
    if (typeof localStorage === "undefined") return [];
    return parseEnvelope(localStorage.getItem(keyFor(instrument, slug))).filter(
      (e) => e.poolVersion === poolVersion,
    );
  } catch {
    return [];
  }
}

/**
 * The LATEST stored session, or null. Never throws.
 *
 * Signature unchanged since E8/S7 on purpose: every shipped surface that reads
 * this store — the combined view, the expert panel, all three recall helpers —
 * wants the session the person just finished, and none of them had to learn
 * about a list.
 */
export function readResult(
  instrument: StoredInstrument,
  poolVersion: number,
  slug?: string,
): StoredEntry | null {
  const all = readHistory(instrument, poolVersion, slug);
  return all.length === 0 ? null : all[all.length - 1];
}

/**
 * Record a finished session. APPENDS to the slot's history (E13/S1, RT-G b).
 *
 * It used to overwrite, and the reason given was that a history invites "your
 * best result". That risk is real and it is now handled where it belongs — in
 * the read API, which cannot express a ranking — rather than by throwing the
 * evidence away. Overwriting also made the product's headline promise
 * impossible to keep: "did your ear move" needs the session before this one.
 *
 * READ-MODIFY-WRITE, and the read is the tolerant one. If the existing slot is
 * unparseable garbage, this appends to an empty list rather than refusing to
 * record — the person finished a session, and a corrupt neighbour is not their
 * problem.
 */
export function recordResult(
  instrument: StoredInstrument,
  poolVersion: number,
  payload: StoredPayload,
  now: number,
): void {
  try {
    if (typeof localStorage === "undefined") return;
    const slug = payload.kind === "threshold" ? payload.slug : undefined;
    const key = keyFor(instrument, slug);
    const kept = parseEnvelope(localStorage.getItem(key));
    kept.push({ v: STORE_VERSION, poolVersion, savedAt: now, payload });
    // Oldest out first, and only ever from the front, so what remains is still
    // a contiguous run of the most recent sessions.
    const sessions = kept.slice(Math.max(0, kept.length - HISTORY_CAP)).map((e) => ({
      poolVersion: e.poolVersion,
      savedAt: e.savedAt,
      payload: e.payload,
    }));
    localStorage.setItem(key, JSON.stringify({ v: STORE_VERSION, sessions }));
  } catch {
    // The person finished their session and got their number. The only casualty
    // is that the combined view will not know about it.
  }
}

/**
 * Forget one slot ENTIRELY — every session in it, not just the latest. Used by
 * tests and, from E13/S4, by the clear control.
 */
export function forgetResult(instrument: StoredInstrument, slug?: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(keyFor(instrument, slug));
  } catch {
    /* nothing to do */
  }
}

/**
 * WHEN THIS SLOT WAS LAST WRITTEN — AND DELIBERATELY NOT POOL-VERSION GATED
 * (E13/S2).
 *
 * Every other read here drops sessions answered against a different pool,
 * because scoring last month's answers against a reordered item list would
 * answer different questions without erroring. This one must NOT, and the
 * reason is the whole point of the slice: the retest cooldown asks "when did
 * this person last finish a session", not "what did they score". Gate that on
 * the pool version and a routine re-render of the clips silently unblocks
 * everybody's cooldown on deploy day — a validity gate failing open because an
 * unrelated number moved. The answers become unscoreable; the fact that a
 * person sat through the session an hour ago does not.
 *
 * THE LAST ELEMENT, NOT THE LARGEST TIMESTAMP. They differ only when the list
 * is out of order, which takes a corrected clock or a hand edit — and taking
 * the largest would let one future-dated entry disable the gate for as long as
 * it survived in the list, because `cooldownFrom` fails open on a future time
 * to avoid locking somebody out permanently. Append order is what actually
 * happened.
 */
export function lastRecordedAt(instrument: StoredInstrument, slug?: string): number | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const all = parseEnvelope(localStorage.getItem(keyFor(instrument, slug)));
    return all.length === 0 ? null : all[all.length - 1].savedAt;
  } catch {
    return null;
  }
}

/**
 * A CHEAP, STABLE DESCRIPTION OF ONE SLOT, for `useSyncExternalStore`.
 *
 * The hook re-renders forever unless the snapshot is referentially stable, so
 * this must return a primitive rather than the sessions themselves. It lived in
 * `AcrossSessions` as `localStorage.getItem(key).length` and MOVED HERE IN
 * E13/S1 because a byte length stopped being a sound change signal the moment a
 * slot became a capped list: at the cap, appending a 25th session evicts the
 * first, and for an instrument whose payloads are all the same width — the
 * prestige test, sixteen single digits — the envelope comes back the SAME
 * NUMBER OF BYTES. Measured: 3716 before and 3716 after. The other tab would
 * have gone on showing sessions that had already been evicted.
 *
 * Count and newest timestamp both move when a session is recorded, and neither
 * can be silently cancelled out by the other.
 */
export function slotSignature(instrument: StoredInstrument, slug?: string): string {
  try {
    if (typeof localStorage === "undefined") return "";
    const raw = localStorage.getItem(keyFor(instrument, slug));
    if (raw === null) return "-";
    const all = parseEnvelope(raw);
    const newest = all.length === 0 ? 0 : all[all.length - 1].savedAt;
    return `${all.length}@${newest}#${raw.length}`;
  } catch {
    return "";
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
