/**
 * THE PROMPT, RECOMPOSED FROM WHAT THE READER KEPT (blueprint Part 5; BP-UNMET).
 *
 * The reading ends in something the reader can carry out: a prompt for a music
 * generator, in generic generator vocabulary with no generator named (RT-Z8 a).
 * It is built only from what survived the reader's argument with it:
 *
 * - a REJECTED line contributes nothing;
 * - a kept line contributes the sound of the tracks it is about, and its own
 *   direction (its `cue`), so rejecting any line always changes the prompt —
 *   the first version used only the sound, and two lines about the same sound
 *   could be rejected without the prompt moving at all;
 * - a CHOSEN reading contributes its words; "neither", or no choice yet,
 *   contributes none. The reader's side of the argument is the mood.
 *
 * THE SOUND IS GROUPED BY FLAW FAMILY (BP-BRIDGE). Tuning, timing and fidelity
 * words are exactly what the Threshold Test measures, so a reader who has sat
 * one can see which of their prompt's words they can actually hear.
 *
 * Templates only (BA-10). NOT YET THROUGH A WRITING PASS.
 */
import type { ReadingLine } from "./lines";
import type { Reading } from "./reading";
import { FLAW_FAMILIES, type FlawFamily } from "./types";

export type Choice = "a" | "b" | "neither";

export interface ReaderState {
  /** Lines the reader rejected: they drop out. */
  rejected: string[];
  /** The reading chosen per line. Absent means not chosen yet. */
  chosen: Record<string, Choice>;
}

export const EMPTY_STATE: ReaderState = { rejected: [], chosen: {} };

export interface Prompt {
  /** The lines that fed it, in reading order. */
  kept: ReadingLine[];
  style: string;
  vocals: string;
  production: string;
  mood: string[];
  /** The sound in each flaw family's words, for the bridge. */
  families: Record<FlawFamily, string[]>;
  /** The whole prompt, as one pasteable text. */
  text: string;
}

export const FAMILY_LABEL: Record<FlawFamily, string> = {
  tuning: "Tuning",
  timing: "Timing",
  compression: "Fidelity",
};

const unique = (xs: string[]) => [...new Set(xs)];

export function buildPrompt(r: Reading, s: ReaderState): Prompt {
  const kept = r.lines.filter((l) => !s.rejected.includes(l.id));
  const byId = new Map(r.listener.clusters.map((c) => [c.id, c]));
  // The sound of the kept lines, the first-kept line's cluster leading.
  const clusters = unique(kept.map((l) => l.cluster)).map((id) => byId.get(id)!);
  const mood = unique(
    kept.flatMap((l) => {
      const c = s.chosen[l.id];
      return c === "a" || c === "b" ? l.offers.find((o) => o.id === c)!.words : [];
    }),
  );
  const families = Object.fromEntries(
    FLAW_FAMILIES.map((f) => [f, unique(clusters.map((c) => c.family[f]))]),
  ) as Record<FlawFamily, string[]>;

  if (clusters.length === 0) {
    return { kept, style: "", vocals: "", production: "", mood: [], families, text: "" };
  }
  const [lead, ...rest] = clusters;
  const style = [
    `${lead.sound.texture}, ${lead.sound.tempo}`,
    ...rest.map((c) => `with touches of ${c.sound.texture}`),
  ].join("; ");
  const vocals = lead.sound.voice;
  const production = lead.sound.production;
  const lines = [
    `Style: ${style}.`,
    `Vocals: ${vocals}.`,
    `Production: ${production}.`,
    // Each kept line's own direction, in reading order: rejecting a line always removes one.
    ...kept.map((l) => `${l.cue.label}: ${l.cue.text}.`),
    ...FLAW_FAMILIES.map((f) => `${FAMILY_LABEL[f]}: ${families[f].join("; ")}.`),
    ...(mood.length ? [`Mood: ${mood.join(", ")}.`] : []),
  ];
  return { kept, style, vocals, production, mood, families, text: lines.join("\n") };
}
