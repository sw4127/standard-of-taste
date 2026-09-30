import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import type { Locale } from "@/lib/locale";
import { localHref } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";
import { learnPage } from "@/content/learn";

const page = learnPage("freedom-from-prejudice")!;
export const metadata = explainerMetadata(page);

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). Each paragraph is one dictionary entry keyed by
 * its English, with its links and emphasis as slots, so an English edit fails as a miss.
 */
export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const href = (h: string) => localHref(locale, h);
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · FREEDOM FROM PREJUDICE" locale={locale}>
      <p>
        {rich(
          t(
            "Of Hume's five criteria, this is the one about contamination. A judge, he argued, must keep the mind {quote} and let nothing into the verdict except the object itself — not the author's reputation, not the fashion of the moment, not loyalty, not rivalry. The judgment should belong to the work, and works don't have names until someone attaches one.",
          ),
          { quote: <em>{t('"free from all prejudice"')}</em> },
        )}
      </p>
      <p>
        {t(
          "Hume was blunt about how rarely anyone manages this. Reputation arrives before the art does; by the time you press play on an acclaimed record, the acclaim has already voted. The striking thing is that in 1757 he described what is now a replicated experimental finding: attach a prestigious label to a work and evaluations move, even when the label is false. Wine tastes better wearing an expensive price tag; the same manuscript reads worse under an unknown byline.",
        )}
      </p>
      <p>
        {t(
          "Most people, asked whether they judge music by the name on it, say no. That answer is worthless — not because people lie, but because prejudice doesn't announce itself to the person having it. The only honest way to know is to be caught in the act.",
        )}
      </p>
      <p>
        {rich(
          t(
            'That is the entire design brief of {link}: same clips, rated blind and then labeled, with some labels deliberately swapped. When your rating follows a false name, prejudice is the only suspect left in the room. The gap between your two passes is Hume\'s criterion turned into a number — and because you are your own control, the number never depends on anyone\'s opinion of what the "right" rating was.',
          ),
          { link: <Link href={href("/learn/prestige-bias-test")}>{t("the Prestige Test")}</Link> },
        )}
      </p>
      <p>
        {rich(
          t(
            "Freedom from prejudice is the first criterion the gym measures, but it is one of five. The others — {delicacy}, {practice}, {comparison}, and {goodsense} — each have a machine of their own.",
          ),
          {
            delicacy: <Link href={href("/learn/delicacy")}>{t("delicacy")}</Link>,
            practice: <Link href={href("/learn/practice")}>{t("practice")}</Link>,
            comparison: <Link href={href("/learn/comparison")}>{t("comparison")}</Link>,
            goodsense: <Link href={href("/learn/good-sense")}>{t("good sense")}</Link>,
          },
        )}
      </p>
    </Explainer>
  );
}
