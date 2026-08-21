/**
 * PICK THE INK FOR A COLOURED BUTTON, RATHER THAN ASSUMING WHITE (E6/S19).
 *
 * MEASURED ON THE LIVE PAGE, not inferred: the delicacy result's primary call
 * to action — "Share these ears" — renders white 14px bold on
 * `hsl(190 75% 62%)`, which is **1.83:1**. WCAG AA wants 4.5:1 for text that
 * size (bold only counts as "large" from 18.66px). It is the most important
 * button on the screen and it is the least readable thing on it.
 *
 * `ShareButton` hardcoded `color: "#fff"` for every primary button, so the same
 * defect ships on five surfaces: the bias flow and result in gold, the delicacy
 * flow and result in ice, and the threshold result in ice — the last of which I
 * added earlier today, inheriting a bug I had not read.
 *
 * WHY LIGHTNESS IS NOT ENOUGH. The obvious shortcut is to read the `62%` out of
 * the HSL string and call anything above 50% "light". That is wrong across
 * hues: at the same lightness, yellow is far brighter than blue. Both accents
 * here sit at 62% and only one of them is near the boundary. So the colour is
 * converted to RGB and the real relative luminance computed, which is the same
 * quantity the contrast ratio itself is defined on.
 */

/** Relative luminance per WCAG 2.x, from 0 (black) to 1 (white). */
function relativeLuminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** `hsl(190 75% 62%)`, `hsl(42, 80%, 62%)`, `#rrggbb`, `#rgb`. */
export function parseColor(css: string): [number, number, number] | null {
  const s = css.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const h = hex[1];
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  // Space- or comma-separated, with or without an alpha the ink does not care
  // about — a translucent accent sits on the page's own dark ground, and
  // guessing at that composite would be a worse answer than ignoring it.
  const hsl = /^hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%/i.exec(s);
  if (hsl) {
    const h = Number(hsl[1]) / 360;
    const sat = Number(hsl[2]) / 100;
    const l = Number(hsl[3]) / 100;
    if (sat === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
    const p = 2 * l - q;
    const channel = (t: number) => {
      let x = t;
      if (x < 0) x += 1;
      if (x > 1) x -= 1;
      if (x < 1 / 6) return p + (q - p) * 6 * x;
      if (x < 1 / 2) return q;
      if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
      return p;
    };
    return [
      Math.round(channel(h + 1 / 3) * 255),
      Math.round(channel(h) * 255),
      Math.round(channel(h - 1 / 3) * 255),
    ];
  }

  const rgb = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i.exec(s);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  return null;
}

/**
 * Black or white, whichever the eye can actually read on this background.
 *
 * Unparseable input (a `var(--accent)`, a named colour, anything new) returns
 * white — the behaviour that shipped — because silently changing an accent
 * nobody measured is not an improvement. The point is to fix the colours we
 * KNOW are wrong, not to guess at ones we cannot see.
 */
export function readableOn(background: string): "#000" | "#fff" {
  const rgb = parseColor(background);
  if (!rgb) return "#fff";
  // 0.179 is where black and white are exactly equally readable; anything
  // brighter takes black ink.
  return relativeLuminance(...rgb) > 0.179 ? "#000" : "#fff";
}

/** Exposed so tests can assert the ratio, not just the choice. */
export function contrastRatio(a: string, b: string): number | null {
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return null;
  const [hi, lo] = [relativeLuminance(...x), relativeLuminance(...y)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The brand accent, mirrored from `--accent` in `src/app/globals.css`.
 *
 * A second copy of a colour is exactly the defect this session has spent five
 * slices removing, so it is mirrored under protest and pinned by a test that
 * reads the stylesheet: `readable-on.test.ts` fails if the two ever disagree.
 * The alternative — reading a CSS custom property at render — needs a live
 * document, which server components do not have.
 */
export const BRAND_ACCENT = "#7c6cff";
