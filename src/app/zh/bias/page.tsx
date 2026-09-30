import BiasPage, { biasMetadata } from "@/app/bias/page";

// The Prestige Test in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = biasMetadata("zh");

export default function ZhBiasPage() {
  return <BiasPage locale="zh" />;
}
