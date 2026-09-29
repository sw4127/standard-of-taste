/**
 * EVERY CHINESE PAGE SITS INSIDE THIS (bilingual Part 2).
 *
 * The root layout owns `<html lang="en">`, and giving the Chinese pages their
 * own root would mean moving every English route into a route group. So the
 * language is declared here, on a wrapper that takes no box of its own
 * (`display: contents`): screen readers and search engines read `lang` from the
 * nearest ancestor, and the layout of the page inside is unchanged.
 */
export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="zh-Hans" className="contents">
      {children}
    </div>
  );
}
