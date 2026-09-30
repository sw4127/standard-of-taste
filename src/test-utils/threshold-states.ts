/**
 * THE THRESHOLD TEST'S STATES A STATIC RENDER NEVER REACHES (bilingual Part 4).
 *
 * `renderSite` skips every `[slug]` route, so the flow's opening screen and the
 * result permalink were read by no rendered-page guard. This renders each
 * family's opening screen and a result for a listener placed inside the ladder,
 * past its gentle end and past its harsh end, plus an abandoned session, on the
 * English and the Chinese route. Each result is reached the way a visitor reaches
 * it: from the raw answers in the address, recomputed by the page.
 */
import { observer, pCorrect, rng } from "@/analytics/observer";
import { answer, axisFor, isFinished, nextTrial, startSession } from "@/engine/staircase-session";
import { SLUG_BY_FAMILY } from "@/app/threshold/families";
import { renderDynamic } from "./render-site";

const LADDERS: Array<{ family: string; sourceId?: string }> = [
  { family: "pitch-drift" },
  { family: "timing-smear" },
  { family: "lossy-artifact", sourceId: "pb1" },
];

/** A simulated sitting's address: the seed and the answers, as the share link carries them. */
export function thresholdSearches(): Array<{ slug: string; search: Record<string, string> }> {
  const out: Array<{ slug: string; search: Record<string, string> }> = [];
  for (const { family, sourceId } of LADDERS) {
    const axis = axisFor(family, sourceId);
    const mid = axis.magnitudes[axis.magnitudes.length >> 1];
    for (const alpha of [mid, axis.magnitudes[0] / 4, axis.magnitudes.at(-1)! * 4]) {
      const seed = 7919;
      const o = observer(alpha, 0.35, 0.02);
      const rand = rng(seed ^ 0x5bf03635);
      let s = startSession(family, seed, sourceId);
      let r = "";
      while (!isFinished(s)) {
        const ok = rand() < pCorrect(s.axis.magnitudes[nextTrial(s).levelIndex], o);
        s = answer(s, ok);
        r += ok ? "1" : "0";
      }
      out.push({ slug: SLUG_BY_FAMILY[family], search: { s: String(seed), r, ...(sourceId ? { src: sourceId } : {}) } });
    }
  }
  out.push({ slug: "pitch", search: { s: "1", r: "" } });
  return out;
}

/** Every opening screen and result, on the English and the Chinese route. */
export async function renderThresholdStates() {
  const out = [];
  for (const prefix of ["", "/zh"]) {
    for (const slug of Object.values(SLUG_BY_FAMILY)) out.push(await renderDynamic(`${prefix}/threshold/[slug]`, { slug }));
    for (const { slug, search } of thresholdSearches()) {
      out.push(await renderDynamic(`${prefix}/threshold/[slug]/result`, { slug }, search));
    }
  }
  return out;
}
