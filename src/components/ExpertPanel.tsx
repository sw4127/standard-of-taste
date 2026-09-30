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
import { subscribeResults, type StoredPayload } from "@/lib/result-store";
import { isOwnResult } from "@/lib/own-result";
import { recallBias, recallDelicacy, recallSpread, recallThreshold } from "@/lib/result-recall";
import { biasExpert, delicacyExpert, spreadExpert, thresholdExpert } from "@/engine/expert";
import type {
  BiasExpert,
  CalibrationCurve,
  DelicacyExpert,
  SpreadExpert,
  ThresholdExpert,
} from "@/engine/expert";
import { quantity, shortUnit } from "@/content/staircase/copy";
import { quantityZh, unitZh } from "@/content/zh/copy/across";
import { limitStatementZh } from "@/content/zh/copy/threshold-lines";
import { FLAW_LABELS } from "@/content/delicacy/items";
import { SPREAD_POOL } from "@/content/spread/ranking";
import {
  EXPERT_COLUMNS as COL,
  EXPERT_NOTES as NOTE,
  EXPERT_PANEL as PANEL,
  EXPERT_SECTIONS as SEC,
  EXPERT_STATS as STAT,
  EXPERT_VALUES as VAL,
  brierNote,
} from "@/content/vocabulary/expert";
import { useLocale } from "@/lib/use-locale";
import { tFor, type T } from "@/lib/i18n";
import EXPERT_ZH, { brierNoteZh } from "@/content/zh/copy/expert";

/*
 * THE PANEL IN THE PAGE'S LANGUAGE (bilingual Part 2). Every label goes through
 * the panel's dictionary; numbers, units and clip ids pass through untouched. The
 * translator is threaded down as `t` rather than read in each body, so one panel
 * cannot mix languages.
 */

type Instrument =
  | { kind: "delicacy" }
  | { kind: "bias" }
  | { kind: "spread" }
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
function CalibrationCurveChart({ c, accent, t, zh }: { c: CalibrationCurve; accent: string; t: T; zh: boolean }) {
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
          aria-label={t("Calibration: {points}", {
            points: shown
              .map((p) => t("claimed {c}%, delivered {d}%", { c: p.claimedPct, d: Math.round(p.observedPct!) }))
              .join(zh ? String.fromCharCode(0xff1b) : "; "),
          })}
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
          <text x={PAD} y={PAD - 8} fill="rgba(255,255,255,0.45)" fontSize="9">{t("delivered")}</text>
          <text x={x(100) - 30} y={SIZE + PAD + 24} fill="rgba(255,255,255,0.45)" fontSize="9">{t("claimed")}</text>
        </svg>
      ) : null}
      <Table
        head={[COL.youSaid, COL.right, COL.of, COL.delivered, COL.versusClaim].map((h) => t(h))}
        rows={c.points.map((p) => [
          `${p.claimedPct}%`,
          String(p.correct),
          String(p.n),
          p.observedPct === null ? t(VAL.tooFewToSay) : `${Math.round(p.observedPct)}%`,
          p.observedPct === null
            ? t(VAL.none)
            : t("{n} pts", { n: `${Math.round(p.observedPct) - p.claimedPct > 0 ? "+" : ""}${Math.round(p.observedPct) - p.claimedPct}` }),
        ])}
      />
      <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
        {zh ? brierNoteZh(c.brier, c.n, c.brierChance) : brierNote(c.brier, c.n, c.brierChance)}
      </p>
    </>
  );
}

function DelicacyBody({ d, accent, t, zh }: { d: DelicacyExpert; accent: string; t: T; zh: boolean }) {
  return (
    <>
      <Section title={t(SEC.delicacyByFamily)}>
        <Table
          head={[COL.family, COL.caught, COL.shown].map((h) => t(h))}
          rows={d.perFamily.map((f) => [FLAW_LABELS[f.family].label, String(f.correct), String(f.n)])}
        />
      </Section>
      <Section title={t(SEC.delicacyByRung)}>
        <Table
          head={[COL.rung, COL.caught, COL.shown].map((h) => t(h))}
          rows={d.perMagnitude.map((m) => [String(m.magnitude), String(m.correct), String(m.n)])}
        />
      </Section>
      <Section title={t(SEC.delicacyCalibration)}>
        <CalibrationCurveChart c={d.calibration} accent={accent} t={t} zh={zh} />
      </Section>
      <Section title={t(SEC.delicacyTrials)}>
        <Table
          head={[COL.index, COL.family, COL.rung, COL.original, COL.youPicked, COL.flawNamed, COL.said].map((h) => t(h))}
          rows={d.trials.map((tr) => [
            String(tr.index),
            FLAW_LABELS[tr.family].label,
            tr.value === null ? t("rung {n}", { n: tr.magnitude }) : `${tr.value} ${tr.unit}`,
            tr.originalSide.toUpperCase(),
            `${tr.pickedSide.toUpperCase()} ${tr.correct ? "✓" : "✗"}`,
            tr.flawCorrect === null ? t(VAL.none) : `${FLAW_LABELS[tr.flawPick].label} ${tr.flawCorrect ? "✓" : "✗"}`,
            `${tr.confidence}%`,
          ])}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
  {t(NOTE.timingRungs)}
        </p>
      </Section>
    </>
  );
}

