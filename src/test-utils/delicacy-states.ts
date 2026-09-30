/**
 * THE DELICACY RESULT PERMALINK, WHICH A STATIC RENDER NEVER REACHES (bilingual Part 4).
 *
 * `/delicacy/result` redirects without answers in its address, so the site-wide render
 * never read it. This renders it for a listener who caught every pair, one who caught
 * none, and one at chance, on the English and the Chinese route, from the raw answers
 * a shared link carries.
 */
import { encodeDelicacyResponses, type DelicacyResponses } from "@/engine/delicacy";
import { DELICACY_POOL_VERSION, MEASURED_TRIALS } from "@/content/delicacy/items";
import { renderDynamic } from "./render-site";

function picks(right: (i: number) => boolean): Record<string, string> {
  const r: DelicacyResponses = {};
  MEASURED_TRIALS.forEach((t, i) => {
    const ok = right(i);
    r[t.id] = { pickedSide: ok ? t.originalSide : t.originalSide === "a" ? "b" : "a", flawPick: t.family, confidence: 70 };
  });
  return { pv: String(DELICACY_POOL_VERSION), p: encodeDelicacyResponses(MEASURED_TRIALS, r) };
}

/** All caught, none caught, and about half. */
export const DELICACY_SEARCHES = [picks(() => true), picks(() => false), picks((i) => i % 2 === 0)];

export async function renderDelicacyStates() {
  const out = [];
  for (const route of ["/delicacy/result", "/zh/delicacy/result"]) {
    for (const search of DELICACY_SEARCHES) out.push(await renderDynamic(route, {}, search));
  }
  return out;
}
