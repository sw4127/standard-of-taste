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
import type { BiasExpert, DelicacyExpert, ThresholdExpert } from "@/engine/expert";
import { familyLabel, quantity, shortUnit } from "@/content/staircase/copy";
import { FLAW_LABELS } from "@/content/delicacy/items";

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

function DelicacyBody({ d }: { d: DelicacyExpert }) {
  return (
    <>
      <Section title="By flaw family">
        <Table
          head={["Family", "Caught", "Shown"]}
          rows={d.perFamily.map((f) => [FLAW_LABELS[f.family].label, String(f.correct), String(f.n)])}
        />
      </Section>
      <Section title="By rung">
        <Table
          head={["Rung", "Caught", "Shown"]}
          rows={d.perMagnitude.map((m) => [String(m.magnitude), String(m.correct), String(m.n)])}
        />
      </Section>
      <Section title="Every pair, in the order you met them">
        <Table
          head={["#", "Family", "Rung", "Original", "You picked", "Flaw named", "Said"]}
          rows={d.trials.map((t) => [
            String(t.index),
            FLAW_LABELS[t.family].label,
            t.value === null ? `rung ${t.magnitude}` : `${t.value} ${t.unit}`,
            t.originalSide.toUpperCase(),
            `${t.pickedSide.toUpperCase()} ${t.correct ? "✓" : "✗"}`,
            t.flawCorrect === null ? "—" : `${FLAW_LABELS[t.flawPick].label} ${t.flawCorrect ? "✓" : "✗"}`,
            `${t.confidence}%`,
          ])}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
          Timing rungs are shown by number: the pool stores them as a tempo fraction and the
          staircase measures milliseconds of drift, so quoting one as the other would be a guess.
        </p>
      </Section>
    </>
  );
}

function ThresholdBody({ t }: { t: ThresholdExpert }) {
  const u = shortUnit(t.unit);
  return (
    <>
      <Section title="The session">
        <Stats
          items={[
            ["Trials", String(t.trials)],
            ["Outcome", t.kind],
            ["Caught at", t.heardAt === null ? "—" : quantity(t.heardAt, t.unit)],
            ["Missed at", t.missedAt === null ? "—" : quantity(t.missedAt, t.unit)],
            ["Fitted point", t.point === null ? "not earned" : quantity(t.point, t.unit)],
            [
              "95% interval",
              t.ci95 === null ? "—" : `${quantity(t.ci95[0], t.unit)} – ${quantity(t.ci95[1], t.unit)}`,
            ],
          ]}
        />
      </Section>
      <Section title={`Every rung · gentlest first · ${u}`}>
        <Table
          head={["Rung", "Right", "Shown", "Where"]}
          rows={t.rungs.map((r) => [
            quantity(r.label, t.unit),
            String(r.correct),
            String(r.shown),
            r.isHeard ? "caught" : r.isMissed ? "guessed" : r.inBand ? "in band" : "",
          ])}
        />
      </Section>
      {t.limits.length > 0 ? (
        <Section title="What the pipeline measured and could not fix">
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
            ["Before correction", `${b.rawPct > 0 ? "+" : ""}${b.rawPct}%`],
            ["After correction", `${b.pct > 0 ? "+" : ""}${b.pct}%`],
            ["Control drift", b.controlDriftPts === null ? "—" : `${b.controlDriftPts} pts`],
            ["Moved with label", `${b.movedCount} of ${b.movableCount}`],
            ["At the scale edge", String(b.edgeCount)],
            ["Swapped items only", b.swappedPct === null ? "—" : `${b.swappedPct > 0 ? "+" : ""}${b.swappedPct}%`],
          ]}
        />
        <p className="mt-2 text-[0.65rem] leading-relaxed text-muted">
          The two percentages agree because the pool carries as many acclaimed labels as dismissive
          ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway:
          it is what would move if that balance ever changed.
        </p>
      </Section>
      <Section title="Every clip">
        <Table
          head={["Clip", "Blind", "Labelled", "Toward label", "Room to move", "Label"]}
          rows={b.items.map((i) => [
            i.id,
            String(i.blind),
            String(i.labeled),
            `${i.towardLabel > 0 ? "+" : ""}${i.towardLabel}`,
            String(i.headroom),
            i.labelIsTrue ? "true" : "fictional",
          ])}
        />
      </Section>
      {b.controls.length > 0 ? (
        <Section title="Controls · rated twice, labelled neither time">
          <Table
            head={["Clip", "First", "Second", "Drift"]}
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
      return r ? <DelicacyBody d={delicacyExpert(r.result)} /> : null;
    }
    if (instrument.kind === "bias") {
      const r = recallBias();
      return r ? <BiasBody b={biasExpert(r.result)} /> : null;
    }
    const r = recallThreshold(instrument.slug);
    return r ? <ThresholdBody t={thresholdExpert(r.result)} /> : null;
  }, [sig, own, instrument]);

  if (!body) return null;

  return (
    <details className="group mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <summary className="cursor-pointer list-none">
        <span className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
          THE RAW RECORD
        </span>
        <span className="ml-2 text-[0.65rem] text-muted group-open:hidden">show</span>
        <span className="ml-2 hidden text-[0.65rem] text-muted group-open:inline">hide</span>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Every number behind the result, and the answers. No verdict, no interpretation — read from
          this browser, so a link you share shows nobody else this.
        </p>
      </summary>
      <div className="mt-5 border-t border-white/10 pt-5">{body}</div>
    </details>
  );
}
