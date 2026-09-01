/**
 * THE 7-DAY PER-FAMILY RETEST COOLDOWN (D4 amendment; PM ruling RT-89a).
 *
 * The result screen has been telling people "come back in a week and run it
 * again" since E5/S5, and until now nothing held the door. That is worse than
 * having no gate: a user who retakes pitch twice in an hour gets a second
 * number that looks exactly like the first one and measures something else.
 * The staircase converges on the rung where you stop being sure; run it again
 * on the same recordings while you still remember them and it converges lower,
 * and the movement is recall, not hearing.
 *
 * SO THE GATE IS A VALIDITY GATE AND NOT A REVENUE GATE (D4 amendment, which
 * closed the pricing question with "no tier"). It exists to stop us reporting a
 * number we know is contaminated. Anything that reads as withholding is wrong,
 * and the copy says why in the same breath as the refusal — depth unlocked,
 * never buried (D5).
 *
 * IT IS DEVICE-LOCAL, and it is honest about what that buys. There are no
 * accounts yet, so this is `localStorage` and a determined person clears it in
 * four keystrokes. That is fine and it is not a hole to be plugged: nobody is
 * being kept from anything they paid for, and someone who deliberately clears
 * it to retake early has been told, on this exact screen, why the result will
 * be worse. The gate catches the person who forgot, which is everyone.
 */

/**
 * IT NO LONGER OWNS A KEY (E13/S2, Track G1, RT-G b).
 *
 * The gate used to keep its own `gym.lastCompleted.<family>` timestamp beside
 * the session store, so finishing a threshold session wrote to storage twice,
 * in two formats, with two chances to disagree — and the record of a completed
 * session lived in a place that knew nothing about the session itself. The
 * timestamp is now READ FROM THE SESSION STORE: the gate asks the history when
 * this family was last measured, and nothing writes a cooldown at all.
 *
 * THE OLD KEY IS STILL READ, and that is not tidiness. This gate shipped in
 * E5/S5 and the session store only in E8/S7, so a browser that finished a
 * session in between holds a cooldown with no session behind it. Dropping the
 * fallback would hand those people an early retest and a number we already know
 * is contaminated. Nothing writes the old key any more, so it drains on its own.
 */

import { lastRecordedAt } from "./result-store";
import { SLUG_BY_FAMILY } from "@/app/threshold/families";

export const COOLDOWN_DAYS = 7;
export const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/** Read-only from E13/S2 onward. Kept so pre-store browsers keep their gate. */
export const LEGACY_KEY_PREFIX = "gym.lastCompleted.";

export interface CooldownState {
  /** Whether a fresh session should be refused right now. */
  blocked: boolean;
  /** When the next session becomes valid, or null if it already is. */
  readyAt: number | null;
  /** Whole days until then, rounded UP and never below 1 while blocked. */
  daysLeft: number;
}

const READY: CooldownState = { blocked: false, readyAt: null, daysLeft: 0 };

/**
 * The whole decision, as a pure function, so every branch below is testable
 * without a DOM. Storage is the part that needs a browser; the rule does not.
 *
 * A TIMESTAMP IN THE FUTURE UNBLOCKS RATHER THAN BLOCKS, which looks backwards
 * until you ask what produces one. A clock that was wrong and got fixed, a
 * device restored from a backup, a value someone typed in by hand. Treating it
 * as a valid completion means the cooldown never expires and the person is
 * locked out of their own ear permanently, with no way to tell why. Treating it
 * as garbage costs us one early retake in the rarest case on the list. Between
 * a gate that fails open and one that can lock someone out forever, a validity
 * nudge fails open.
 */
export function cooldownFrom(lastCompletedAt: number | null, now: number): CooldownState {
  if (lastCompletedAt === null) return READY;
  if (!Number.isFinite(lastCompletedAt)) return READY;
  if (lastCompletedAt > now) return READY;

  const readyAt = lastCompletedAt + COOLDOWN_MS;
  if (now >= readyAt) return READY;

  return {
    blocked: true,
    readyAt,
    daysLeft: Math.max(1, Math.ceil((readyAt - now) / (24 * 60 * 60 * 1000))),
  };
}

/**
 * Every storage call is wrapped, because `localStorage` is not merely absent on
 * the server — it THROWS on access in Safari private browsing and wherever
 * cookies are blocked. An unguarded read there does not skip the cooldown, it
 * white-screens the Gym. Failing open is the deliberate choice (see above); a
 * crash is not a choice at all.
 */
function readLegacyCompleted(family: string): number | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(LEGACY_KEY_PREFIX + family);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * When this family was last measured on this device.
 *
 * The session store first, because it is the record of the thing that actually
 * happened; the retired key only when the store has nothing, which is the
 * pre-E8/S7 browser described above. There is no path where the old key should
 * win: after this slice nothing writes it, and before this slice both were
 * written in the same breath.
 */
export function readLastCompleted(family: string): number | null {
  const fromSessions = lastRecordedAt("threshold", SLUG_BY_FAMILY[family]);
  return fromSessions !== null ? fromSessions : readLegacyCompleted(family);
}

/** The state for one family, read from this device. */
export function cooldownFor(family: string, now: number): CooldownState {
  return cooldownFrom(readLastCompleted(family), now);
}

/**
 * THE WHOLE GATE AS ONE NUMBER, because that is what a React store snapshot has
 * to be.
 *
 *   -1  not known yet — the server, which has no localStorage
 *    0  ready
 *   >0  blocked, and this many whole days remain
 *
 * `useSyncExternalStore` re-renders forever unless the snapshot is
 * referentially stable between calls, so it cannot be a `CooldownState` object;
 * a fresh object every render is an infinite loop. A primitive that already
 * carries every distinction the UI needs beats returning the raw timestamp and
 * deriving state in the component, because deriving it there means calling
 * `Date.now()` during render — which eslint's `react-hooks/purity` rejects, and
 * is right to.
 *
 * READING THE CLOCK BELONGS HERE. A cooldown is external state in exactly the
 * sense the hook means: it lives outside React, it is not derived from props,
 * and it can change without React doing anything. `-1` is a distinct value from
 * `0` for the same reason — a server that answered "ready" would render a Start
 * button the browser might refuse a moment later.
 */
export const COOLDOWN_UNKNOWN = -1;

export function cooldownDaysLeft(family: string): number {
  return cooldownFor(family, Date.now()).daysLeft;
}

export function serverSnapshot(): number {
  return COOLDOWN_UNKNOWN;
}

/**
 * The subscription is real rather than a no-op stub: `storage` fires when
 * ANOTHER tab writes, which is exactly the person who opened the Gym twice and
 * finished a session in the other window. Without it that tab would keep
 * offering a session the cooldown has already claimed.
 */
export function subscribeCooldown(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
