/**
 * THE ARGUMENT BEHIND THE READING, RENDERED FROM `docs/blueprint.md` (BP-ARG).
 *
 * No prose lives here. Every statement comes from `src/content/blueprint.ts`,
 * which reads the canonical file, so this component cannot drift from the
 * argument of record — and each premise shows its label (EVIDENCED, ASSUMED,
 * INFERENCE), because N3 requires a reader to see which is which, and under it
 * the published source the label rests on, where the blueprint gives one (RT-2 a,
 * 2026-09-28). The objection, the reply and the objection held open follow, with
 * their published sources; internal cross-references are dropped per line
 * (`publicSource`).
 *
 * SERVER-ONLY: `blueprint.ts` reads a file. Every page using this prerenders.
 */
import { BP_ARG, BP_ARG_DEFENCE, publicCitation, type BpStatement } from "@/content/blueprint";

const STEP: Record<string, string> = {
  "BP-ARG-P1": "1",
  "BP-ARG-P2": "2",
  "BP-ARG-S1": "So",
  "BP-ARG-P3": "3",
  "BP-ARG-P4": "4",
  "BP-ARG-C": "Therefore",
};

const DEFENCE: Record<string, string> = {
  "BP-ARG-OBJECTION": "Objection",
  "BP-ARG-REPLY": "Reply",
  "BP-ARG-OPEN": "Held open",
};

function Label({ s }: { s: BpStatement }) {
  return s.labelText ? (
    <span className="ml-2 whitespace-nowrap rounded-full border border-dashed border-white/30 px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted">
      {s.labelText}
    </span>
  ) : null;
}

export default function BlueprintArgument({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-3">
        {BP_ARG.map((s) => {
          const citation = publicCitation(s);
          return (
            <li key={s.id} className="flex gap-3 text-[15px] leading-relaxed text-neutral-300">
              <span className="w-16 shrink-0 font-display text-sm font-semibold" style={{ color: accent }}>
                {STEP[s.id]}
              </span>
              <span className={s.id === "BP-ARG-C" ? "text-neutral-100" : undefined}>
                {s.text}
                <Label s={s} />
                {citation ? <span className="mt-1 block text-xs text-muted">{citation}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      <dl className="flex flex-col gap-4 border-t border-white/10 pt-5">
        {BP_ARG_DEFENCE.map((s) => {
          const source = publicCitation(s);
          return (
            <div key={s.id}>
              <dt className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">{DEFENCE[s.id].toUpperCase()}</dt>
              <dd className="mt-1 text-[15px] leading-relaxed text-neutral-300">
                {s.text}
                {source ? <span className="mt-1 block text-xs text-muted">{source}</span> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
