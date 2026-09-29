import type { ReactNode } from "react";

/**
 * A HEADING'S BRACKETED ENGLISH, SET DOWN A SIZE (bilingual Part 2).
 *
 * The first use of a term on a Chinese page carries its English in brackets
 * (docs/glossary-zh.md), and in a display heading that English wrapped across
 * lines at full size. This wraps each full-width-bracketed Latin run in a span
 * (`.zh-term-en` in globals.css); the text a reader or a guard reads is
 * unchanged. English text passes through untouched.
 */
export default function ZhTerms({ children }: { children: string }): ReactNode {
  // The full-width brackets, built from their code points so no Chinese sits outside src/content/zh.
  const open = String.fromCharCode(0xff08);
  const close = String.fromCharCode(0xff09);
  const term = new RegExp(`(${open}[A-Za-z][^${open}${close}]*${close})`);
  const parts = children.split(term);
  if (parts.length === 1) return children;
  return parts.map((p, i) =>
    p.startsWith(open) && /[A-Za-z]/.test(p.charAt(1)) ? (
      <span key={i} className="zh-term-en">
        {p}
      </span>
    ) : (
      p
    ),
  );
}
