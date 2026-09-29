import LanguageSwitch from "./LanguageSwitch";
import { ZH_TRANSLATION_NOTE } from "@/content/zh/style";
import type { Locale } from "@/lib/locale";

/**
 * THE SWITCH ON A PAGE WITH NO HEADER (bilingual Part 2).
 *
 * The instruments open straight into their flow, with no site header, so the
 * one language button had nowhere to sit and a Chinese instrument page had
 * nowhere to say it is a translation. This bar carries both, above the flow, in
 * the flow's own column width: the button on the right, and on a Chinese page
 * the note from its one constant. Pages with the shared header never use it.
 */
export default function LanguageBar({ locale, width = "max-w-xl" }: { locale: Locale; width?: string }) {
  return (
    <div className={`relative z-10 mx-auto flex w-full ${width} items-start justify-between gap-4 px-5 pt-6`}>
      <p className="text-[11px] leading-relaxed text-muted">{locale === "zh" ? ZH_TRANSLATION_NOTE : null}</p>
      <LanguageSwitch />
    </div>
  );
}
