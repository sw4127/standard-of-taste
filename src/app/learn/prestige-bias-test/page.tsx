import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import type { Locale } from "@/lib/locale";
import { localHref } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";
import { learnPage } from "@/content/learn";
import { numberWord, numberWordLeading } from "@/content/vocabulary/numbers";
import {
  BIAS_CLIP_COUNT,
  BIAS_CONTROL_COUNT,
  BIAS_LABELLED_COUNT,
  BIAS_SESSION_MINUTES,
  BIAS_SWAPPED_COUNT,
} from "@/content/instrument-shape";

const page = learnPage("prestige-bias-test")!;
export const metadata = explainerMetadata(page);

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). Each paragraph is one dictionary entry keyed by
 * its English, with its links and emphasis as slots, so an English edit fails as a miss.
 */
export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const href = (h: string) => localHref(locale, h);
  return (
    <Explainer page={page} kicker="MACHINE 01 · THE FLAGSHIP" locale={locale}>
      <p>
        {rich(
          t(
            "The Prestige Test measures one thing: {strong}. Not whether you like the right music — whether the label in the room changes what your ears report.",
          ),
          { strong: <strong>{t("how far a famous name can move your ratings")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "The design is a within-subject experiment, about {minutes} minutes long. You hear {count} short clips and rate each one {blind} — no artist, no context, just sound. Then you hear the same {count} clips again with names and reputations attached, and rate them again. Your score is computed from the gap between the two passes: the share of your rating movement that flowed {toward} the labels.",
            { minutes: BIAS_SESSION_MINUTES, count: locale === "zh" ? BIAS_CLIP_COUNT : numberWord(BIAS_CLIP_COUNT) },
          ),
          { blind: <strong>{t("blind")}</strong>, toward: <em>{t("toward")}</em> },
        )}
      </p>
      <p>
        {rich(
          t(
            'Here is the part that makes it an instrument instead of a party trick: {strong} A modest work arrives wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow the labels even when the labels lie, the movement can\'t be explained by the music — only by the prestige. You serve as your own control, which is why the test needs no external ground truth about which clip is "objectively better."',
          ),
          {
            strong: (
              <strong>
                {t("{swapped} of the {labeled} labels are deliberately false.", {
                  swapped: locale === "zh" ? BIAS_SWAPPED_COUNT : numberWord(BIAS_SWAPPED_COUNT),
                  labeled: locale === "zh" ? BIAS_LABELLED_COUNT : numberWord(BIAS_LABELLED_COUNT),
                })}
              </strong>
            ),
          },
        )}
      </p>
      <p>
        {rich(
          t(
            '{count} of the {total} clips are {controls}: they carry no label in either pass. They measure how much your ratings drift on a plain second listen — memory, familiarity, fatigue — and that measured drift is corrected out of your headline number. The obvious objection to any re-rating design, "the second pass just tests memory," is thereby a published control rather than a caveat.',
            {
              count: locale === "zh" ? BIAS_CONTROL_COUNT : numberWordLeading(BIAS_CONTROL_COUNT),
              total: locale === "zh" ? BIAS_CLIP_COUNT : numberWord(BIAS_CLIP_COUNT),
            },
          ),
          { controls: <strong>{t("controls")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "Every swap is confessed. The test ends with a {strong} that names each false label, shows the true attribution, and shows exactly what your ratings did when the name was a lie. You cannot exit around it. An instrument built on deception owes you the disclosure — and the disclosure is the part worth staying for.",
          ),
          { strong: <strong>{t("mandatory debrief")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            'Your result is a measured number, not a diagnosis. And until enough real sessions exist to compute honest norms, it is labeled {provisional} — no invented percentiles, no "better than 73% of listeners." The philosophy behind the design is Hume\'s criterion of {freedom}; the measurement principles are laid out in the {methodology}.',
          ),
          {
            provisional: <strong>{t("provisional")}</strong>,
            freedom: <Link href={href("/learn/freedom-from-prejudice")}>{t("freedom from prejudice")}</Link>,
            methodology: <Link href={href("/learn/methodology")}>{t("methodology")}</Link>,
          },
        )}
      </p>
    </Explainer>
  );
}
