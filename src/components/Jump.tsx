import Link from "next/link";

/**
 * A JUMP — text that moves you somewhere (E7/S22, PM ruling RT-154 a).
 *
 * THE RULE THIS EXISTS TO MAKE TRUE: if it moves you, it is set in the mono
 * face; if it is set in the mono face, it moves you. Nothing else in the
 * product uses it.
 *
 * The PM's complaint was that jumping around the product is unclear — you
 * cannot tell at rest what is clickable, because a link is body text with an
 * underline, and underlines also appear on emphasis. A second typeface is a
 * much stronger signal than a decoration: mono reads as *interface* against
 * Fraunces (the product's voice) and Geist (its prose), and it already matches
 * the Lab's data character, so it unifies rather than adds.
 *
 * IT COSTS NOTHING TO LOAD. Geist Mono is already bundled and already applied
 * to <html> — the ruling was to avoid a new font file, and this avoids it
 * while still being identical on every device rather than whatever monospace
 * the visitor's OS happens to supply.
 *
 * NOT FOR BUTTONS. The accent-filled pills are a different affordance with
 * their own rules (see `readableOn`); this is for text.
 */
export default function Jump({
  href,
  children,
  accent,
  className = "",
  external = false,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  /** The calling instrument's colour, used on hover. Defaults to plain white. */
  accent?: string;
  className?: string;
  external?: boolean;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  // min-h/py give a 44px tap target without changing how the line sits in prose.
  const base =
    "inline-flex min-h-[44px] items-center font-mono text-[0.8125rem] tracking-tight " +
    "underline decoration-dotted underline-offset-[5px] transition-colors " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const style = accent ? ({ "--jump-hover": accent } as React.CSSProperties) : undefined;
  const hover = accent ? "hover:text-[var(--jump-hover)]" : "hover:text-white";

  if (external) {
    return (
      <a href={href} className={`${base} ${hover} ${className}`} style={style} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${hover} ${className}`} style={style} {...rest}>
      {children}
    </Link>
  );
}
