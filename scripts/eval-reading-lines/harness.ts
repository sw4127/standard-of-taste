/**
 * THE READING-LINES EVAL: CAN A MODEL WRITE THE READING UNDER ITS OWN RULES?
 * (2026-09-28, AI tooling brief Part 5; measures BA-10.)
 *
 * BA-10 ended model-written text on the site: every line of the reading is a
 * template. This harness asks whether that ruling was right, or still is, by
 * measuring instead of arguing. A model is given what a real product prompt would
 * give it: one illustrative listener's facts, with their true counts, and the
 * reading's rules IN PROSE. It writes one line per fact. The same checks the
 * templates are held to then score every line.
 *
 * NOTHING IT PRODUCES IS RENDERED. Drafts and the report live in `scripts/` and
 * `docs/analytics/`; no page or route imports this file (BA-10 stands).
 *
 * THE FOUR CHECKS, applied the way `src/content/reading/lines.test.ts` applies
 * them to the templates, sentence by sentence (red-team subagent, 2026-09-28: the
 * first version ran the feeling list over the receipt, which the product never
 * does, and joined every sentence into one string, which let an offer's "?"
 * excuse an assertion in the pattern):
 *   - register    (BA-3): `patternBreaches` on the pattern, `offerBreaches` on
 *                 each offer (comparison findings go to their own check), and
 *                 exactly two offers;
 *   - carve-out   (RT-Z10 a, BA-5): `carveOutBreaches` on every sentence, the
 *                 receipt included;
 *   - comparison  (N3): `COMPARISON` on every sentence;
 *   - arithmetic  (the receipt, BP-ARG-REPLY): every "A of B" is a real pair
 *                 from the fact (a count over its own base), a percentage right
 *                 after a pair is that pair's share, any other percentage is a
 *                 real pair's share, every other number is a true count, and a
 *                 time definition's number counts only next to its unit.
 *
 * THE CONTROL: the product's own template lines, scored by the same function,
 * must pass all four (`harness.test.ts`). A scorer that failed the templates would
 * be measuring its own strictness, not the model.
 *
 * WHAT IT CANNOT DO: judge meaning, or check quantities written as words ("half",
 * "one in five"). Like the checks it borrows, a line that asserts a feeling in
 * words none of them lists passes. The report says so.
 */
import { LISTENERS } from "@/content/reading/listeners";
import { readingFor } from "@/content/reading/reading";
import { COMPARISON, matches, offerBreaches, patternBreaches } from "@/content/register";
import { carveOutBreaches } from "@/content/carve-out";
import type { Fact } from "@/engine/reading/patterns";
import type { Listener } from "@/content/reading/types";

export interface DraftLine {
  /** The fact kind the line is written from. */
  fact: string;
  pattern: string;
  receipt: string;
  offers: string[];
}

export interface Draft {
  listener: string;
  /** Which brief the drafter was given (see `BriefVersion`). */
  brief?: "v1" | "v2";
  /** Who wrote it, e.g. "claude-opus-5-5 via Claude Code subagent". */
  drafter: string;
  lines: DraftLine[];
}

export const CHECKS = ["register", "carveOut", "comparison", "arithmetic"] as const;
export type Check = (typeof CHECKS)[number];

/**
 * The time definitions the brief states: 28 days (days 0-27), week one (days 0-6)
 * and week four (days 21-27), late night 23:00-03:59 ("11 at night to 4 in the
 * morning", as the product's own template says it), an early skip inside 30
 * seconds. Such a number counts only beside its unit (`TIME_UNIT`), so "4 times"
 * is not excused by "4 in the morning".
 */
export const TIME_NUMBERS = new Set([0, 3, 4, 6, 11, 21, 23, 27, 28, 30, 59]);
const UNIT_AFTER = /^(?:\s*(?:days?|seconds?|weeks?|at night|in the morning|am|pm)\b|:\d\d|\s*-\s*\d)/i;
const UNIT_BEFORE = /(?:\bdays?\s+(?:\d+\s*-\s*)?|\d:|\d\s*-\s*)$/i;

