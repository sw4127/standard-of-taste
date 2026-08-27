/**
 * Recovery scatter — hand-rolled inline SVG (artifact pivot §4).
 *
 * No charting library on purpose: one plot type, a fixed domain, and a strict
 * CSP-friendly output. A dependency here would cost more than it saves and
 * would ship kilobytes to render forty dots.
 *
 * ACCESSIBILITY: a chart with no text alternative is a chart half the audience
 * cannot read. Every plot carries role="img" plus an aria-label that states the
 * actual finding, not just the axis names — and the numbers behind it are
 * always also present in the table beside it.
 */

import { PRESTIGE_GOLD } from "@/content/instrument-accents";
const GOLD = PRESTIGE_GOLD;

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

export default function ScatterPlot({
  points,
  domain,
  xLabel,
  yLabel,
  caption,
  ariaLabel,
}: {
  points: ScatterPoint[];
  /** [min, max] applied to BOTH axes — a recovery plot must be square, or the
   *  identity line stops being a 45° reference and the eye is misled. */
  domain: [number, number];
  xLabel: string;
  yLabel: string;
  caption: string;
  ariaLabel: string;
}) {
  const SIZE = 200;
  const PAD = 26;
  const [lo, hi] = domain;
  const span = hi - lo || 1;
  const px = (v: number) => PAD + ((v - lo) / span) * (SIZE - 2 * PAD);
  const py = (v: number) => SIZE - PAD - ((v - lo) / span) * (SIZE - 2 * PAD);

  const ticks = [lo, lo + span / 2, hi];
  const fmt = (v: number) => v.toFixed(2).replace(/^0\./, ".");

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="block w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Plot frame */}
        <rect
          x={PAD}
          y={PAD}
          width={SIZE - 2 * PAD}
          height={SIZE - 2 * PAD}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.75}
        />

        {/* Identity line: perfect recovery lies exactly on it. */}
        <line
          x1={px(lo)}
          y1={py(lo)}
          x2={px(hi)}
          y2={py(hi)}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {ticks.map((t) => (
          <g key={t}>
            <text
              x={px(t)}
              y={SIZE - PAD + 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              fontSize={7}
              fontFamily="monospace"
            >
              {fmt(t)}
            </text>
            <text
              x={PAD - 5}
              y={py(t) + 2.5}
              textAnchor="end"
              fill="rgba(255,255,255,0.45)"
              fontSize={7}
              fontFamily="monospace"
            >
              {fmt(t)}
            </text>
          </g>
        ))}

        {points.map((p, i) => (
          <circle
            key={p.label ?? i}
            cx={px(p.x)}
            cy={py(p.y)}
            r={2.4}
            fill={GOLD}
            fillOpacity={0.72}
            stroke={GOLD}
            strokeWidth={0.5}
          >
            {p.label && <title>{p.label}</title>}
          </circle>
        ))}

        <text
          x={SIZE / 2}
          y={SIZE - 3}
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize={7.5}
          fontFamily="monospace"
        >
          {xLabel}
        </text>
        <text
          x={9}
          y={SIZE / 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize={7.5}
          fontFamily="monospace"
          transform={`rotate(-90 9 ${SIZE / 2})`}
        >
          {yLabel}
        </text>
      </svg>
      <figcaption className="mt-1 text-center font-mono text-[0.6rem] tracking-[0.15em] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
