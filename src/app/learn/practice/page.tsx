import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { numberWord } from "@/content/vocabulary/numbers";

const page = learnPage("practice")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · PRACTICE">
      <p>
        Practice is the criterion that makes this product a <strong>gym</strong> rather than a
        mirror. Hume is unambiguous: nothing improves the faculty of judging more than{" "}
        <em>practice in a particular art</em>{" "}
        — the repeated, attentive survey of works of one
        kind. Taste, in his account, is not an endowment you check once and frame. It&apos;s a
        capacity that sharpens with reps and dulls with neglect.
      </p>
      <p>
        He even describes the beginner&apos;s condition: confront a work for the first time and the
        sentiment it produces is <em>obscure and confused</em> — you can tell you feel something,
        but not which parts of the work are doing it, or how well. Only repeated encounters let a
        judge resolve that blur into discrimination: this voicing, that transition, this specific
        flaw. Anyone who has learned to hear the difference between a good and a great recording of
        the same piece has lived this.
      </p>
      <p>
        The gym takes the claim literally, with the same honesty rule as everything else: an
        improvement you can&apos;t measure is an improvement you can&apos;t claim. Sit a threshold
        ladder twice in the same browser and the result screen compares the two —{" "}
        <strong>against a noise floor we measured first</strong>, so that a difference smaller than
        the instrument&apos;s own run-to-run wobble is reported as no change rather than as
        progress.
      </p>
      <p>
        That floor is high, and saying so is the point. Two sittings on the pitch ladder have to
        differ by roughly <strong>three and a half times</strong>{" "}
        before the arc will call it
        movement; on the prestige test the label&apos;s pull has to shift by eight points of the
        scale. Most retests are therefore told that nothing changed the instrument could hear —
        which is the honest answer, and the reason the sentence names what it would have taken
        instead of leaving you to guess. The delicacy trials get no arc at all:{" "}
        {numberWord(DELICACY_ARC_FLOOR.trials)} pairs cannot resolve a change smaller than{" "}
        {numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of them, so that screen says so and points
        here.
      </p>
      <p>
        What a second sitting genuinely buys is <strong>precision</strong>. The wobble of an
        average falls as the square root of the number of sittings, so the more often you come
        back, the smaller a real change has to be before this can see it. That is the whole
        return: not a badge or a streak, but a number that gets harder to argue with.
      </p>
      <p>
        Practice alone isn&apos;t sufficient, though. Hume pairs it with breadth — you can rehearse
        one narrow corner of music forever and stay a provincial judge. That failure mode belongs
        to <Link href="/learn/comparison">comparison</Link>, and knowing whether to trust your own
        sharpening judgment belongs to <Link href="/learn/good-sense">good sense</Link>. The gym
        starts where prejudice is caught in the act:{" "}
        <Link href="/learn/prestige-bias-test">the Prestige Test</Link>.
      </p>
    </Explainer>
  );
}
