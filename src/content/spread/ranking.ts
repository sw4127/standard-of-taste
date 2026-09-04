/**
 * TRACK N — the critic-ranked listening pool, and the ranking it borrows.
 *
 * WHAT THIS INSTRUMENT DOES, AND THE ONE THING IT MUST NEVER DO. A published
 * critic ranked a composer's works against each other. This pool plays some of
 * those works and asks a listener to rate what they hear. The statistic is
 * whether their rating gaps VARY where the critic's rankings vary — their
 * spread across works the critic placed far apart, beside their spread across
 * works the critic bracketed together.
 *
 * AGREEMENT WITH THE CRITIC IS NEVER SCORED. Nobody is ever wrong for
 * preferring the work the critic placed lower. The engine that consumes this
 * pool is a function of |Δposition| only — it cannot see WHICH work the critic
 * placed higher, so agreement is not merely left unscored, it is uncomputable
 * from what this module exports. That is enforced in `ranking.test.ts` rather
 * than promised here, because a promise in a docblock is not a guard.
 *
 * WHY A CRITIC'S RANKING AT ALL (D2, N3). Track I established the rule: a
 * citation may describe the MEASURING APPARATUS, never how well people score.
 * A ranking is apparatus — it is one writer's ordering of works, published
 * under his name, and quoting it ranks no reader. What would break the rule is
 * a figure about how well listeners agree with critics; no such figure appears
 * anywhere in this instrument.
 *
 * WHY THE SOURCING WAS OPENED BEFORE ANYTHING WAS BUILT. Track I's audio half
 * died at exactly this step and is recorded on /lab/falsified. The pass/fail
 * for this pool was pre-registered before the search began: recordings clearing
 * the licence rule for enough of the ranked works to yield at least
 * MIN_PAIRS_PER_KIND pairs of each kind. It cleared. The near-misses that did
 * not are listed in `docs/spread-sourcing-2026-09-04.md`, because the ones that
 * looked usable and were not are the more useful half of that record.
 */

/** The instrument's stable id, carried by every stored response (D6). */
export const SPREAD_INSTRUMENT_ID = "spread-v1";

/**
 * Pool version. BUMP ON ANY POOL CHANGE — works added, removed, re-windowed or
 * re-rendered. Rides in every share URL and stored result, so an old response
 * stays interpretable against the exact pool that produced it (D6). Old-version
 * links die gracefully; they never lie.
 */
export const SPREAD_POOL_VERSION = 1;

/** A pair counts as critic-FAR at this many list positions or more. */
export const FAR_POSITIONS = 10;

/** A pair counts as critic-CLOSE at this many list positions or fewer. */
export const CLOSE_POSITIONS = 3;

/**
 * The pre-registered floor, per kind. Below this the pool does not ship: a
 * spread computed over fewer pairs than this is one listener's mood.
 */
export const MIN_PAIRS_PER_KIND = 3;

/**
 * THE RANKING OF RECORD.
 *
 * Michael Tanner, "Beethoven! His 21 essential masterpieces, ranked", BBC Music
 * Magazine / classical-music.com, 20 January 2026. The article states that it
 * counts down, and it ends on the C sharp minor Quartet.
 *
 * `position` is the work's place in the published order, counting from where
 * the article starts. THE DIRECTION IS DELIBERATELY NOT ENCODED, and this is
 * the load-bearing decision in the file: everything downstream uses the
 * DISTANCE between two positions, which is identical whichever end the countdown
 * runs from. Storing a "better/worse" flag would make agreement computable, and
 * the first thing a future caller would do is compute it.
 *
 * Recorded in full rather than only the works this pool uses, so a reader can
 * see which works were available to choose from and which were not.
 */
export interface RankedWork {
  position: number;
  work: string;
}

