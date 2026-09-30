/**
 * THE PRESTIGE RESULT PERMALINK, WHICH A STATIC RENDER NEVER REACHES (bilingual Part 4).
 *
 * `/bias/result` redirects without ratings in its address, so the site-wide render
 * never read it. This renders it for a listener swayed toward the labels, one
 * pushed against them, one steady, and one with no headroom at all, on the English
 * and the Chinese route, from the raw ratings a shared link carries.
 */
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN, encodeBiasRatings } from "@/engine/bias";
import { BIAS_CLIPS, BIAS_POOL_VERSION } from "@/content/bias/items";
import { renderDynamic } from "./render-site";

function ratings(shift: number, blindAt = 5) {
  const blind: Record<string, number> = {};
  const labeled: Record<string, number> = {};
  for (const c of BIAS_CLIPS) {
    blind[c.id] = c.isControl ? 5 : blindAt === 5 ? 5 : c.labelDirection === "up" ? BIAS_SCALE_MAX : BIAS_SCALE_MIN;
    const toward = c.isControl ? 0 : c.labelDirection === "up" ? shift : -shift;
    labeled[c.id] = Math.max(BIAS_SCALE_MIN, Math.min(BIAS_SCALE_MAX, blind[c.id] + toward));
  }
  return { pv: String(BIAS_POOL_VERSION), b: encodeBiasRatings(BIAS_CLIPS, blind), l: encodeBiasRatings(BIAS_CLIPS, labeled) };
}

/** The four searches: swayed, contrarian, steady, and no headroom. */
export const BIAS_SEARCHES = [ratings(2), ratings(-2), ratings(0), ratings(0, -1)];

export async function renderBiasStates() {
  const out = [];
  for (const route of ["/bias/result", "/zh/bias/result"]) {
    for (const search of BIAS_SEARCHES) out.push(await renderDynamic(route, {}, search));
  }
  return out;
}
