import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import type { Locale } from "@/lib/locale";
import { localHref } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";
import { FLAW_FAMILY_LIST_ZH } from "@/content/zh/copy/across";
import { learnPage } from "@/content/learn";
import { flawFamilyList } from "@/content/flaw-families";
import { DELICACY_LIVE } from "@/content/delicacy/items";

const page = learnPage("delicacy")!;
export const metadata = explainerMetadata(page);

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). Each paragraph is one dictionary entry keyed by
 * its English, with its links and emphasis as slots, so an English edit fails as a miss.
 */
export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const href = (h: string) => localHref(locale, h);
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · DELICACY" locale={locale}>
      <p>
        {rich(
          t(
            "Hume anchors delicacy in a story he borrows from {dq}. Two of Sancho's kinsmen are asked to judge a hogshead of wine. One tastes leather in it; the other tastes iron. The company ridicules them — the wine is excellent, everyone else agrees. Then the hogshead is drained, and at the bottom lies {key}.",
          ),
          { dq: <em>{t("Don Quixote")}</em>, key: <strong>{t("an old key on a leathern thong")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "The point of the story is not that the kinsmen had refined opinions. It's that their perception was {verifiable}. There was a fact at the bottom of the barrel, and their palates found it while everyone else's missed it. Delicacy, in Hume's account, is exactly this: the capacity to register fine ingredients in a composition that most perceivers never notice — and the key in the wine is what separates delicacy from pretension. A claim of fine taste that can never be checked is just a claim.",
          ),
          { verifiable: <em>{t("verifiable")}</em> },
        )}
      </p>
      <p>
        {rich(
          t(
            "Most taste tests never leave opinion territory, which is why they can't measure delicacy at all. The {trials} are built the other way around: start from recordings in the public domain or under Creative Commons licenses, introduce controlled degradations — {list} — and ask which version is the original and what, precisely, is wrong with the other. Every trial has a key at the bottom of the barrel: {answer}. Difficulty is tunable, so the trials can find the exact threshold where your ears give out, and the items can be calibrated with item-response theory as real response data accumulates.",
            { list: locale === "zh" ? FLAW_FAMILY_LIST_ZH : flawFamilyList() },
          ),
          {
            trials: <strong>{t("Delicacy Trials")}</strong>,
            answer: <strong>{t("an objectively correct answer")}</strong>,
          },
        )}
      </p>
      <p>
        {rich(
          t(
            "In the gym, the Delicacy Trials are {status} — built after {prestige}. And where prejudice is something to be caught in the act, delicacy is something Hume says training improves — which is what {practice} is for.",
            {
              status: t(
                DELICACY_LIVE
                  ? "machine 02, and they are open"
                  : "machine 02, visible and locked until their pool clears validation",
              ),
            },
          ),
          {
            prestige: <Link href={href("/learn/prestige-bias-test")}>{t("the Prestige Test")}</Link>,
            practice: <Link href={href("/learn/practice")}>{t("practice")}</Link>,
          },
        )}
      </p>
    </Explainer>
  );
}