export const TANNER_RANKING: readonly RankedWork[] = [
  { position: 1, work: "Six Bagatelles, Op. 126" },
  { position: 2, work: "Violin Sonata in G, Op. 96" },
  { position: 3, work: "An die ferne Geliebte" },
  { position: 4, work: "Eroica Variations, Op. 35" },
  { position: 5, work: "Symphony No. 8" },
  { position: 6, work: "Piano Sonata No. 23, 'Appassionata'" },
  { position: 7, work: "'Archduke' Piano Trio" },
  { position: 8, work: "Fidelio" },
  { position: 9, work: "Piano Concerto No. 5, 'Emperor'" },
  { position: 10, work: "Symphony No. 7" },
  { position: 11, work: "String Quartet, Op. 59 No. 1, 'Razumovsky'" },
  { position: 12, work: "Violin Concerto" },
  { position: 13, work: "Missa solemnis" },
  { position: 14, work: "Piano Sonata No. 29, 'Hammerklavier'" },
  { position: 15, work: "Diabelli Variations" },
  { position: 16, work: "Piano Sonata No. 32" },
  { position: 17, work: "Symphony No. 5" },
  { position: 18, work: "String Quartet in B flat, Op. 130 (incl. Grosse Fuge, Op. 133)" },
  { position: 19, work: "Symphony No. 3, 'Eroica'" },
  { position: 20, work: "Symphony No. 9" },
  { position: 21, work: "String Quartet in C sharp minor, Op. 131" },
];

/**
 * Scoring forces, roughly — what a listener is hearing at once.
 *
 * Recorded because it is the confound most likely to explain a spread that has
 * nothing to do with the ranking: a solo piano and a full orchestra differ
 * audibly for reasons no critic's ordering caused. It is guarded rather than
 * merely noted — the test asserts the confound is not ALIGNED with the
 * statistic, i.e. that cross-forces pairs fall on both sides of the far/close
 * split rather than stacking on one.
 */
export type Forces = "solo-piano" | "concerto" | "orchestra";

export interface SpreadItem {
  id: string;
  /** Position in TANNER_RANKING. */
  position: number;
  work: string;
  performer: string;
  forces: Forces;
}

/**
 * THE POOL. Every work here cleared the licence rule in
 * `docs/bias-pool-gatekeeping.md` §A — the RECORDING is public domain, CC0 or
 * CC-BY, with no territorial qualifier — checked by opening the page that says
 * so, whose capture sits in `./licenses`. Provenance lives in `manifest.json`;
 * this file carries only what the instrument computes over.
 */
export const SPREAD_POOL: readonly SpreadItem[] = [
  {
    id: "sp1",
    position: 4,
    work: "Eroica Variations, Op. 35",
    performer: "Ivan Ilić",
    forces: "solo-piano",
  },
  {
    id: "sp2",
    position: 9,
    work: "Piano Concerto No. 5, 'Emperor'",
    performer: "Ursula Oppens · DuPage Symphony Orchestra · Barbara Schubert",
    forces: "concerto",
  },
  {
    id: "sp3",
    position: 12,
    work: "Violin Concerto",
    performer: "US Marine Chamber Orchestra",
    forces: "concerto",
  },
  {
    id: "sp4",
    position: 14,
    work: "Piano Sonata No. 29, 'Hammerklavier'",
    performer: "Eric Xi Xin Liang",
    forces: "solo-piano",
  },
  {
    id: "sp5",
    position: 15,
    work: "Diabelli Variations",
    performer: "Marvin Wolfthal",
    forces: "solo-piano",
  },
  {
    id: "sp6",
    position: 19,
    work: "Symphony No. 3, 'Eroica'",
    performer: "Czech National Symphony Orchestra",
    forces: "orchestra",
  },
];

export interface SpreadPair {
  a: SpreadItem;
  b: SpreadItem;
  /** |Δposition|. The ONLY thing the instrument may know about the ranking. */
  distance: number;
  kind: "far" | "close";
}

/**
 * Every pair the pool can form that is usable, tagged far or close.
 *
 * Pairs between CLOSE_POSITIONS and FAR_POSITIONS are deliberately absent: a
 * middling gap is neither a critic separating two works nor a critic bracketing
 * them, and averaging it into either side would blur the only contrast the
 * instrument reports.
 */
export function spreadPairs(pool: readonly SpreadItem[] = SPREAD_POOL): SpreadPair[] {
  const out: SpreadPair[] = [];
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      const a = pool[i];
      const b = pool[j];
      const distance = Math.abs(a.position - b.position);
      if (distance >= FAR_POSITIONS) out.push({ a, b, distance, kind: "far" });
      else if (distance <= CLOSE_POSITIONS) out.push({ a, b, distance, kind: "close" });
    }
  }
  return out;
}

export const farPairs = (pool?: readonly SpreadItem[]) =>
  spreadPairs(pool).filter((p) => p.kind === "far");

export const closePairs = (pool?: readonly SpreadItem[]) =>
  spreadPairs(pool).filter((p) => p.kind === "close");
