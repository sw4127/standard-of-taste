"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SourceBadge from "@/components/lab/SourceBadge";
import ListenerCards from "@/components/ListenerCards";
import { LISTENERS, listener as findListener } from "@/content/reading/listeners";
import { readingFor, type Reading } from "@/content/reading/reading";
import { NEITHER, type ReadingLine } from "@/content/reading/lines";
import { buildPrompt, EMPTY_STATE, FAMILY_LABEL, type Choice, type ReaderState } from "@/content/reading/prompt";
import { loadState, saveState } from "@/content/reading/state";
import { FLAW_FAMILIES, type FlawFamily, type Listener, type Play } from "@/content/reading/types";
import * as C from "@/content/reading/copy";
import { recallThreshold } from "@/lib/result-recall";
import { promptCard } from "@/engine/prompt-card";
import { createScrollTop } from "./create-scroll";

/**
 * THE READING FLOW (blueprint Part 5): pick a listener -> the reading -> the
 * prompt -> the mock creation screen. Three taps from the listener card to the
 * creation screen; everything in between is optional arguing.
 *
 * BP-BRIDGE READS WHAT THE HEARING TESTS STORED, THROUGH THE PROMPT CARD'S OWN
 * RULE. For each flaw family, the stored Threshold sitting (if any) is run
 * through `promptCard`, whose `spend` is true, false, or null — and null means
 * no claim, which here means no mark and a link to the test. The reading never
 * says a person can or cannot hear something the card itself would not say.
 */

/** The reading's flaw families, as the Threshold Test's URL slugs. */
const SLUG: Record<FlawFamily, string> = { tuning: "pitch", timing: "timing", compression: "compression" };

/**
 * EACH STEP HAS A URL (`?l=mira&step=prompt`, `&step=create`), so the browser's
 * Back button walks back through the flow instead of leaving it, and every step
 * can be linked to and captured. The reader's choices live in tab storage and
 * survive the step changes.
 */
type Phase = "read" | "prompt" | "create";
const PHASES: readonly Phase[] = ["read", "prompt", "create"];

const CHIP =
  "rounded-full border px-3 py-1.5 text-left text-sm leading-snug transition active:scale-[0.98] min-h-[40px]";
const BUTTON =
  "inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition active:scale-[0.98]";

export default function ReadingFlow() {
  const params = useSearchParams();
  const id = params.get("l");
  const l = id ? findListener(id) : undefined;
  const step = params.get("step");
  const phase: Phase = PHASES.includes(step as Phase) ? (step as Phase) : "read";
  return l ? <ListenerReading key={l.id} l={l} phase={phase} /> : <Picker />;
}

function Badge({ l }: { l: Listener }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <SourceBadge source={l.dataSource} />
      <span>{C.LISTENER_LABEL}</span>
    </p>
  );
}

function Picker() {
  const readings = useMemo(() => LISTENERS.map(readingFor), []);
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">{C.PICK_HEADING}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-300">{C.PICK_LINE}</p>
      <div className="mt-6">
        <ListenerCards readings={readings} />
      </div>
    </section>
  );
}

function ListenerReading({ l, phase }: { l: Listener; phase: Phase }) {
  const r = useMemo(() => readingFor(l), [l]);
  const [state, setState] = useState<ReaderState>(EMPTY_STATE);
  const router = useRouter();
  const setPhase = (p: Phase) =>
    router.push(p === "read" ? `/reading?l=${l.id}` : `/reading?l=${l.id}&step=${p}`, { scroll: false });
  const promptRef = useRef<HTMLElement>(null);

  // Stored choices arrive after mount: the page is prerendered with none.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage, which the server cannot
    setState(loadState(l.id));
  }, [l.id]);
  useEffect(() => {
    if (phase === "prompt") promptRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const update = (next: ReaderState) => {
    setState(next);
    saveState(l.id, next);
  };
  const prompt = useMemo(() => buildPrompt(r, state), [r, state]);

  if (phase === "create") return <CreateMock text={prompt.text} onBack={() => setPhase("prompt")} />;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-3xl font-semibold">{l.name}</h2>
        <Link href="/reading" className="text-xs font-bold tracking-[0.2em] text-muted hover:text-white">
          {C.OTHER_LISTENER.toUpperCase()}
        </Link>
      </div>
      <div className="mt-2">
        <Badge l={l} />
      </div>
      <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">{C.READ_LEAD}</p>

      <ol className="mt-6 flex flex-col gap-4">
        {r.lines.map((line) => (
          <LineCard
            key={line.id}
            line={line}
            reading={r}
            rejected={state.rejected.includes(line.id)}
            choice={state.chosen[line.id]}
            onReject={() => update({ ...state, rejected: [...state.rejected, line.id] })}
            onRestore={() => update({ ...state, rejected: state.rejected.filter((x) => x !== line.id) })}
            onChoose={(c) => update({ ...state, chosen: { ...state.chosen, [line.id]: c } })}
          />
        ))}
      </ol>

      {phase === "read" ? (
        <button type="button" onClick={() => setPhase("prompt")} className={`${BUTTON} mt-8 bg-white text-black`}>
          {C.TO_PROMPT}
        </button>
      ) : (
        <PromptPanel ref={promptRef} text={prompt.text} families={prompt.families} onCreate={() => setPhase("create")} />
      )}
    </section>
  );
}

