import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";
import { MIN_PAIRS_PER_KIND, SPREAD_POOL, closePairs, farPairs } from "@/content/spread/ranking";
import { spreadIfIndifferent } from "@/engine/spread";
import { numberWord, numberWordLeading } from "@/content/vocabulary/numbers";

const WORKS = SPREAD_POOL.length;
const FAR = farPairs().length;
const CLOSE = closePairs().length;
const BY_CHANCE = spreadIfIndifferent().toFixed(1);

const page = learnPage("ranking-test")!;
export const metadata = explainerMetadata(page);

/**
 * THE READING-ROOM PAGE FOR TRACK N (E17, PM ruling RT-N4 a).
 *
 * Every other live instrument had an explainer and this one did not, which D5
 * makes a defect rather than a gap: depth is unlocked, never buried.
 *
 * THE NUMBERS ARE IMPORTED, NOT TYPED. The pool size, both pair counts, the
 * floor and the chance baseline all come from the modules that compute them, so
 * this page cannot drift away from the instrument the way the pages describing
 * the pool's size did before RT-136.
 *
 * THE EXPERT PANEL EXISTS NOW (E18/S3). This page shipped saying it did not,
 * because the panel reads a store RT-G would create and RT-G was unruled — a
 * sentence that was false when it was written, RT-G having been ruled (b) on
 * 2026-09-01 with the store built four days earlier. S2 gave the instrument the
 * store and S3 the panel, so the paragraph describes what is under the result
 * rather than what is missing from it.
 */
export default function Page() {
  return (
    <Explainer page={page} kicker="THE INSTRUMENTS · THE RANKING TEST">
      <p>
        A critic once put twenty-one Beethoven works in order. Michael Tanner did it for{" "}
        <em>BBC Music Magazine</em>, and like every such list it is one person&apos;s opinion
        published under his own name — which is exactly what makes it usable here. It is not a
        correct answer. It is a <strong>second set of gaps</strong> to compare yours against.
      </p>
      <p>
        {numberWordLeading(WORKS)} of those works are played here, forty seconds each, with nothing
        attached: no composer date, no movement title, no hint of where he placed them. You rate
        what you hear. Afterwards the instrument reports{" "}
        <strong>how far apart your two ratings fell</strong> across the {numberWord(FAR)} pairs he
        separated by ten positions or more, and the same figure across the {numberWord(CLOSE)}{" "}
        pairs he placed within three of each other.
      </p>
      <p>
        <strong>Agreeing with him is not measured, and the instrument could not measure it if it
        tried.</strong>{" "}The only thing taken from the ranking is the <em>distance</em> between
        two positions. Which of the two he put higher was never imported, so there is no stored
        number from which your agreement could be worked out afterwards — not by us, not later, not
        by accident. Preferring the work he ranked lower costs you nothing. It would also
        contradict the{" "}
        <Link href="/learn/prestige-bias-test">Prestige Test</Link>, which measures being moved by
        an authority, to reward being moved by one on the same product.
      </p>
      <p>
        Both numbers are read against <strong>{BY_CHANCE} points</strong>, which is what rating at
        random produces — and it produces the same figure on both kinds of pair, because chance
        does not know which works a critic separated. That is the whole reference point. A reader
        whose two figures sit together near it has not discriminated; a reader whose figures differ
        has, in this sitting, on these clips.
      </p>
      <p>
        <strong>The two numbers are never combined, and the difference between them is never
        reported.</strong>{" "}They rest on {numberWord(FAR)} pairs and {numberWord(CLOSE)} pairs,
        built from clips that appear in several pairs apiece, and nobody has sat this instrument
        twice — so how far the figures wander on their own has never been measured. There is no
        honest size at which the gap between them becomes a result. Offering one would be inventing
        the threshold, which is the failure this product spends its existence refusing.
      </p>
      <p>
        <strong>If you already know the music, say so before you rate it.</strong>{" "}Half of any
        critic&apos;s list is famous, and recognising a work means part of your rating is memory of
        a reputation rather than the last forty seconds. Those clips are removed before anything is
        computed. It is taken on your word — nothing checks — and what you recognised is never
        reported as a fact about you. Recognise enough and you get no number at all, plus a plain
        statement of why, because the instrument needs at least {numberWord(MIN_PAIRS_PER_KIND)}{" "}
        usable pairs of each kind and will not print a figure it cannot support.
      </p>
      <p>
        <strong>Two limits are published rather than hidden.</strong>{" "}A forty-second excerpt
        cannot carry a critic&apos;s verdict on a work that runs forty minutes; forty seconds is
        longer than anything else here and is still a mitigation rather than a fix. And these six
        recordings differ in brightness by about ten kilohertz for reasons no ranking caused — one
        source is a 128 kbps mp3 whose sound stops at 8,624 Hz. Measured, that difference is
        larger across the pairs he bracketed together than across the ones he separated, so it
        makes a difference <em>harder</em> to find rather than easier. Both figures, and what they
        were measured against, are on{" "}
        <Link href="/lab">the Lab</Link>.
      </p>
      <p>
        Your answers stay in the browser you gave them in, like every other result here — the
        ratings and which clips you said you already knew, never the two figures, which are worked
        out again each time they are read. Underneath the result is the raw record: what you gave
        each of the six, which works they actually were, and the gap you left on every pair that
        counted. It is the only place the six are named, and reading it is the end of your blind
        sitting.
      </p>
    </Explainer>
  );
}
