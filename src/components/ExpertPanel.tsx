"use client";

/**
 * THE RAW RECORD, ON EVERY RESULT SCREEN (E8/C2, Track C, RT-E(a)).
 *
 * WHAT IT IS. A verdict-free panel showing the evidence the instrument already
 * computed and never displayed: per-family and per-rung tallies, the
 * trial-by-trial record, the staircase's rung visits and measured limits, the
 * prestige test's per-item blind/labelled/headroom. Every word on screen comes
 * from this file; `src/engine/expert.ts` supplies numbers, ids and enums only,
 * so a verdict cannot travel in the data.
 *
 * IT READS FROM STORAGE, NOT FROM PROPS, AND THAT IS A LEAK FIX RATHER THAN A
 * PREFERENCE. The obvious build computes the payload on the server and passes
 * it down. That would put the ANSWER KEY — which delicacy pair was damaged,
 * which prestige labels were fictional — into the server-rendered HTML of a
 * SHARE TARGET. Hiding the panel from a non-owner would then hide nothing: the
 * data sits in view-source for anyone who opens the link. So the payload is
 * derived in the browser from `result-recall`, which reads this device's own
 * localStorage, and nothing about it is ever serialised into the page.
 *
 * OWNERSHIP IS THE PROTECTION (PM ruling RT-O(a)). The panel renders only when
 * the result on screen is the one this device recorded — the same rule
 * `AcrossSessions` uses, for the same reason and via the same comparison. On
 * anyone else's link it renders nothing at all.
 *
 * COLLAPSED BY DEFAULT, and with `<details>` rather than React state: the
 * Design Quality Bar wants one focal point per screen and this must not compete
 * with the reveal. `<details>` is keyboard-accessible and works before
 * hydration, which a state-driven disclosure does not.
 *
 * NUMBERS ARE FORMATTED HERE. `expert.ts` carries the fitted point at full
 * float precision because rounding is presentation's job — and unformatted it
 * reads "9.427684016372181 cents", which implies a precision this instrument
 * does not have on an interval spanning most of the ladder.
 */

import { useMemo, useSyncExternalStore } from "react";
import { readResult, subscribeResults, type StoredPayload } from "@/lib/result-store";
import { POOL_VERSIONS, recallBias, recallDelicacy, recallThreshold } from "@/lib/result-recall";
import { biasExpert, delicacyExpert, thresholdExpert } from "@/engine/expert";
import type { BiasExpert, CalibrationCurve, DelicacyExpert, ThresholdExpert } from "@/engine/expert";
import { quantity, shortUnit } from "@/content/staircase/copy";
import { FLAW_LABELS } from "@/content/delicacy/items";
import {
  EXPERT_COLUMNS as COL,
  EXPERT_NOTES as NOTE,
  EXPERT_PANEL as PANEL,
  EXPERT_SECTIONS as SEC,
  EXPERT_STATS as STAT,
  EXPERT_VALUES as VAL,
  brierNote,
} from "@/content/vocabulary/expert";

type Instrument =
  | { kind: "delicacy" }
  | { kind: "bias" }
  | { kind: "threshold"; slug: string };

function signature(): string {
  try {
    if (typeof localStorage === "undefined") return "";
    return String(localStorage.length);
  } catch {
    return "";
  }
}
const serverSignature = () => "";

function isOwn(own: StoredPayload): boolean {
  const stored =
    own.kind === "bias"
      ? readResult("bias", POOL_VERSIONS.bias)
      : own.kind === "delicacy"
        ? readResult("delicacy", POOL_VERSIONS.delicacy)
        : readResult("threshold", POOL_VERSIONS.threshold, own.slug);
  if (!stored) return false;
  return JSON.stringify(stored.payload) === JSON.stringify(own);
}

/* ------------------------------------------------------------------ *
 * Shared primitives
 * ------------------------------------------------------------------ */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm text-neutral-200">{value}</dd>
    </div>
  );
}

function Stats({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <Stat key={label} label={label} value={value} />
      ))}
    </dl>
  );
}

