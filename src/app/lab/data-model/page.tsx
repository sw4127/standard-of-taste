import type { Metadata } from "next";
import Link from "next/link";
import {
  DEVICE_ENTITIES,
  PERSISTENT_NAMESPACE,
  TAB_ENTITIES,
  type DataEntity,
} from "@/content/lab/data-model";
import { GYM_INK } from "@/content/instrument-accents";

/**
 * THE DATA MODEL (E15/S4, Track J1).
 *
 * The one Lab panel that was never gated on traffic: what this product stores
 * is a fact about the code, complete today, with nothing simulated.
 *
 * NO DATA-SOURCE BADGE, on the same reasoning as the instrument-limits page and
 * the metric dictionary: this is a schema, not a measurement. There are no
 * respondents involved, so SIMULATED would be wrong and REAL would imply a
 * cohort that does not exist.
 *
 * EVERY KEY, CAP AND VERSION IS IMPORTED. Nothing on this page is typed twice.
 * See `src/content/lab/data-model.ts` for why, and `data-model.test.ts` for the
 * assertion that keeps it true.
 */

export const metadata: Metadata = {
  title: "Data model — The Lab",
  description:
    "Everything this product stores about a person, where it lives, and what it cannot do. No database, no account, no server-side record — the whole model is one browser's local storage.",
  alternates: { canonical: "/lab/data-model" },
  openGraph: {
    title: "Data model — The Lab",
    description: "Everything this product stores, where it lives, and what it cannot do.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const INK = GYM_INK;

function Entity({ entity }: { entity: DataEntity }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-lg font-semibold">{entity.title}</h3>
        <code className="font-mono text-[0.6rem] tracking-[0.1em] text-muted">
          {entity.definedIn}
        </code>
      </div>

      <div className="mt-3 overflow-x-auto">
        <code className="block whitespace-pre rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-neutral-200">
          {entity.key}
        </code>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-300">{entity.purpose}</p>

      <dl className="mt-4 flex flex-col gap-2">
        {entity.fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-mono text-[0.7rem] sm:w-40" style={{ color: INK }}>
              {f.name}
            </dt>
            <dd className="text-xs leading-relaxed text-muted sm:flex-1">{f.meaning}</dd>
          </div>
        ))}
      </dl>

      {/* The limit is not a footnote. It is the half of the description that
          decides whether anything built on this entity can be trusted. */}
      <p className="mt-4 border-l-2 border-white/15 pl-3 text-xs leading-relaxed text-neutral-300">
        {entity.limit}
      </p>
    </article>
  );
}

export default function DataModel() {
  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">
        THE LAB · DATA MODEL
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        Everything this product keeps about you.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        Not a summary of it — all of it. There is no database, no account, and no server-side
        record of any person: the entire model is a handful of keys in your own browser. Every key,
        cap and version below is read from the code that owns it rather than described here, so
        this page cannot quietly fall behind what the product actually does.
      </p>

      {/* The one structural claim a reader needs before the tables mean
          anything, and the one most likely to be assumed wrong. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: INK }}>
          IT STORES ANSWERS, NEVER RESULTS
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          Nothing here holds a score. What is written is the raw answers you gave, in exactly the
          form a share link carries, and every number is recomputed from them on read. That is why
          a stored session and a shared link can never disagree — they are the same bytes through
          the same function — and why editing this storage by hand can only change which answers
          you claim to have given, not what they are worth.
        </p>
      </div>

      <section className="mt-14" aria-labelledby="device">
        <h2 id="device" className="font-display text-2xl font-semibold tracking-tight">
          Kept in this browser
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Survives closing the tab and closing the browser. Lost if you clear site data, and
          invisible to any other device — there is no account tying them together. Everything here
          shares the{" "}
          <code className="font-mono text-xs" style={{ color: INK }}>
            {PERSISTENT_NAMESPACE}
          </code>{" "}
          namespace, which is what lets{" "}
          {/* The control lives on /legal, NOT at a /forget route — I wrote
              href="/forget" first and it does not exist. A link is a claim. */}
          <Link href="/legal" className="underline underline-offset-4 hover:text-white">
            forgetting this browser
          </Link>{" "}
          be one sweep rather than a list of keys somebody has to remember to update.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {DEVICE_ENTITIES.map((e) => (
            <Entity key={e.id} entity={e} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="tab">
        <h2 id="tab" className="font-display text-2xl font-semibold tracking-tight">
          Kept for one tab
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Gone the moment the tab closes. None of it is a profile, and none of it is joined to a
          session record.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {TAB_ENTITIES.map((e) => (
            <Entity key={e.id} entity={e} />
          ))}
        </div>
      </section>

      <p className="mt-14 text-sm text-muted">
        <Link href="/lab" className="underline underline-offset-4 hover:text-white">
          Back to the Lab
        </Link>
      </p>
    </div>
  );
}
