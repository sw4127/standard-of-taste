import Explainer, { explainerMetadata } from "../Explainer";
import BlueprintArgument from "@/components/BlueprintArgument";
import { learnPage } from "@/content/learn";
import { bpIn, type BpId } from "@/content/blueprint";
import { GYM_INK_BRIGHT } from "@/content/instrument-accents";
import { rich, tFor } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import LEARN_ZH from "@/content/zh/copy/learn";

/**
 * /learn/why — WHY THIS EXISTS (blueprint Part 7; serves BP-INSIGHT).
 *
 * The argument the reading rests on, in premise form, then the three
 * common-sense assumptions the project rejects, then the bridge from what a
 * listener can hear to the words in their prompt. NOTHING HERE IS TYPED: every
 * statement renders from `docs/blueprint.md` through `blueprint.ts`, each with
 * its label, so this page cannot drift from the argument of record. The public
 * form of the second assumption (BP-CA2-PUBLIC) is used, because it attributes
 * each half to its source.
 *
 * `/zh/learn/why` renders this page with `locale="zh"` (bilingual Part 2): the
 * statements come from `docs/blueprint.zh.md`, by the same IDs.
 */

const page = learnPage("why")!;
export const metadata = explainerMetadata(page);

/*
 * The line under each statement comes from its note in the blueprint, never from
 * this file: a typed fallback here once labelled BP-CA2-PUBLIC, an evidenced
 * claim, "a position, not an empirical claim" (N3).
 */
function Statement({ id, locale }: { id: BpId; locale: Locale }) {
  const s = bpIn(locale, id);
  return (
    <blockquote>
      {s.text}
      {s.caption ? <span className="mt-1 block text-xs not-italic text-muted">{s.caption}</span> : null}
    </blockquote>
  );
}

export default function Page({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  return (
    <Explainer page={page} kicker="THE READING · THE ARGUMENT" locale={locale}>
      <p>
        {rich(t("{lead} Each step is labelled with what supports it: evidence, an assumption, or an inference from the steps before."), {
          lead: <strong>{t("The argument.")}</strong>,
        })}
      </p>
      <BlueprintArgument accent={GYM_INK_BRIGHT} locale={locale} />
      <p>
        <strong>{t("Three things common sense says, and the project rejects.")}</strong>
      </p>
      <Statement id="BP-CA1" locale={locale} />
      <Statement id="BP-CA2-PUBLIC" locale={locale} />
      <Statement id="BP-CA3" locale={locale} />
      <p>
        {rich(t("{lead} Why the reading ends where the hearing tests begin."), {
          lead: <strong>{t("The bridge.")}</strong>,
        })}
      </p>
      <Statement id="BP-BRIDGE" locale={locale} />
    </Explainer>
  );
}
