"use client";

/**
 * THE PROMPT CARD, ON SCREEN (E21/T-S4, Track T).
 *
 * WHERE IT SITS, AND WHY THAT IS A RULING RATHER THAN A LAYOUT CHOICE. PM
 * ruling RT-Z7 (2026-09-16) (b): the card sits BESIDE the threshold readout,
 * not instead of it — both are shown, and the ORDERING carries the diagnosis.
 * Card above, number below, expert view unchanged. The number is evidence and
 * the card is the deliverable, and for three months the evidence stood where
 * the deliverable belonged.
 *
 * SO THE NUMBER IS NOT REPEATED HERE AS DECORATION. Each line already names the
 * threshold in its own unit, because a reader who disagrees with a sentence
 * must be able to check it — against the same figure printed directly below.
 * Two surfaces describing one session must never be able to disagree, which is
 * why both come from the same engine call rather than from two.
 *
 * D1 IS SUSPENDED HERE AND NOWHERE ELSE, and the surface says so on itself
 * (T-S5 derives that sentence from the amendment rather than typing it here).
 *
 * IT RENDERS NOTHING WHEN THERE IS NOTHING TO SAY. No shell, no "come back
 * when you have measured more" — an empty card is worse than an absent one,
 * and an invitation to fill in the blanks is the mechanic this product refused.
 */
import { useMemo } from "react";
import type { StaircaseResult } from "@/engine/staircase-session";
import { cardSections, CARD_PASTE } from "@/content/card/copy";

export default function PromptCardPanel({
  accent,
  results,
}: {
  accent: string;
  /** Every sitting this device holds, current one first in roster order. */
  results: StaircaseResult[];
}) {
  const sections = useMemo(() => cardSections(results), [results]);
  if (sections.length === 0) return null;

  return (
    <section
      data-testid="prompt-card"
      className="mt-8 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-6"
    >
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
        Your prompt card
      </p>

      <div className="mt-5 space-y-6">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="font-display text-base font-semibold text-white">{section.heading}</h3>
            {section.heading === CARD_PASTE ? (
              <p
                data-testid="prompt-card-paste"
                className="mt-2 rounded-lg border border-white/12 bg-black/25 px-3 py-2.5 font-mono text-[13px] leading-relaxed text-neutral-200"
              >
                {section.lines[0]}
              </p>
            ) : (
              <div className="mt-2 space-y-2.5">
                {section.lines.map((line) => (
                  <p key={line} className="text-[15px] leading-relaxed text-neutral-300">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
