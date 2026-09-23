/**
 * Renders the blueprint's argument (BP-ARG) from docs/blueprint.md.
 */
import { BP_ARG, BP_ARG_DEFENCE, bp, publicSource } from "@/content/blueprint";

export default function ResearchPanel({ accent }: { accent: string }) {
  const Head = (text: string) => (
    <p className="text-[10px] font-bold tracking-[0.25em]" style={{ color: accent }}>
      {text}
    </p>
  );
  const hume = bp("BP-CA3");
  return (
    <details className="mt-8 rounded-2xl border border-white/10 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>Grounded in research</span>
        <span className="text-xs font-normal text-muted">why this isn&apos;t a horoscope ↓</span>
      </summary>
      <div className="mt-4 flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
        <div>
          {Head("THE PHILOSOPHY")}
          <p className="mt-1">{hume.text}</p>
        </div>
        <div>
          {Head("THE ARGUMENT")}
          {BP_ARG.map((s) => (
            <p key={s.id} className="mt-2 flex gap-2.5">
              <span className="font-display text-sm font-bold leading-relaxed" style={{ color: accent }}>
                {s.id.replace("BP-ARG-", "")}
              </span>
              <span>
                {s.text} <span className="text-[10px] font-bold tracking-[0.2em] text-muted">{s.label}</span>
              </span>
            </p>
          ))}
        </div>
        <div>
          {Head("THE EVIDENCE")}
          {BP_ARG_DEFENCE.map((s) => (
            <p key={s.id} className="mt-2">
              {s.text} {publicSource(s) && <em className="text-muted">{publicSource(s)}</em>}
            </p>
          ))}
        </div>
      </div>
    </details>
  );
}