function ThresholdBody({ t: th, tx: t, zh }: { t: ThresholdExpert; tx: T; zh: boolean }) {
  // On a Chinese page (bilingual Part 4): units in Chinese, the range without a dash, the outcome
  // named rather than printed as a code, and each measured limit from its Chinese template.
  const u = zh ? unitZh(th.unit) : shortUnit(th.unit);
  const q = (v: number) => (zh ? quantityZh(v, th.unit) : quantity(v, th.unit));
  return (
    <>
      <Section title={t(SEC.thresholdSession)}>
        <Stats
          items={[
            [t(STAT.trials), String(th.trials)],
            [t(STAT.outcome), zh ? t(th.kind) : th.kind],
            [t(STAT.caughtAt), th.heardAt === null ? t(VAL.none) : q(th.heardAt)],
            [t(STAT.missedAt), th.missedAt === null ? t(VAL.none) : q(th.missedAt)],
            [t(STAT.fittedPoint), th.point === null ? t(VAL.notEarned) : q(th.point)],
            [
              t(STAT.interval),
              th.ci95 === null ? t(VAL.none) : t("{lo} – {hi}", { lo: q(th.ci95[0]), hi: q(th.ci95[1]) }),
            ],
          ]}
        />
      </Section>
      <Section title={`${t(SEC.thresholdRungs)} · ${u}`}>
        <Table
          head={[COL.rung, COL.right, COL.shown, COL.where].map((h) => t(h))}
          rows={th.rungs.map((r) => [
            q(r.label),
            String(r.correct),
            String(r.shown),
            r.isHeard ? t(VAL.caught) : r.isMissed ? t(VAL.guessed) : r.inBand ? t(VAL.inBand) : "",
          ])}
        />
      </Section>
      {th.limits.length > 0 ? (
        <Section title={t(SEC.thresholdLimits)}>
          <ul className="mt-3 flex flex-col gap-2">
            {th.limits.map((l, i) => (
              <li key={i} className="text-xs leading-relaxed text-neutral-300">
                {zh ? limitStatementZh(l) : l.statement}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

function BiasBody({ b, t }: { b: BiasExpert; t: T }) {
  return (
    <>
      <Section title={t("The session")}>
        <Stats
          items={[
            [t(STAT.beforeCorrection), `${b.rawPct > 0 ? "+" : ""}${b.rawPct}%`],
            [t(STAT.afterCorrection), `${b.pct > 0 ? "+" : ""}${b.pct}%`],
            [t(STAT.controlDrift), b.controlDriftPts === null ? t(VAL.none) : t("{n} pts", { n: b.controlDriftPts })],
            [t(STAT.movedWithLabel), t("{a} of {b}", { a: b.movedCount, b: b.movableCount })],
            [t(STAT.atScaleEdge), String(b.edgeCount)],
            [t(STAT.swappedOnly), b.swappedPct === null ? t(VAL.none) : `${b.swappedPct > 0 ? "+" : ""}${b.swappedPct}%`],
          ]}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
          {t(NOTE.balancedPool)}
        </p>
      </Section>
      <Section title={t(SEC.biasItems)}>
        <Table
          head={[COL.clip, COL.blind, COL.labelled, COL.towardLabel, COL.roomToMove, COL.label].map((h) => t(h))}
          rows={b.items.map((i) => [
            i.id,
            String(i.blind),
            String(i.labeled),
            `${i.towardLabel > 0 ? "+" : ""}${i.towardLabel}`,
            String(i.headroom),
            t(i.labelIsTrue ? VAL.trueLabel : VAL.fictionalLabel),
          ])}
        />
      </Section>
      {b.controls.length > 0 ? (
        <Section title={t(SEC.biasControls)}>
          <Table
            head={[COL.clip, COL.first, COL.second, COL.drift].map((h) => t(h))}
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

/**
 * THE RANKING TEST'S BODY (E18/S3).
 *
 * IT IS THE FIRST AND ONLY PLACE THE SIX WORKS ARE NAMED. The sitting is blind
 * by construction and the reveal names nothing, so a person finishes it having
 * heard six pieces of music and been told what none of them were. That is the
 * gap this closes, and it is why the clip table leads with the work rather than
 * the clip id the way the prestige table does.
 *
 * NAMING THEM COSTS SOMETHING, AND THE COST IS STATED ON THE PANEL. This
 * instrument only works on music that is new to the listener, so a reader who
 * now knows the list cannot sit it blind again. `spreadNowKnown` says so here
 * rather than leaving them to work it out on a second attempt that refuses.
 *
 * THE TITLES ARE LOOKED UP HERE, NOT CARRIED IN THE PAYLOAD. `expert.ts` may
 * hold ids, enums and numbers only — a rule its own test enforces against the
 * serialised payload, and one "Piano Sonata No. 23" would break outright.
 *
 * A REFUSED READING SHOWS THE PAIRS AND SAYS WHY THERE IS NO AVERAGE. The means
 * arrive as null from the engine and there is no branch here that could print
 * one; what the branch decides is whether to explain their absence.
 */
function SpreadBody({ s, t }: { s: SpreadExpert; t: T }) {
  const work = (id: string) => SPREAD_POOL.find((item) => item.id === id)?.work ?? id;
  const gap = (v: number | null) => (v === null ? t(VAL.tooFewToSay) : v.toFixed(2));
  /*
   * PAIRS ARE LABELLED BY THE CLIP NUMBER FROM THE TABLE ABOVE, NOT BY TITLE.
   * Spelled out, one pair cell reads "Eroica Variations, Op. 35 · Piano Sonata
   * No. 29, 'Hammerklavier'" — 63 characters in a nowrap monospace cell, wider
   * on its own than a 375px phone, with three more columns after it. The table
   * scrolls inside its own box so nothing breaks, but a reader would be dragging
   * two screens sideways to see a number. The clip table directly above numbers
   * all six, so the digits are a lookup rather than a loss.
   */
  const number = (id: string) => String(s.clips.findIndex((c) => c.id === id) + 1);

  return (
    <>
      <Section title={t(SEC.spreadSession)}>
        <Stats
          items={[
            [t(STAT.clipsCounted), String(s.ratedCount)],
            [t(STAT.clipsSetAside), String(s.setAsideCount)],
            [t(STAT.widelySpacedPairs), String(s.farCount)],
            [t(STAT.closelySpacedPairs), String(s.closeCount)],
            [t(STAT.meanGapWide), gap(s.farMeanGap)],
            [t(STAT.meanGapClose), gap(s.closeMeanGap)],
            [t(STAT.atRandom), s.ifIndifferent.toFixed(2)],
          ]}
        />
        {s.refusal !== null ? (
          <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">{t(NOTE.spreadNoMean)}</p>
        ) : null}
      </Section>
      <Section title={t(SEC.spreadClips)}>
        {/*
          THE WARNING GOES ABOVE THE TABLE, NOT UNDER IT (E18/S4, found by
          reading the rendered panel). It said "reading this list is the end of
          your blind sitting" BELOW the list — a consent notice printed after
          the disclosure it is about, which is the same ordering mistake the
          flow itself refuses when it asks "heard this before?" before the
          rating rather than after. A reader meets the cost before they pay it.
        */}
        <p className="mt-3 text-[0.65rem] leading-relaxed text-muted">{t(NOTE.spreadNowKnown)}</p>
        <Table
          head={[COL.index, COL.work, COL.yourRating, COL.counted].map((h) => t(h))}
          rows={s.clips.map((c, i) => [
            String(i + 1),
            work(c.id),
            c.rating === null ? t(VAL.none) : String(c.rating),
            t(c.setAside ? VAL.setAside : VAL.countedIn),
          ])}
        />
      </Section>
      <Section title={t(SEC.spreadPairs)}>
        <Table
          head={[COL.pair, COL.inHisRanking, COL.positionsApart, COL.yourGap].map((h) => t(h))}
          rows={s.pairs.map((p) => [
            `${number(p.a)} · ${number(p.b)}`,
            t(p.kind === "far" ? VAL.farSpacing : VAL.closeSpacing),
            String(p.distance),
            String(p.gap),
          ])}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">{t(NOTE.spreadDistanceOnly)}</p>
      </Section>
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
  const locale = useLocale();
  const zh = locale === "zh";
  const t = tFor(locale, EXPERT_ZH);

  const body = useMemo(() => {
    if (sig === "" || !isOwnResult(own)) return null;
    if (instrument.kind === "delicacy") {
      const r = recallDelicacy();
      return r ? <DelicacyBody d={delicacyExpert(r.result)} accent={accent} t={t} zh={zh} /> : null;
    }
    if (instrument.kind === "bias") {
      const r = recallBias();
      return r ? <BiasBody b={biasExpert(r.result)} t={t} /> : null;
    }
    if (instrument.kind === "spread") {
      const r = recallSpread();
      return r ? <SpreadBody s={spreadExpert(r.result)} t={t} /> : null;
    }
    const r = recallThreshold(instrument.slug);
    return r ? <ThresholdBody t={thresholdExpert(r.result)} tx={t} zh={zh} /> : null;
    // `t` and `zh` follow `locale`, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, own, instrument, accent, locale]);

  if (!body) return null;

  return (
    <details className="group mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <summary className="cursor-pointer list-none">
        <span className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
          {t(PANEL.eyebrow)}
        </span>
        <span className="ml-2 text-[0.65rem] text-muted group-open:hidden">{t(PANEL.show)}</span>
        <span className="ml-2 hidden text-[0.65rem] text-muted group-open:inline">{t(PANEL.hide)}</span>
        <p className="mt-2 text-xs leading-relaxed text-muted">{t(PANEL.blurb)}</p>
      </summary>
      <div className="mt-5 border-t border-white/10 pt-5">{body}</div>
    </details>
  );
}
