import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";
import { OUR_SCALE } from "@/content/comparison/scales";
import { criticReferenceLines } from "@/content/vocabulary/comparison";
import { DEGREES_AVAILABLE } from "@/engine/comparison";
import { numberWord } from "@/content/vocabulary/numbers";

const page = learnPage("comparison")!;
export const metadata = explainerMetadata(page);

/**
 * THIS PAGE PROMISED AN INSTRUMENT THAT WAS NEVER GOING TO BE BUILT (E16/S6).
 *
 * It described an optional import of your streaming history, and said in as
 * many words that breadth "isn't a skill to test". Both statements went out of
 * date the moment RT-H(b) ruled that breadth means DEGREES USED — measured from
 * ratings the Prestige Test already collects — and a page still advertising the
 * old design would have been a false claim about our own product (N3).
 *
 * The correction is recorded here rather than quietly swapped, because a
 * document that silently changes its own story is the defect this project keeps
 * finding in itself.
 *
 * THE NUMBERS ARE IMPORTED, NOT TYPED. The scale's size comes from the engine
 * and the critic figures from the cited registry, so this page cannot drift
 * away from what the instrument actually does or from what the sources say.
 */
export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · COMPARISON">
      <p>
        Hume&apos;s test case is a pairing nobody now remembers was ever a contest: John Ogilby, a
        workmanlike seventeenth-century versifier, against John Milton. His point was
        uncomfortable: a person acquainted with no better poetry might <em>genuinely</em> admire
        Ogilby — and the admiration would be sincere, felt, and wrong in a way the admirer has no
        way to detect. <strong>By comparison alone</strong>, he argued, do we learn to assign
        degrees of praise; whoever has seen only one kind of beauty cannot rank any.
      </p>
      <p>
        Read that carefully and it is not a claim about how much music you have heard. It is a
        claim about what breadth <em>gives</em> you — <strong>degrees</strong>. The judge who has
        weighed many works can say that one is a little better than another and a third is far
        worse; the judge who has not is left with liking and not-liking, which is one degree and a
        floor.
      </p>
      <p>
        <strong>This page used to promise something else</strong>, and the correction is worth
        stating rather than hiding. It described an optional import of your streaming history and
        said that breadth was a fact about your listening rather than a skill anyone could test.
        That version needed a catalogue we would have had to license and a taxonomy we would have
        had to invent, and it measured what you had been exposed to rather than what you could do
        with it. The version that shipped measures the thing Hume actually named.
      </p>
      <p>
        <strong>It reuses a test you have already taken.</strong> The{" "}
        <Link href="/learn/prestige-bias-test">Prestige Test</Link>{" "}asks you to rate sixteen clips
        blind on a scale of {numberWord(DEGREES_AVAILABLE)} whole numbers, then rate them again with names attached. Those ratings
        are already on your device, so comparison costs no new clip and no new tap. Two things come
        out of them: <strong>how many of the {numberWord(DEGREES_AVAILABLE)} degrees you actually landed on</strong>,
        and <strong>how many pairs you ordered one way blind and the other way round the second
        time</strong> — counting only pairs where the labels pushed both clips the same direction,
        so a prestige label cannot be the explanation.
      </p>
      <p>
        Neither number is a mark out of anything. The count is read against what an{" "}
        <em>indifferent</em> rater would produce rather than against the top of the scale, because
        rating sixteen clips at random already lands on about nine distinct values — the ceiling is
        reachable by accident, and a reader measuring themselves against it is measuring themselves
        against nothing.
      </p>

      <h2 className="pt-2 font-display text-2xl font-semibold text-white">
        What the professionals do with their own scales
      </h2>
      <p>
        Assigning degrees is not an eighteenth-century abstraction; it is the daily work of music
        criticism, and its central embarrassment is how few degrees anyone uses. These are quoted as
        a <strong>reference point and never as a target</strong> — nobody here is scored against a
        critic, for a reason given below.
      </p>
      {/*
        THROUGH `criticReferenceLines`, NOT COMPOSED HERE. Writing the line on
        this page reproduced the exact defect S4 had already removed from the
        deck - the header restating the range that the first cited finding
        gives, so the same fact arrived twice in one breath. A fix that lives in
        a function is only a fix for the callers that use it.
      */}
      {criticReferenceLines().map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>
        Ours is {OUR_SCALE.scale} — {numberWord(DEGREES_AVAILABLE)} places to put a clip. The instrument
        asks only how many of them you used — not whether you used the right ones, because on this
        question there is no right one.
      </p>

      <h2 className="pt-2 font-display text-2xl font-semibold text-white">
        Why it never scores you against a critic
      </h2>
      <p>
        The obvious version of this instrument compares your ranking with a famous reviewer&apos;s
        and tells you how close you got. It is not built, and it is not going to be. The{" "}
        <Link href="/learn/freedom-from-prejudice">Prestige Test</Link>{" "}exists to measure how far a
        prestigious name moves your judgment. <strong>Rewarding you for agreeing with a prestigious
        critic would have this product contradict itself on the same screen</strong> — so critics
        here set the spread and never the answer, and the instrument never says a reader is wrong.
      </p>
      <p>
        The honest limit, last, because it matters more than anything above it: these clips were
        never spaced out by quality. They were chosen for licence clarity and for genre spread, so
        nobody knows how far apart they truly sit. If they really are close together, hearing them
        that way is the correct answer — and <strong>this instrument cannot tell that apart from a
        listener who hears everything as much the same.</strong> It reports what you did with the
        scale. It does not grade your ear.
      </p>
      <p>
        The measurements themselves, with their formulas and their caveats, are published in the{" "}
        <Link href="/lab">Lab</Link>.
      </p>
    </Explainer>
  );
}
