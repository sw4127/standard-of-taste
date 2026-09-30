import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import type { Locale } from "@/lib/locale";
import { localHref } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";
import { learnPage } from "@/content/learn";

const page = learnPage("good-sense")!;
export const metadata = explainerMetadata(page);

/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). Each paragraph is one dictionary entry keyed by
 * its English, with its links and emphasis as slots, so an English edit fails as a miss.
 */
export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const href = (h: string) => localHref(locale, h);
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · GOOD SENSE" locale={locale}>
      <p>
        {rich(
          t(
            "Good sense is Hume's supervising faculty — reason, standing behind perception and checking its work. The other criteria can all misfire without it: delicate ears with no judgment about when to trust themselves, practice that rehearses a bias into a habit, breadth that collects exposure without weighing it. Good sense is the part of a judge that knows {strong}.",
          ),
          { strong: <strong>{t("when their own verdict is reliable and when it isn't")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "That sounds unmeasurable — a faculty about faculties. It isn't. Decision science has a precise, boring name for it: {calibration}. A judge is well calibrated when their confidence matches their accuracy — when the answers they'd stake 95% on are right about 95% of the time, and the coin-flip feelings are right about half the time. Overconfidence and underconfidence are both failures of exactly the thing Hume was pointing at: knowing the reliability of your own judgment.",
          ),
          { calibration: <strong>{t("calibration")}</strong> },
        )}
      </p>
      <p>
        {rich(
          t(
            "So the gym measures it. On performance items — trials with objectively right answers, like the {delicacy} — you attach a confidence level to each answer: {levels}. Plot claimed confidence against actual accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the diagonal where confidence and reality agree. The result is Hume's most abstract criterion turned into arithmetic: a curve you can read, and one number for how far it sits from the line.",
          ),
          {
            delicacy: <Link href={href("/learn/delicacy")}>{t("Delicacy Trials")}</Link>,
            levels: <strong>{t("95%, 70%, or 50%")}</strong>,
          },
        )}
      </p>
      <p>
        {rich(
          t(
            "One honesty note, because it's the house rule: confidence input never inflates or weights your scores — it's measured {against} your accuracy, never blended into it. A confident wrong answer costs you calibration; it cannot buy you points. The gym opens with {prestige}; the full measurement rules live in the {methodology}.",
          ),
          {
            against: <em>{t("against")}</em>,
            prestige: <Link href={href("/learn/prestige-bias-test")}>{t("the Prestige Test")}</Link>,
            methodology: <Link href={href("/learn/methodology")}>{t("methodology")}</Link>,
          },
        )}
      </p>
    </Explainer>
  );
}
