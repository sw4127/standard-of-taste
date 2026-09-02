import { BIAS_CLIPS } from "@/content/bias/items";
import type { BiasRatings } from "@/engine/bias";
import { computeComparisonResult } from "@/engine/comparison";
import { comparisonDegreesClaim } from "@/engine/evidence";
import {
  COMPARISON_PANEL,
  comparisonLines,
  criticReferenceLines,
  ourScaleLine,
} from "@/content/vocabulary/comparison";

/**
 * HUME'S FIFTH CRITERION, ON THE PRESTIGE RESULT (E16/S5, Track I).
 *
 * ONE COMPONENT, BOTH SURFACES, AND THAT IS THE WHOLE POINT OF IT EXISTING.
 * The creator-translation block was written for `/bias/result` in E8/S8 and
 * missed on the reveal screen a person actually finishes on — the same block,
 * the same data, absent from the one place most people would ever see it
 * (E8/S12). This reading is mounted from a single component in both places so
 * that omission cannot recur by construction rather than by remembering.
 *
 * IT DOES NOT COMPETE WITH THE HEADLINE. The screen already has one focal
 * point — the sway percentage, set large in the display face. A second big
 * number here would give the page two, so the degrees count is set at body
 * scale with only the numerator in the accent. The reading is a second
 * paragraph on the same page, not a second verdict.
 *
 * THE CRITIC BLOCK IS COLLAPSED, using the same `<details>` disclosure the
 * expert panel uses. Two paragraphs about other people's rating scales are
 * genuinely interesting and genuinely not what someone came for, and burying
 * depth behind an affordance is what D5 asks for — unlocked, never buried.
 *
 * NOTHING HERE IS CONDITIONAL ON HAVING A GOOD RESULT. The reading renders for
 * every rating pattern, including the compressed one where the second number
 * refuses; `comparisonLines` writes that refusal as a sentence, so this
 * component never has to decide what an empty space means.
 */
export default function ComparisonReading({
  accent,
  blind,
  labeled,
}: {
  accent: string;
  blind: BiasRatings;
  labeled: BiasRatings;
}) {
  const result = computeComparisonResult(BIAS_CLIPS, blind, labeled);
  const degrees = comparisonDegreesClaim(result);
  const lines = comparisonLines(result);

  return (
    <section className="mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
        {COMPARISON_PANEL.eyebrow}
      </p>

      {degrees.ok ? (
        <p className="mt-3 text-sm text-muted">
          <span className="font-display text-2xl font-semibold" style={{ color: accent }}>
            {degrees.value.degreesUsed}
          </span>{" "}
          <span className="font-display text-2xl font-semibold">
            of {degrees.value.degreesAvailable}
          </span>{" "}
          {COMPARISON_PANEL.statLabel}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-3">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-neutral-300">
            {line}
          </p>
        ))}
      </div>

      <details className="group mt-5 border-t border-white/10 pt-5">
        <summary className="cursor-pointer list-none">
          <span className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
            {COMPARISON_PANEL.criticsEyebrow}
          </span>{" "}
          <span className="text-[0.65rem] text-muted group-open:hidden">
            {COMPARISON_PANEL.show}
          </span>
          <span className="hidden text-[0.65rem] text-muted group-open:inline">
            {COMPARISON_PANEL.hide}
          </span>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {COMPARISON_PANEL.criticsBlurb}
          </p>
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {criticReferenceLines().map((line) => (
            <p key={line} className="text-xs leading-relaxed text-muted">
              {line}
            </p>
          ))}
          <p className="text-xs leading-relaxed text-neutral-300">{ourScaleLine()}</p>
        </div>
      </details>
    </section>
  );
}
