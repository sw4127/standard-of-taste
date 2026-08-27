"use client";

/**
 * FluidField — a palette-agnostic ambient mesh-gradient background (the shared
 * "fluid" design primitive). Layered radial gradients with a slow GPU drift.
 *
 * Cross-fade: `background-image` can't be CSS-transitioned, so when `colors`
 * change (football phase flip, music hue drift) we ping-pong two stacked layers
 * and transition OPACITY (compositor-cheap) → no hard colour cut.
 *
 * Transparent base: the field paints only the blobs (+ scrim/vignette); the page
 * surface comes from the body (`--app-bg`), which eases on route change — so the
 * mesh sits on a luminance that never flash-bangs. `baseColor` is still used for
 * the light-stage scrim. Deterministic anchors → no hydration mismatch.
 */
import { useEffect, useRef, useState } from "react";

type Common = {
  colors: string[];
  /** 0–1 blob opacity. Lower = subtler field. */
  intensity?: number;
  animated?: boolean;
  /** Radial edge-darkening for painterly depth/chiaroscuro (oil-painting feel). */
  vignette?: boolean;
};

/**
 * `baseColor` IS ONLY READ UNDER `scrim`, AND THE TYPE NOW SAYS SO (E10/S7,
 * PM ruling RT-AI:a).
 *
 * It was a required prop, and 23 of the 24 call sites passed one while also
 * passing `scrim={false}` — so 23 colours were handed to a component that
 * never painted them. Three of those were constants named as each instrument's
 * own dark backdrop (`#0B0A08` "warm near-black — the gym after hours",
 * `#07090B` "cold near-black", `THRESHOLD_BASE`), describing a difference the
 * eye has never seen: every one of those pages takes its surface from
 * `--app-bg`, which `RouteBackground` sets to `#08090d` for all of them.
 *
 * A union rather than an optional prop. `baseColor?: string` would have let the
 * dead argument keep being passed; `baseColor?: never` makes passing it without
 * `scrim` a compile error, so the 23 had to actually go — and `scrim: true`
 * cannot be turned on without supplying the colour it needs.
 */
type Props =
  | (Common & { scrim: true; baseColor: string })
  | (Common & { scrim?: false; baseColor?: never });

// Fixed blob anchors (% positions) — stable across SSR/CSR.
const ANCHORS = ["14% 16%", "84% 20%", "22% 82%", "80% 74%", "48% 46%", "6% 56%"];

export default function FluidField({ colors, baseColor, intensity = 0.5, animated = true, scrim = true, vignette = false }: Props) {
  const op = Math.max(0, Math.min(1, intensity));
  const target = colors
    .map((c, i) => `radial-gradient(circle at ${ANCHORS[i % ANCHORS.length]}, ${c} 0%, transparent 46%)`)
    .join(", ");

  // Two layers; the front one shows `op`, the back one 0. On a colour change we
  // load the new stack onto the back layer and flip — it fades in over the old.
  // Both layers stay mounted so opacity can transition both ways (a fresh mount
  // would pop in, not fade). The idle layer sits at opacity 0 → paint-skipped,
  // so the cost is negligible.
  const [a, setA] = useState(target);
  const [b, setB] = useState(target);
  const [front, setFront] = useState<"a" | "b">("a");
  const last = useRef(target);
  // The flip is scheduled on the next animation frame rather than run
  // synchronously in the effect body (RT-15). Two reasons, and the lint rule is
  // the smaller one: a frame callback is the documented shape for driving an
  // external system (here, the browser's CSS transition engine), and it
  // GUARANTEES the idle layer has been painted at opacity 0 before it becomes
  // the front layer at `op`. Without a painted from-state a CSS opacity
  // transition has nothing to interpolate and the new colours pop in — which is
  // the exact "flash-bang" this two-layer cross-fade was built to fix (649cace).
  //
  // `last.current` is advanced INSIDE the callback, never before scheduling it.
  // requestAnimationFrame does not fire in a hidden or throttled tab, so the
  // effect can be cleaned up before the callback ever runs — and marking the
  // target as applied up front would strand the field on stale colours forever,
  // because the next render would early-return on a target it never actually
  // painted. Same class of bug as the ClipPlayer ring freeze in throttled tabs.
  useEffect(() => {
    if (target === last.current) return;
    const id = requestAnimationFrame(() => {
      last.current = target;
      if (front === "a") {
        setB(target);
        setFront("b");
      } else {
        setA(target);
        setFront("a");
      }
    });
    return () => cancelAnimationFrame(id);
  }, [target, front]);

  const layer = (bg: string, show: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    backgroundImage: bg,
    opacity: show ? op : 0,
    transition: "opacity 650ms ease",
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className={animated ? "vc-fluid" : undefined} style={{ position: "absolute", inset: "-25%" }}>
        <div style={layer(a, front === "a")} />
        <div style={layer(b, front === "b")} />
      </div>
      {/* Top scrim — calms the header/title zone so dark ink stays legible
          regardless of which palette blob drifts up there (light stages only). */}
      {scrim ? (
        <div
          style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(180deg, ${baseColor}E6, ${baseColor}00 30%)` }}
        />
      ) : null}
      {/* Painterly vignette — darker edges focus the centre (chiaroscuro). */}
      {vignette ? (
        <div
          style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 42%, transparent 46%, rgba(0,0,0,0.36) 100%)" }}
        />
      ) : null}
      <style>{`@keyframes vcFluidDrift{0%{transform:translate3d(0,0,0) scale(1.04)}50%{transform:translate3d(2%,-1.5%,0) scale(1.1)}100%{transform:translate3d(0,0,0) scale(1.04)}}.vc-fluid{animation:vcFluidDrift 22s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.vc-fluid{animation:none}}`}</style>
    </div>
  );
}
