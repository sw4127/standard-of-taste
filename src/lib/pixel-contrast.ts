/**
 * CONTRAST, MEASURED FROM PIXELS (E7/S17).
 *
 * Every previous attempt to check contrast in this project measured the CSS and
 * got it wrong — a mis-parsed `lab()`, a comparison against the page background
 * instead of the element's own, an `oklab(… / 0.05)` treated as opaque. Three
 * confident, plausible, wrong numbers. So this reads the rendered pixels, where
 * there is nothing left to mis-parse: whatever the browser or Satori actually
 * painted is what gets measured.
 *
 * TWO CHOICES THAT DECIDE WHETHER THE NUMBER IS REAL:
 *
 * 1. The foreground is the BRIGHTEST DECILE of a text band, not its mean. A
 *    glyph's edge pixels are antialiased blends of ink and ground, and averaging
 *    them reports a contrast nobody can see — always flatteringly low for light
 *    ink on dark, which would manufacture failures. The decile is the glyph
 *    core: the colour actually drawn.
 * 2. The background is the MODE of the darker half of the same band, not the
 *    page's nominal background. Cards are painted over gradients; the ground
 *    under a line of text is not the ground in the corner.
 *
 * `contrastRatio` is the WCAG 2.1 definition and is checked against the
 * standard's own worked values in the test.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** WCAG relative luminance. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio, always >= 1. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface TextBand {
  /** Row range of this run of ink. */
  top: number;
  bottom: number;
  /** The colour the glyph cores were drawn in. */
  ink: Rgb;
  /** The ground actually painted under this band. */
  ground: Rgb;
  ratio: number;
  /** How much ink — a band of a few stray pixels is not a line of text. */
  inkPixels: number;
}

const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Split an RGB buffer into bands of text and measure each one.
 *
 * `minInkPixels` exists because antialiasing and 1px rules produce bands that
 * are not text; measuring them yields real numbers about nothing.
 */
export function measureTextBands(
  rgb: Buffer | Uint8Array,
  width: number,
  height: number,
  { gapRows = 6, minInkPixels = 400 }: { gapRows?: number; minInkPixels?: number } = {},
): TextBand[] {
  const rowLum: number[] = [];
  const rowMax: number[] = [];
  for (let y = 0; y < height; y++) {
    let sum = 0;
    let max = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const l = lum(rgb[i], rgb[i + 1], rgb[i + 2]);
      sum += l;
      if (l > max) max = l;
    }
    rowLum.push(sum / width);
    rowMax.push(max);
  }
  // A row belongs to a text band when its brightest pixel clearly exceeds the
  // page's own darkest rows — i.e. something was drawn on it.
  const floor = [...rowMax].sort((a, b) => a - b)[Math.floor(height * 0.1)] + 24;

  const bands: TextBand[] = [];
  let start = -1;
  let blanks = 0;
  const close = (endRow: number) => {
    if (start < 0) return;
    const band = measureBand(rgb, width, start, endRow);
    if (band && band.inkPixels >= minInkPixels) bands.push(band);
    start = -1;
  };
  for (let y = 0; y < height; y++) {
    if (rowMax[y] > floor) {
      if (start < 0) start = y;
      blanks = 0;
    } else if (start >= 0) {
      blanks++;
      if (blanks >= gapRows) close(y - blanks);
    }
  }
  close(height - 1);
  return bands;
}

function measureBand(rgb: Buffer | Uint8Array, width: number, top: number, bottom: number): TextBand | null {
  const pixels: { l: number; r: number; g: number; b: number }[] = [];
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      pixels.push({ l: lum(rgb[i], rgb[i + 1], rgb[i + 2]), r: rgb[i], g: rgb[i + 1], b: rgb[i + 2] });
    }
  }
  if (pixels.length === 0) return null;
  pixels.sort((a, b) => a.l - b.l);

  // Ground: the mode of the darker half, bucketed, so a gradient still yields
  // the colour most of the band sits on.
  const darker = pixels.slice(0, Math.floor(pixels.length / 2));
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (const p of darker) {
    const key = `${p.r >> 3}-${p.g >> 3}-${p.b >> 3}`;
    const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    buckets.set(key, { n: cur.n + 1, r: cur.r + p.r, g: cur.g + p.g, b: cur.b + p.b });
  }
  let best = { n: 0, r: 0, g: 0, b: 0 };
  for (const v of buckets.values()) if (v.n > best.n) best = v;
  const ground: Rgb = { r: best.r / best.n, g: best.g / best.n, b: best.b / best.n };

  // Ink: the brightest decile OF THE INK PIXELS — not of the whole band.
  //
  // The first version took the decile of every pixel in the band, and it was
  // wrong in a way that only shows on short lines. A centred phrase like "still
  // hear" occupies a fraction of a 1200px row, so 10% of the band's pixels is
  // mostly background: the "ink" came back as near-black and the line measured
  // 1.35:1, while the identically-styled longer line directly above it measured
  // 4.87:1. Same colour, same size, same card — the only difference was how
  // much of the row the words filled.
  //
  // That is the shape of every contrast bug this project has had: a number that
  // is confident, plausible, and about the wrong pixels. Ink is now segmented
  // first, and the decile is taken within it.
  const groundLum = lum(ground.r, ground.g, ground.b);
  const inked = pixels.filter((p) => p.l > groundLum + 24);
  if (inked.length === 0) return null;
  const decile = inked.slice(Math.floor(inked.length * 0.9));
  const ink: Rgb = {
    r: decile.reduce((s, p) => s + p.r, 0) / decile.length,
    g: decile.reduce((s, p) => s + p.g, 0) / decile.length,
    b: decile.reduce((s, p) => s + p.b, 0) / decile.length,
  };
  return { top, bottom, ink, ground, ratio: contrastRatio(ink, ground), inkPixels: inked.length };
}
