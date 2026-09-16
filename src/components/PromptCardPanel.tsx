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
import { useCallback, useMemo, useRef, useState } from "react";
import type { StaircaseResult } from "@/engine/staircase-session";
import { cardSections, CARD_PASTE } from "@/content/card/copy";
import { CARD_STATEMENT } from "@/content/card/statement";

export default function PromptCardPanel({
  accent,
  results,
}: {
  accent: string;
  /** Every sitting this device holds, current one first in roster order. */
  results: StaircaseResult[];
}) {
  const sections = useMemo(() => cardSections(results), [results]);
  const paste = sections.find((s) => s.heading === CARD_PASTE)?.lines[0] ?? "";
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const pasteRef = useRef<HTMLParagraphElement>(null);

  /*
   * THE FAILURE PATH IS THE COMMON ONE, AND MEASURED RATHER THAN ASSUMED.
   * `navigator.clipboard.writeText` rejects with NotAllowedError whenever the
   * document is not focused — which is every automated run, every embedded
   * preview, and any tab the reader clicked away from — and it is undefined
   * outright on an insecure origin. The first version swallowed all of that:
   * the button said "Copy", the click did nothing, and there was no way for a
   * reader to tell the difference between a silent success and a silent
   * failure.
   *
   * So on failure the card SELECTS the text instead. The reader presses the
   * copy shortcut they already know, and the label says which of the two
   * happened. A button that cannot promise the clipboard can still promise the
   * selection.
   */
  const copy = useCallback(() => {
    if (!paste) return;
    const fallback = () => {
      const node = pasteRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("manual");
    };
    const api = navigator.clipboard;
    if (!api) {
      fallback();
      return;
    }
    void api
      .writeText(paste)
      .then(() => {
        setState("copied");
        window.setTimeout(() => setState("idle"), 2000);
      })
      .catch(fallback);
  }, [paste]);

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
              <div className="mt-2">
                <p
                  ref={pasteRef}
                  data-testid="prompt-card-paste"
                  className="rounded-lg border border-white/12 bg-black/25 px-3 py-2.5 font-mono text-[13px] leading-relaxed text-neutral-200"
                >
                  {section.lines[0]}
                </p>
                <button
                  type="button"
                  onClick={copy}
                  data-testid="prompt-card-copy"
                  className="mt-2.5 rounded-full border border-white/20 px-3.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-neutral-200 transition hover:border-white/40 hover:text-white active:scale-[0.98]"
                >
                  {state === "copied" ? "Copied" : state === "manual" ? "Selected — press copy" : "Copy"}
                </button>
              </div>
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

      {/*
        THE AMENDMENT'S CONDITION, RENDERED (RT-Z5 (b) / RT-Z9 (a)). D1 is
        suspended for this surface on the condition that the surface says so.
        The sentence is not written here — `statement.ts` carries it and a test
        extracts the same words from the constitution's D1 amendment, so this
        disclosure cannot drift away from the ruling that required it.
      */}
      <p
        data-testid="prompt-card-statement"
        className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-muted"
      >
        {CARD_STATEMENT}
      </p>
    </section>
  );
}
