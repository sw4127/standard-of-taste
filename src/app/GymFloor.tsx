"use client";

/**
 * The gym floor — two machines, chosen in two taps (PM proposal, 2026-08-08).
 *
 * WHY TWO TAPS. The colour problem outlived two attempts to fix it. First the
 * cards were made the same component and the same size; then the site kicker
 * was made neutral. It STILL read as the Prestige Test's house, because gold is
 * the only accent on the page until you navigate — the ambient field, the wash,
 * the whole mood is one instrument's colour while the other sits in it as a
 * guest.
 *
 * The PM's fix is better than either of mine: the first tap SELECTS and repaints
 * the room in that instrument's colour; the second tap confirms and goes. The
 * theme stops being a property of the brand and becomes a property of your
 * choice — so neither instrument owns the page until you pick one, and the
 * moment you do, the page is unambiguously about the one you picked.
 *
 * Accessibility: each card is a real button with aria-pressed reflecting
 * selection, and the confirm affordance changes its accessible name, so the
 * two-step is legible to a screen reader rather than being a purely visual
 * state.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tint } from "@/content/instrument-accents";

export interface Machine {
  id: string;
  href: string;
  n: string;
  accent: string;
  /** Ambient field colours while this machine is selected. */
  field: string[];
  /** Page surface luminance while this machine is selected. */
  surface: string;
  title: string;
  criterion: string;
  blurb: string;
  meta: string;
}

export default function GymFloor({ machines, locked }: { machines: Machine[]; locked?: React.ReactNode }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = machines.find((m) => m.id === selected) ?? null;

  // Repaint the page surface to the chosen instrument. RouteBackground owns
  // --app-bg per route; this is the same variable, so the eased transition it
  // already defines carries the change instead of a hard cut.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--app-bg");
    if (chosen) root.style.setProperty("--app-bg", chosen.surface);
    return () => {
      root.style.setProperty("--app-bg", previous);
    };
  }, [chosen]);

  // Prefetch on selection: the second tap should feel instant, since by then
  // the person has already decided.
  useEffect(() => {
    if (chosen) router.prefetch(chosen.href);
  }, [chosen, router]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {machines.map((m) => {
          const isSelected = selected === m.id;
          const dimmed = selected !== null && !isSelected;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={isSelected ? `Start ${m.title}` : `Choose ${m.title}`}
              onClick={() => (isSelected ? router.push(m.href) : setSelected(m.id))}
              className="group flex flex-col rounded-2xl border p-5 text-left transition duration-300 active:scale-[0.99]"
              style={{
                borderColor: isSelected ? m.accent : tint(m.accent),
                background: isSelected ? tint(m.accent, 0.1) : "rgba(255,255,255,0.03)",
                boxShadow: isSelected ? `0 12px 40px ${tint(m.accent, 0.25)}` : "none",
                // NOT opacity: the route-fade animation uses fill-mode both,
                // and a CSS animation overrides inline styles — the dim was
                // silently discarded. A filter is untouched by it.
                filter: dimmed ? "saturate(0.35) brightness(0.6)" : "none",
              }}
            >
              <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: m.accent }}>
                MACHINE {m.n} · {isSelected ? "SELECTED" : "OPEN"}
              </p>
              <p className="mt-1.5 font-display text-xl font-semibold">{m.title}</p>
              <p className="mt-0.5 text-xs font-semibold tracking-wide text-muted">{m.criterion}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-300">{m.blurb}</p>
              <p className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted">{m.meta}</span>
                <span
                  className="font-bold transition-transform group-hover:translate-x-0.5"
                  style={{ color: m.accent }}
                >
                  {isSelected ? "Tap again to start →" : "Choose"}
                </span>
              </p>
            </button>
          );
        })}
        {locked}
      </div>

      <p className="mt-4 text-xs text-muted">
        {chosen
          ? "Tap it again when you're ready. Nothing has started yet."
          : "Free · no sign-up · headphones help · pick either, the room follows"}
      </p>
    </div>
  );
}
