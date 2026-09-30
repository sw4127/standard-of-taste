import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import type { Locale } from "@/lib/locale";
import { localHref } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";
import { learnPage } from "@/content/learn";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { numberWord } from "@/content/vocabulary/numbers";
import { ARC_FLOORS, soloFloorFactor } from "@/engine/arc";

/*
 * THE TWO FLOORS THIS PARAGRAPH EXPLAINS ARE MEASURED, so it may not write them
 * in (E19/S13, from Cowork's batch-2 return). `ARC_FLOORS` is re-derived on
 * every test run; the prose was not, and it sat in the sentence saying the
 * floors were measured. `PITCH_SOLO_FLOOR` is null only if that ladder loses
 * its floor, which would make the sentence untrue rather than merely stale — so
 * the paragraph drops to the prestige half rather than printing a placeholder.
 */
const PITCH_SOLO_FLOOR = soloFloorFactor("pitch-drift");
const BIAS_FLOOR_POINTS = ARC_FLOORS.bias;

/*
 * A BRANCH HERE WOULD LAND IN THE COPY DECK AS RAW MARKUP. The first version
 * guarded the null case inline, and the page deck -- which scrapes the JSX a
 * reader sees -- rendered the writer a paragraph beginning `{PITCH_SOLO_FLOOR
 * !== null ? ( <>`. Correct page, unreadable artefact.
 *
 * There is no honest fallback anyway: if the pitch ladder loses its floor this
 * paragraph is describing a floor that does not exist, and a page that cannot
 * be rendered truthfully should fail the build rather than print a placeholder.
 * `arc-floors.test.ts` pins the entry so this throw is a backstop, not a plan.
 */
if (PITCH_SOLO_FLOOR === null) {
  throw new Error("practice page: the pitch ladder has no arc floor to describe");
}
const PITCH_FLOOR_TIMES = PITCH_SOLO_FLOOR.toFixed(1);

const page = learnPage("practice")!;
export const metadata = explainerMetadata(page);

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). Each paragraph is one dictionary entry keyed by
 * its English, with its links and emphasis as slots, so an English edit fails as a miss.
 */
export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const href = (h: string) => localHref(locale, h);
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · PRACTICE" locale={locale}>
      <p>
        {rich(
          t(
            "Practice is the criterion that makes this product a {gym} rather than a mirror. Hume is unambiguous: nothing improves the faculty of judging more than {em} — the repeated, attentive survey of works of one kind. Taste, in his account, is not an endowment you check once and frame. It's a capacity that sharpens with reps and dulls with neglect.",
          ),
          { gym: <strong>{t("gym")}</strong>, em: <em>{t("practice in a particular art")}</em> },
        )}
      </p>
      <p>
        {rich(
          t(
            "He even describes the beginner's condition: confront a work for the first time and the sentiment it produces is {em} — you can tell you feel something, but not which parts of the work are doing it, or how well. Only repeated encounters let a judge resolve that blur into discrimination: this voicing, that transition, this specific flaw. Anyone who has learned to hear the difference between a good and a great recording of the same piece has lived this.",
          ),
          { em: <em>{t("obscure and confused")}</em> },
        )}
      </p>
      <p>
        {rich(
          t(
            "The gym takes the claim literally, with the same honesty rule as everything else: an improvement you can't measure is an improvement you can't claim. Sit a threshold ladder twice in the same browser and the result screen compares the two — {strong}, so that a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress.",
          ),
          { strong: <strong>{t("against a noise floor we measured first")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "That floor is high, and saying so is the point. Two sittings on the pitch ladder have to differ by roughly {times} before the arc will call it movement; on the prestige test the label's pull has to shift by {points} points of the scale. Most retests are therefore told that nothing changed the instrument could hear — which is the honest answer, and the reason the sentence names what it would have taken instead of leaving you to guess. The delicacy trials get no arc at all: {trials} pairs cannot resolve a change smaller than {items} of them, so that screen says so and points here.",
            {
              points: locale === "zh" ? BIAS_FLOOR_POINTS : numberWord(BIAS_FLOOR_POINTS),
              trials: locale === "zh" ? DELICACY_ARC_FLOOR.trials : numberWord(DELICACY_ARC_FLOOR.trials),
              items: locale === "zh" ? DELICACY_ARC_FLOOR.itemsToMove : numberWord(DELICACY_ARC_FLOOR.itemsToMove),
            },
          ),
          { times: <strong>{t("{n} times", { n: PITCH_FLOOR_TIMES })}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "What a second sitting genuinely buys is {precision}. The wobble of an average falls as the square root of the number of sittings, so the more often you come back, the smaller a real change has to be before this can see it. That is the whole return: not a badge or a streak, but a number that gets harder to argue with.",
          ),
          { precision: <strong>{t("precision")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "Practice alone isn't sufficient, though. Hume pairs it with breadth — you can rehearse one narrow corner of music forever and stay a provincial judge. That failure mode belongs to {comparison}, and knowing whether to trust your own sharpening judgment belongs to {goodsense}. The gym starts where prejudice is caught in the act: {prestige}.",
          ),
          {
            comparison: <Link href={href("/learn/comparison")}>{t("comparison")}</Link>,
            goodsense: <Link href={href("/learn/good-sense")}>{t("good sense")}</Link>,
            prestige: <Link href={href("/learn/prestige-bias-test")}>{t("the Prestige Test")}</Link>,
          },
        )}
      </p>
    </Explainer>
  );
}
