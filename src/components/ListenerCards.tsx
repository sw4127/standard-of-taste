import Link from "next/link";
import SourceBadge from "@/components/lab/SourceBadge";
import { LISTENER_LABEL, listenerFacts } from "@/content/reading/copy";
import type { Reading } from "@/content/reading/reading";

/**
 * THE THREE ILLUSTRATIVE LISTENERS, AS DOORS INTO THE READING (BA-6, BA-8).
 *
 * One component for the front door and the reading's own picker, so the two
 * cannot describe a listener differently. No hooks: it renders on the server
 * for the front door and inside the client flow for the picker. Every card
 * carries the SIMULATED badge and the listener label, read from data.
 */
export default function ListenerCards({ readings }: { readings: readonly Reading[] }) {
  return (
    <div className="flex flex-col gap-3">
      {readings.map((r) => (
        <Link
          key={r.listener.id}
          href={`/reading?l=${r.listener.id}`}
          className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/30"
        >
          <p className="font-display text-2xl font-semibold group-hover:text-white">{r.listener.name}</p>
          <p className="mt-1 text-sm text-neutral-300">
            {listenerFacts(r.plays.length, new Set(r.plays.map((p) => p.trackId)).size)}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <SourceBadge source={r.listener.dataSource} />
            <span>{LISTENER_LABEL}</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
