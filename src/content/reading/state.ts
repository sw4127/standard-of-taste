/**
 * THE READER'S SIDE OF THE ARGUMENT, KEPT FOR THE LENGTH OF ONE TAB.
 *
 * Which lines were rejected and which readings were chosen. Kept in
 * `sessionStorage` so a reader who follows the bridge to a hearing test and
 * comes back finds their argument where they left it — and nothing outlives the
 * tab. Not `localStorage`: the product persists exactly one thing across
 * visits, the session store (`forget-device.test.ts` holds that), and a choice
 * about an illustrative listener is not worth a second.
 *
 * EVERY READ AND WRITE IS WRAPPED. Storage throws in private windows and where
 * site data is blocked; the page must work without it, and does — the state
 * simply starts empty.
 */
import { EMPTY_STATE, type Choice, type ReaderState } from "./prompt";

/** Outside the `gym.` namespace on purpose: tab keys are cleared with the tab (data-model.test.ts). */
export const READING_STATE_KEY = "reading_choices";

function all(): Record<string, ReaderState> {
  try {
    const raw = sessionStorage.getItem(READING_STATE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, ReaderState>) : {};
  } catch {
    return {};
  }
}

const CHOICES: readonly Choice[] = ["a", "b", "neither"];

/** A stored state, validated: anything malformed is dropped rather than trusted. */
export function loadState(listenerId: string): ReaderState {
  const s = all()[listenerId];
  if (!s || !Array.isArray(s.rejected) || typeof s.chosen !== "object" || s.chosen === null) return EMPTY_STATE;
  return {
    rejected: s.rejected.filter((x): x is string => typeof x === "string"),
    chosen: Object.fromEntries(
      Object.entries(s.chosen).filter(([, v]) => CHOICES.includes(v as Choice)),
    ) as Record<string, Choice>,
  };
}

export function saveState(listenerId: string, state: ReaderState): void {
  try {
    sessionStorage.setItem(READING_STATE_KEY, JSON.stringify({ ...all(), [listenerId]: state }));
  } catch {
    // Private window, blocked storage, full quota: the page works without it.
  }
}