/** The fact's true counts: the numbers its line may state on their own. */
export function trueCounts(f: Fact): number[] {
  switch (f.kind) {
    case "repetition":
      return [f.total, f.distinct, f.topPlays, f.top.length, ...f.top.map((t) => t.plays)];
    case "lateNight":
      return [f.total, f.late, f.total - f.late];
    case "newShare":
      return [f.total, f.newPlays, f.total - f.newPlays, ...(f.rising ? [f.rising.lastWeekPlays] : [])];
    case "drift":
      return [f.week1Total, f.week4Total, f.from.week1, f.from.week4, f.to.week1, f.to.week4];
    case "earlySkip":
      return [f.tried, f.skipped, f.tried - f.skipped];
  }
}

/** The fact's real (count, base) pairs: what "A of B" and a share may state. */
export function truePairs(f: Fact): [number, number][] {
  switch (f.kind) {
    case "repetition":
      return [[f.topPlays, f.total], ...f.top.map((t) => [t.plays, f.total] as [number, number]), [f.top.length, f.distinct]];
    case "lateNight":
      return [[f.late, f.total], [f.total - f.late, f.total]];
    case "newShare":
      return [[f.newPlays, f.total], [f.total - f.newPlays, f.total]];
    case "drift":
      return [[f.from.week1, f.week1Total], [f.to.week1, f.week1Total], [f.from.week4, f.week4Total], [f.to.week4, f.week4Total]];
    case "earlySkip":
      return [[f.skipped, f.tried], [f.tried - f.skipped, f.tried]];
  }
}

const num = (raw: string) => Number(raw.replace(/,/g, ""));
/** A share as written ("63", "3.6") matches a pair at the precision it was written to. */
const shareOf = (raw: string, [a, b]: [number, number]) => {
  const places = raw.includes(".") ? raw.split(".")[1].length : 0;
  return b > 0 && ((100 * a) / b).toFixed(places) === raw;
};

