/**
 * THE CREATOR TRANSLATION FOR THE PRESTIGE TEST (E8/S6, 2026-08-26).
 *
 * WHAT THE SCREEN ALREADY SAYS: the signed percentage, the caption "how far
 * these ratings moved toward the labels", and the verdict pair from
 * `VERDICT_COPY` ("Label-driven." / "Steady ears." / "Contrarian."). This layer
 * repeats none of it.
 *
 * WHAT IT ADDS.
 *
 * IT CARRIES NO COUNTS, DELIBERATELY. The first draft opened with "on the 14
 * clips where your rating had room to move, it moved toward the label on 14" —
 * which is word for word the job of the receipt pill the FLOW already renders
 * ("You moved with the label on N of M clips that could move"), and of
 * `biasCardSwayLine` on the share card. Evidence belongs to the measurement
 * layer; this layer is vocabulary and boundary. Nothing in the repo would have
 * caught that draft, because it duplicated a fragment of JSX rather than a
 * string from a copy deck — the same gap `FLAW_LINE_PREFIX` was moved into a
 * deck to close.
 *
 * WHAT IT ADDS: where the cue lives in the reader's own work, and a hard
 * boundary around it.
 *
 * THE BOUNDARY IS THE WHOLE DIFFICULTY OF THIS FILE. The instrument put a
 * composer's name in front of a stranger's recording and measured what moved.
 * It did NOT measure what happens when the label is "I spent an hour on this
 * prompt" or "this is the take I already showed someone". Those are the cues
 * that actually cost a person making music with AI tools, and the temptation to
 * quietly extend the finding to them is exactly the over-claim D1 forbids: a
 * claim about the person rather than about the performance.
 *
 * So the copy NAMES those cues as the same KIND of thing and says, in the same
 * breath, that this test did not measure them. Naming a cue is vocabulary,
 * which is what this layer is for. Asserting it moves you would be fiction.
 *
 * N3: no percentile, no cohort, no promise that anything here improves output.
 * Deterministic templates, no LLM (blueprint section 4).
 */
import type { BiasResult, BiasVerdict } from "@/engine/bias";
import { biasClaim } from "@/engine/evidence";

/**
 * The cues that stand in for a famous name once someone is judging their own
 * renders. Fixed copy — it describes the world, not the session.
 */
export const CUE_IN_YOUR_WORK =
  "In your own work the label is rarely a composer's name. It is which model made it, how long you " +
  "spent on the prompt, and whether this is the take you already told someone was the good one.";

/**
 * The receipt plus the honest boundary, branched on the engine's own verdict.
 *
 * BRANCHED ON `verdict`, NOT ON `swayShare`, because the verdict is what the
 * screen above already displays and what the engine computes from the
 * drift-corrected number. Branching on a second statistic would let this
 * paragraph disagree with the headline it sits under.
 */
export function whatToDoAboutIt(verdict: BiasVerdict): string {
  if (verdict === "contrarian") {
    return (
      `Your ratings ran against the names rather than with them, and that is still a cue steering the ` +
      `judgment — it is only pointing the other way. The move is the same either way: decide before the ` +
      `label arrives, not after it.`
    );
  }

  if (verdict === "steady") {
    return (
      `That result is about these names, on this afternoon. The cue this test cannot put in front of ` +
      `you is your own effort — the hour in the prompt, the take you already shared — and nothing here ` +
      `has measured that one.`
    );
  }

  return (
    `This test played every clip unlabelled first, and that order is the part worth stealing: the cue ` +
    `has to be gone before the judgment, not argued away after it.`
  );
}

/**
 * The two sentences, in reading order. Empty when no rating had headroom —
 * `biasClaim` refuses there, because "0% swayed" would describe the scale
 * rather than the person (N3).
 */
export function creatorLines(result: BiasResult): string[] {
  if (!biasClaim(result).ok) return [];
  return [CUE_IN_YOUR_WORK, whatToDoAboutIt(result.verdict)];
}
