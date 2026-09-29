/**
 * THE READING'S STATES A STATIC RENDER NEVER REACHES (bilingual Part 2, red-team).
 *
 * Every listener's lines, its prompt and its creation screen, in both languages.
 * The guards that read rendered pages render these with `renderState`, so a
 * sentence on the prompt screen is held to the same rules as the picker.
 */
import { LISTENERS } from "@/content/reading/listeners";
import { renderState } from "./render-site";

export const READING_SEARCHES: readonly string[] = LISTENERS.flatMap((l) => [
  `l=${l.id}`,
  `l=${l.id}&step=prompt`,
  `l=${l.id}&step=create`,
]);

/** Every state of the reading, on the English and the Chinese route. */
export async function renderReadingStates() {
  const out = [];
  for (const route of ["/reading", "/zh/reading"]) {
    for (const search of READING_SEARCHES) out.push(await renderState(route, search));
  }
  return out;
}