function playLine(p: Play, r: Reading, withSkip: boolean): string {
  const t = r.listener.tracks.find((x) => x.id === p.trackId)!;
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  const mark = withSkip ? ` · ${p.skippedEarly ? C.SKIPPED_MARK : C.KEPT_MARK}` : "";
  return `Day ${p.day + 1} · ${hh}:${mm} · ${t.title} — ${t.artist}${mark}`;
}

function LineCard(props: {
  line: ReadingLine;
  reading: Reading;
  rejected: boolean;
  choice: Choice | undefined;
  onReject: () => void;
  onRestore: () => void;
  onChoose: (c: Choice) => void;
}) {
  const { line, reading, rejected, choice } = props;
  const [open, setOpen] = useState(false);
  const plays = useMemo(() => {
    const ids = new Set(line.playIds);
    return reading.plays.filter((p) => ids.has(p.id));
  }, [line.playIds, reading.plays]);

  return (
    <li
      className={`rounded-2xl border p-5 transition ${
        rejected ? "border-dashed border-white/15 opacity-60" : "border-white/15 bg-white/[0.03]"
      }`}
    >
      <p className={`text-[17px] leading-relaxed ${rejected ? "text-muted line-through" : "text-neutral-100"}`}>
        {line.pattern}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="font-mono">{line.receipt}</span>
        <button type="button" onClick={() => setOpen(!open)} className="font-bold tracking-[0.15em] hover:text-white" aria-expanded={open}>
          {(open ? C.HIDE_PLAYS : C.SHOW_PLAYS).toUpperCase()}
        </button>
      </div>
      {open ? (
        <div className="mt-3">
          <SourceBadge source={reading.listener.dataSource} />
          <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-white/10 p-3 font-mono text-[11px] leading-relaxed text-neutral-400">
            {plays.map((p) => (
              <li key={p.id}>{playLine(p, reading, line.kind === "earlySkip")}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {rejected ? (
        <p className="mt-4 text-sm text-muted">
          {C.REJECTED_NOTE}{" "}
          <button type="button" onClick={props.onRestore} className="font-bold text-neutral-200 underline-offset-4 hover:underline">
            {C.RESTORE_LINE}
          </button>
        </p>
      ) : (
        <>
          <p className="mt-5 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{C.OFFER_LEAD.toUpperCase()}</p>
          <div className="mt-2 flex flex-col gap-2">
            {line.offers.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={choice === o.id}
                onClick={() => props.onChoose(o.id)}
                className={`${CHIP} ${choice === o.id ? "border-white bg-white text-black" : "border-white/20 text-neutral-200 hover:border-white/50"}`}
              >
                {o.question}
              </button>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={choice === "neither"}
                onClick={() => props.onChoose("neither")}
                className={`${CHIP} ${choice === "neither" ? "border-white bg-white text-black" : "border-white/20 text-neutral-300 hover:border-white/50"}`}
              >
                {NEITHER}
              </button>
              <button type="button" onClick={props.onReject} className={`${CHIP} border-dashed border-white/20 text-muted hover:text-white`}>
                {C.REJECT_LINE}
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
}

function PromptPanel({
  ref,
  text,
  families,
  onCreate,
}: {
  ref: React.Ref<HTMLElement>;
  text: string;
  families: Record<FlawFamily, string[]>;
  onCreate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // spend per family from a stored Threshold sitting: true, false, or null (no claim).
  const [spend, setSpend] = useState<Partial<Record<FlawFamily, boolean | null>>>({});
  useEffect(() => {
    const next: Partial<Record<FlawFamily, boolean | null>> = {};
    for (const f of FLAW_FAMILIES) {
      try {
        const recalled = recallThreshold(SLUG[f]);
        next[f] = recalled ? (promptCard([recalled.result]).axes[0]?.spend ?? null) : null;
      } catch {
        next[f] = null;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage, which the server cannot
    setSpend(next);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard permission: the prompt is selectable text either way.
    }
  };
  const unmeasured = FLAW_FAMILIES.some((f) => spend[f] == null);

  return (
    <section ref={ref} className="mt-10 scroll-mt-6 border-t border-white/10 pt-8">
      <h3 className="font-display text-2xl font-semibold">{C.PROMPT_HEADING}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{C.PROMPT_NOTE}</p>
      {text ? (
        <>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/15 bg-black/40 p-4 font-mono text-[13px] leading-relaxed text-neutral-100">
            {text}
          </pre>
          <button type="button" onClick={copy} className="mt-2 text-xs font-bold tracking-[0.2em] text-muted hover:text-white">
            {(copied ? C.COPIED_PROMPT : C.COPY_PROMPT).toUpperCase()}
          </button>

          <div className="mt-8">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">{C.BRIDGE_HEADING.toUpperCase()}</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">{C.BRIDGE_LINE}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {FLAW_FAMILIES.map((f) => (
                <li key={f} className="text-sm leading-relaxed">
                  <span className="font-bold text-neutral-100">{FAMILY_LABEL[f]}</span>
                  <span className="text-neutral-300"> — {families[f].join("; ")}</span>
                  {spend[f] === true ? <span className="ml-2 text-xs text-muted">({C.BRIDGE_CAN_HEAR})</span> : null}
                  {spend[f] === false ? <span className="ml-2 text-xs text-muted">({C.BRIDGE_MAY_NOT})</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">{C.BRIDGE_DEVICE_NOTE}</p>
            {unmeasured ? (
              <Link href="/threshold" className="mt-4 inline-block text-sm font-bold text-neutral-100 underline underline-offset-4">
                {C.BRIDGE_TUNE}
              </Link>
            ) : null}
          </div>

          <button type="button" onClick={onCreate} className={`${BUTTON} mt-8 bg-white text-black`}>
            {C.TO_CREATE}
          </button>
        </>
      ) : (
        <p className="mt-4 text-[15px] text-neutral-300">{C.PROMPT_EMPTY}</p>
      )}
    </section>
  );
}

function CreateMock({ text, onBack }: { text: string; onBack: () => void }) {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  // A block body, never `() => window.scrollTo(...)`: an effect's return value is
  // taken as its cleanup, and in some browsers scrollTo returns a value — which
  // crashed this screen on the first rendered run (reading-flow.test.ts guards it).
  // Opens at the top unless that leaves "Generate" below the fold (createScrollTop).
  useEffect(() => {
    const label = labelRef.current;
    const note = noteRef.current;
    const top =
      label && note
        ? createScrollTop({
            labelTop: label.getBoundingClientRect().top + window.scrollY,
            noteBottom: note.getBoundingClientRect().bottom + window.scrollY,
            viewport: window.innerHeight,
          })
        : 0;
    window.scrollTo({ top });
  }, []);
  return (
    <section className="mt-10">
      <p ref={labelRef} className="rounded-lg border border-dashed border-white/35 px-3 py-2 text-xs leading-relaxed text-muted">
        {C.CREATE_LABEL}
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-[#101014]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-display text-lg font-semibold">{C.HOST_NAME}</span>
          <span className="text-xs text-muted">{C.CREATE_HEADING}</span>
        </div>
        <div className="p-4">
          <label className="text-[0.65rem] font-bold tracking-[0.3em] text-muted" htmlFor="mock-prompt">
            {C.CREATE_FIELD.toUpperCase()}
          </label>
          <textarea
            id="mock-prompt"
            readOnly
            value={text}
            rows={9}
            className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[13px] leading-relaxed text-neutral-100"
          />
          <button type="button" disabled className={`${BUTTON} mt-3 w-full cursor-not-allowed bg-white/15 text-neutral-400`}>
            {C.GENERATE}
          </button>
          <p ref={noteRef} className="mt-2 text-center text-xs text-muted">{C.GENERATE_NOTE}</p>
        </div>
      </div>
      <button type="button" onClick={onBack} className="mt-6 text-xs font-bold tracking-[0.2em] text-muted hover:text-white">
        {C.BACK_TO_READING.toUpperCase()}
      </button>
    </section>
  );
}
