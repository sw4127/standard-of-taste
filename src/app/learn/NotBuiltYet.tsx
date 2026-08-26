import Jump from "@/components/Jump";

/**
 * "THIS ONE ISN'T BUILT" — said plainly (E7/S24b, PM ruling RT-155 a).
 *
 * Two of the seven reading-room articles explain criteria with no instrument
 * behind them: Comparison and Practice. Both articles mentioned it — one in a
 * subordinate clause, one not at all — and both then linked to a DIFFERENT
 * instrument. A reader who arrived from a search for the thing the article is
 * about would leave believing they had missed a door.
 *
 * The product already labels what it cannot do everywhere else: the delicacy
 * band is deliberately unflattering, the cards carry "no percentile — cohort
 * n = 0", the Lab publishes a page of limits. An article quietly implying an
 * instrument exists is the one place that discipline had lapsed.
 *
 * IT SAYS PLANNED, NOT PROMISED. The blueprint lists both; neither has been
 * started, and no date has been decided. Saying "coming soon" would be a claim
 * nobody has earned the right to make.
 */
export default function NotBuiltYet({
  criterion,
  blocker,
}: {
  /** The criterion this article explains, lowercase. */
  criterion: string;
  /** In one clause: what stands between the plan and the instrument. */
  blocker: string;
}) {
  return (
    <aside className="mt-10 rounded-2xl border border-dashed border-white/20 p-5">
      <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">NOT BUILT YET</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        There is no instrument for {criterion} in the gym today. It is in the plan and not in the
        product — {blocker}. When it exists it will be measured the same way as the rest, and until
        then this page is an explanation rather than a door.
      </p>
      <p className="mt-3 text-sm text-muted">
        <Jump href="/learn">The criteria that do have machines →</Jump>
      </p>
    </aside>
  );
}