/** Wide tables scroll inside their own box; the page never scrolls sideways. */
function Table({ head, rows }: { head: string[]; rows: Array<Array<string>> }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left font-mono text-xs">
        <thead>
          <tr className="border-b border-white/15">
            {head.map((h) => (
              <th key={h} className="py-1.5 pr-4 font-bold uppercase tracking-[0.12em] text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap py-1.5 pr-4 text-neutral-300">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Per-instrument bodies
 * ------------------------------------------------------------------ */


/**
 * THE RELIABILITY DIAGRAM (E8/C3).
 *
 * Claimed confidence on x, delivered accuracy on y, with the diagonal as
 * perfect calibration: a point ABOVE the line means you did better than you
 * said, below means worse. It is the one thing in blueprint C1 that existed in
 * no form — the bins were already listed as text on the result screen, but a
 * list does not show DISTANCE FROM THE LINE, which is the whole quantity.
 *
 * IT IS READABLE WITHOUT THE PICTURE, and that is not only an accessibility
 * note: this session cannot see pixels, so a chart whose only content is
 * geometry could not be verified at all. Every point carries its numbers beside
 * it, and the same figures repeat in the list below, so the SVG adds a spatial
 * reading rather than being the sole carrier of the data.
 *
 * SUPPRESSED BINS ARE ABSENT, NOT PLOTTED AT ZERO. A confidence level answered
 * twice has no rate (N3, `MIN_BIN_N`), and a point at the origin would read as
 * "you got none of them right" rather than "there is nothing to say".
 */
function CalibrationCurveChart({ c, accent }: { c: CalibrationCurve; accent: string }) {
  const shown = c.points.filter((p) => p.observedPct !== null);
  const PAD = 26;
  const SIZE = 150;
  const x = (pct: number) => PAD + (pct / 100) * SIZE;
  const y = (pct: number) => PAD + SIZE - (pct / 100) * SIZE;

  return (
    <>
      {shown.length > 0 ? (
        <svg
          viewBox={`0 0 ${SIZE + PAD * 2} ${SIZE + PAD * 2}`}
          className="mt-3 w-full max-w-[260px]"
          role="img"
          aria-label={`Calibration: ${shown
            .map((p) => `claimed ${p.claimedPct}%, delivered ${Math.round(p.observedPct!)}%`)
            .join("; ")}`}
        >
          <rect x={PAD} y={PAD} width={SIZE} height={SIZE} fill="none" stroke="rgba(255,255,255,0.12)" />
          {/* Perfect calibration. Everything is read as distance from this. */}
          <line
            x1={x(0)} y1={y(0)} x2={x(100)} y2={y(100)}
            stroke="rgba(255,255,255,0.28)" strokeDasharray="3 3"
          />
          {shown.map((p) => (
            <g key={p.claimedPct}>
              <line
                x1={x(p.claimedPct)} y1={y(p.claimedPct)}
                x2={x(p.claimedPct)} y2={y(p.observedPct!)}
                stroke={accent} strokeOpacity={0.35}
              />
              <circle
                cx={x(p.claimedPct)} cy={y(p.observedPct!)} r={3.5} fill={accent}
                data-claimed={p.claimedPct} data-observed={Math.round(p.observedPct!)}
              />
            </g>
          ))}
          <text x={PAD} y={SIZE + PAD + 14} fill="rgba(255,255,255,0.45)" fontSize="9">0%</text>
          <text x={x(100) - 14} y={SIZE + PAD + 14} fill="rgba(255,255,255,0.45)" fontSize="9">100%</text>
          <text x={PAD} y={PAD - 8} fill="rgba(255,255,255,0.45)" fontSize="9">delivered</text>
          <text x={x(100) - 30} y={SIZE + PAD + 24} fill="rgba(255,255,255,0.45)" fontSize="9">claimed</text>
        </svg>
      ) : null}
      <Table
        head={[COL.youSaid, COL.right, COL.of, COL.delivered, COL.versusClaim]}
        rows={c.points.map((p) => [
          `${p.claimedPct}%`,
          String(p.correct),
          String(p.n),
          p.observedPct === null ? VAL.tooFewToSay : `${Math.round(p.observedPct)}%`,
          p.observedPct === null
            ? VAL.none
            : `${Math.round(p.observedPct) - p.claimedPct > 0 ? "+" : ""}${Math.round(p.observedPct) - p.claimedPct} pts`,
        ])}
      />
      <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
        {brierNote(c.brier, c.n, c.brierChance)}
      </p>
    </>
  );
}

function DelicacyBody({ d, accent }: { d: DelicacyExpert; accent: string }) {
  return (
    <>
      <Section title={SEC.delicacyByFamily}>
        <Table
          head={[COL.family, COL.caught, COL.shown]}
          rows={d.perFamily.map((f) => [FLAW_LABELS[f.family].label, String(f.correct), String(f.n)])}
        />
      </Section>
      <Section title={SEC.delicacyByRung}>
        <Table
          head={[COL.rung, COL.caught, COL.shown]}
          rows={d.perMagnitude.map((m) => [String(m.magnitude), String(m.correct), String(m.n)])}
        />
      </Section>
      <Section title={SEC.delicacyCalibration}>
        <CalibrationCurveChart c={d.calibration} accent={accent} />
      </Section>
      <Section title={SEC.delicacyTrials}>
        <Table
          head={[COL.index, COL.family, COL.rung, COL.original, COL.youPicked, COL.flawNamed, COL.said]}
          rows={d.trials.map((t) => [
            String(t.index),
            FLAW_LABELS[t.family].label,
            t.value === null ? `rung ${t.magnitude}` : `${t.value} ${t.unit}`,
            t.originalSide.toUpperCase(),
            `${t.pickedSide.toUpperCase()} ${t.correct ? "✓" : "✗"}`,
            t.flawCorrect === null ? VAL.none : `${FLAW_LABELS[t.flawPick].label} ${t.flawCorrect ? "✓" : "✗"}`,
            `${t.confidence}%`,
          ])}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
  {NOTE.timingRungs}
        </p>
      </Section>
    </>
  );
}

function ThresholdBody({ t }: { t: ThresholdExpert }) {
  const u = shortUnit(t.unit);
  return (
    <>
      <Section title={SEC.thresholdSession}>
        <Stats
          items={[
            [STAT.trials, String(t.trials)],
            [STAT.outcome, t.kind],
            [STAT.caughtAt, t.heardAt === null ? VAL.none : quantity(t.heardAt, t.unit)],
            [STAT.missedAt, t.missedAt === null ? VAL.none : quantity(t.missedAt, t.unit)],
            [STAT.fittedPoint, t.point === null ? VAL.notEarned : quantity(t.point, t.unit)],
            [
              STAT.interval,
              t.ci95 === null ? VAL.none : `${quantity(t.ci95[0], t.unit)} – ${quantity(t.ci95[1], t.unit)}`,
            ],
          ]}
        />
      </Section>
      <Section title={`${SEC.thresholdRungs} · ${u}`}>
        <Table
          head={[COL.rung, COL.right, COL.shown, COL.where]}
          rows={t.rungs.map((r) => [
            quantity(r.label, t.unit),
            String(r.correct),
            String(r.shown),
            r.isHeard ? VAL.caught : r.isMissed ? VAL.guessed : r.inBand ? VAL.inBand : "",
          ])}
        />
      </Section>
      {t.limits.length > 0 ? (
        <Section title={SEC.thresholdLimits}>
          <ul className="mt-3 flex flex-col gap-2">
            {t.limits.map((l, i) => (
              <li key={i} className="text-xs leading-relaxed text-neutral-300">
                {l.statement}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

function BiasBody({ b }: { b: BiasExpert }) {
  return (
    <>
      <Section title="The session">
        <Stats
          items={[
            [STAT.beforeCorrection, `${b.rawPct > 0 ? "+" : ""}${b.rawPct}%`],
            [STAT.afterCorrection, `${b.pct > 0 ? "+" : ""}${b.pct}%`],
            [STAT.controlDrift, b.controlDriftPts === null ? VAL.none : `${b.controlDriftPts} pts`],
            [STAT.movedWithLabel, `${b.movedCount} of ${b.movableCount}`],
            [STAT.atScaleEdge, String(b.edgeCount)],
            [STAT.swappedOnly, b.swappedPct === null ? VAL.none : `${b.swappedPct > 0 ? "+" : ""}${b.swappedPct}%`],
          ]}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
          {NOTE.balancedPool}
        </p>
      </Section>
      <Section title={SEC.biasItems}>
        <Table
          head={[COL.clip, COL.blind, COL.labelled, COL.towardLabel, COL.roomToMove, COL.label]}
          rows={b.items.map((i) => [
            i.id,
            String(i.blind),
            String(i.labeled),
            `${i.towardLabel > 0 ? "+" : ""}${i.towardLabel}`,
            String(i.headroom),
            i.labelIsTrue ? VAL.trueLabel : VAL.fictionalLabel,
          ])}
        />
      </Section>
      {b.controls.length > 0 ? (
        <Section title={SEC.biasControls}>
          <Table
            head={[COL.clip, COL.first, COL.second, COL.drift]}
            rows={b.controls.map((c) => [
              c.id,
              String(c.first),
              String(c.second),
              `${c.drift > 0 ? "+" : ""}${c.drift}`,
            ])}
          />
        </Section>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * The panel
 * ------------------------------------------------------------------ */

export default function ExpertPanel({
  accent,
  own,
  instrument,
}: {
  accent: string;
  own: StoredPayload;
  instrument: Instrument;
}) {
  const sig = useSyncExternalStore(subscribeResults, signature, serverSignature);

  const body = useMemo(() => {
    if (sig === "" || !isOwn(own)) return null;
    if (instrument.kind === "delicacy") {
      const r = recallDelicacy();
      return r ? <DelicacyBody d={delicacyExpert(r.result)} accent={accent} /> : null;
    }
    if (instrument.kind === "bias") {
      const r = recallBias();
      return r ? <BiasBody b={biasExpert(r.result)} /> : null;
    }
    const r = recallThreshold(instrument.slug);
    return r ? <ThresholdBody t={thresholdExpert(r.result)} /> : null;
  }, [sig, own, instrument, accent]);

  if (!body) return null;

  return (
    <details className="group mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <summary className="cursor-pointer list-none">
        <span className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
          {PANEL.eyebrow}
        </span>
        <span className="ml-2 text-[0.65rem] text-muted group-open:hidden">{PANEL.show}</span>
        <span className="ml-2 hidden text-[0.65rem] text-muted group-open:inline">{PANEL.hide}</span>
        <p className="mt-2 text-xs leading-relaxed text-muted">{PANEL.blurb}</p>
      </summary>
      <div className="mt-5 border-t border-white/10 pt-5">{body}</div>
    </details>
  );
}