/** Every number in a sentence that no fact or definition produces. */
export function arithmeticBreaches(text: string, f: Fact): string[] {
  const pairs = truePairs(f);
  const counts = new Set([...trueCounts(f), f.playIds.length]);
  const out: string[] = [];
  const claimed = new Set<number>(); // start offsets already judged as part of a pair or share
  const PAIR = /(\d[\d,]*)\s+of\s+(?:[A-Za-z'’-]+\s+){0,3}?(\d[\d,]*)/g;
  for (const m of text.matchAll(PAIR)) {
    const a = num(m[1]);
    const b = num(m[2]);
    const at = m.index!;
    claimed.add(at).add(at + m[0].length - m[2].length);
    if (!pairs.some(([x, y]) => x === a && y === b)) out.push(`"${m[1]} of ${m[2]}" is not a count over its own base in this fact`);
    // A share written right after the pair must be that pair's share.
    const after = text.slice(at + m[0].length, at + m[0].length + 40);
    const pct = /^[^\d]{0,25}?(\d+(?:\.\d+)?)\s*%/.exec(after);
    if (pct) {
      const pAt = at + m[0].length + pct.index + pct[0].indexOf(pct[1]);
      claimed.add(pAt);
      if (!shareOf(pct[1], [a, b])) out.push(`${pct[1]}% follows "${m[1]} of ${m[2]}" but is not its share`);
    }
  }
  for (const m of text.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const at = m.index!;
    if (claimed.has(at)) continue;
    const raw = m[0];
    const isPct = /^\s*%/.test(text.slice(at + raw.length));
    if (isPct) {
      if (!pairs.some((p) => shareOf(raw, p))) out.push(`${raw}% is not the share of any count in this fact`);
      continue;
    }
    if (!raw.includes(".") && counts.has(num(raw))) continue;
    const unit = UNIT_AFTER.test(text.slice(at + raw.length)) || UNIT_BEFORE.test(text.slice(Math.max(0, at - 12), at));
    if (!raw.includes(".") && TIME_NUMBERS.has(num(raw)) && unit) continue;
    out.push(`states ${raw}, which the plays do not produce`);
  }
  return out;
}

const notComparison = (found: string[]) => found.filter((b) => !COMPARISON.map(String).includes(b));

/** Every failure a line has, per check (empty arrays when it passes). */
export function scoreLine(line: DraftLine, facts: Fact[]): Record<Check, string[]> {
  const sentences = [line.pattern, line.receipt, ...line.offers];
  const fact = facts.find((f) => f.kind === line.fact);
  return {
    register: [
      ...notComparison(patternBreaches(line.pattern)).map((b) => `pattern ${b}`),
      ...line.offers.flatMap((o) => notComparison(offerBreaches(o)).map((b) => `offer ${b}: "${o}"`)),
      ...(line.offers.length === 2 ? [] : [`${line.offers.length} offers, not two`]),
    ],
    carveOut: sentences.flatMap((s) => carveOutBreaches(s)),
    comparison: sentences.flatMap((s) => matches(s, COMPARISON)),
    arithmetic: [
      ...(fact ? [] : [`no fact of kind "${line.fact}" in this reading`]),
      ...(line.receipt.match(/\d/) ? [] : ["the receipt states no count"]),
      ...(fact ? sentences.flatMap((s) => arithmeticBreaches(s, fact)) : []),
    ],
  };
}

/**
 * The brief versions. v1 is the first run's brief. v2 adds ONE rule, the voice the
 * product's own lines use: the red-team subagent pointed out that v1 named the
 * listener and never said to address the reader as "you", so v1's voice and pronoun
 * counts measured the brief as much as the model. Everything else is identical.
 */
export type BriefVersion = "v1" | "v2";
export const VOICE_RULE =
  '- Address the reader as "you": the reader is the listener. Never name the listener in the third person, and never use a pronoun such as she, he or they for them.';

/** The brief a drafter receives: the rules in prose, and one listener's facts with their true counts. */
export function briefFor(l: Listener, version: BriefVersion = "v1"): string {
  const r = readingFor(l);
  const title = (id: string) => l.tracks.find((t) => t.id === id)?.title ?? id;
  const sound = (c: string) => l.clusters.find((x) => x.id === c)?.sound.texture ?? c;
  const facts = r.facts.map((f) => {
    const base = { kind: f.kind, playsCounted: f.playIds.length };
    switch (f.kind) {
      case "repetition":
        return { ...base, direction: f.direction, totalPlays: f.total, distinctTracks: f.distinct, topThree: f.top.map((t) => ({ title: title(t.trackId), plays: t.plays })), topThreePlays: f.topPlays };
      case "lateNight":
        return { ...base, direction: f.direction, totalPlays: f.total, latePlays: f.late };
      case "newShare":
        return { ...base, direction: f.direction, totalPlays: f.total, playsOfNewTracks: f.newPlays, risingNewTrack: f.rising ? { title: title(f.rising.trackId), lastWeekPlays: f.rising.lastWeekPlays } : null };
      case "drift":
        return { ...base, fromSound: sound(f.fromCluster), toSound: sound(f.toCluster), weekOnePlays: f.week1Total, weekFourPlays: f.week4Total, fromSoundPlays: f.from, toSoundPlays: f.to };
      case "earlySkip":
        return { ...base, direction: f.direction, newTracksTried: f.tried, skippedInside30s: f.skipped, soundThatKeptMost: f.keptCluster ? sound(f.keptCluster) : null };
    }
  });
  return [
    `You are writing the lines of a "reading" of one listener's last four weeks of music plays, for a product that shows a listener patterns in what they reach for. The listener, "${l.name}", is fictional and illustrative.`,
    "",
    "Write ONE line for EACH fact below. Each line has three parts:",
    "1. pattern: one or two sentences saying only what the plays show: how many, when, which. It must name no feeling or state of mind at all. It is the part a reader can check.",
    "2. receipt: the count behind the pattern, stated as numbers taken from the fact (for example \"41 of 120 plays\").",
    "3. offers: exactly two questions, each offering one possible reading of what the pattern might mean for the listener. The same pattern can come from opposite feelings, so the two offers should point in different directions. A question may name a feeling, because it hands the feeling to the reader to accept or refuse.",
    "",
    "Rules that apply to every word:",
    "- Never say the listener IS or FEELS something, or that a pattern MEANS or SHOWS something about them. Offer, do not assert.",
    "- No comparison with other people: no percentiles, no \"most listeners\", no \"unusual\" or \"average\". There is no population to compare with.",
    "- Nothing about trauma, abuse, grief, mental health, therapy or anything clinical, on any line, even as a question.",
    ...(version === "v2" ? [VOICE_RULE] : []),
    "- Use only numbers that are in the fact, percentages computed from them, or these definitions: the plays span 28 days (days 0-27); week one is days 0-6 and week four is days 21-27; late night is 23:00-03:59 (11 at night to 4 in the morning); an early skip is abandoning a new track's first play inside 30 seconds.",
    "",
    "Reply with JSON only, no prose around it, in exactly this shape:",
    '{"lines": [{"fact": "<the fact\'s kind>", "pattern": "...", "receipt": "...", "offers": ["...?", "...?"]}]}',
    "",
    "The facts:",
    JSON.stringify(facts, null, 2),
  ].join("\n");
}

export const LISTENER_IDS = LISTENERS.map((l) => l.id);

/**
 * WHAT THE FOUR CHECKS CANNOT SEE, COUNTED (2026-09-28). Reading the first run's
 * offers by eye found two things no check looks for: drafts disagree on how to
 * address the reader, and some assume a pronoun the brief never gave. Counted with
 * plain patterns, and tested, because the first version of these counts reported
 * three silent zeros (a "\b" inside a template string is a backspace).
 */
export interface VoiceCounts {
  /** Lines whose offers address the reader as "you". */
  second: number;
  /** Lines whose offers name the listener in the third person. */
  byName: number;
  /** Lines using she/her/he/him/his for a listener whose pronouns were never given. */
  gendered: number;
  genderedDrafts: string[];
}

export function voiceCounts(items: { name: string; listener: string; line: DraftLine }[]): VoiceCounts {
  const offers = (x: { line: DraftLine }) => x.line.offers.join(" ");
  const all = (x: { line: DraftLine }) => [x.line.pattern, x.line.receipt, ...x.line.offers].join(" ");
  const name = (id: string) => LISTENERS.find((l) => l.id === id)?.name ?? id;
  const g = items.filter((x) => /\b(she|her|hers|herself|he|him|his|himself)\b/i.test(all(x)));
  return {
    second: items.filter((x) => /\byou(r|rs|rself)?\b/i.test(offers(x))).length,
    byName: items.filter((x) => new RegExp(`\\b${name(x.listener)}\\b`).test(offers(x))).length,
    gendered: g.length,
    genderedDrafts: [...new Set(g.map((x) => x.name))],
  };
}

export interface Tally {
  voice?: VoiceCounts;
  lines: number;
  pass: Record<Check, number>;
  allFour: number;
  failures: { listener: string; draft: string; line: DraftLine; check: Check; why: string[] }[];
}

/** Score every draft against its listener's facts. */
export function tally(drafts: { name: string; draft: Draft }[]): Tally {
  const t: Tally = { lines: 0, pass: { register: 0, carveOut: 0, comparison: 0, arithmetic: 0 }, allFour: 0, failures: [] };
  for (const { name, draft } of drafts) {
    const l = LISTENERS.find((x) => x.id === draft.listener);
    if (!l) throw new Error(`${name}: unknown listener ${draft.listener}`);
    const facts = readingFor(l).facts;
    for (const line of draft.lines) {
      t.lines += 1;
      const s = scoreLine(line, facts);
      let ok = 0;
      for (const c of CHECKS) {
        if (s[c].length === 0) {
          t.pass[c] += 1;
          ok += 1;
        } else t.failures.push({ listener: l.id, draft: name, line, check: c, why: s[c] });
      }
      if (ok === CHECKS.length) t.allFour += 1;
    }
  }
  t.voice = voiceCounts(drafts.flatMap(({ name, draft }) => draft.lines.map((line) => ({ name, listener: draft.listener, line }))));
  return t;
}
