/**
 * A GENERATED FILE IS ONLY AS FRESH AS THE LAST RUN OF ITS GENERATOR (Track V/S3).
 *
 * Twice now a committed artefact described a product that no longer existed and
 * nothing failed, because nothing re-ran the thing that writes it:
 *
 *  - `docs/copy-deck-method.md` said "The six refusals" over a page rendering
 *    seven, for nine days (E21, finding 11).
 *  - `docs/assets/swapped-shift.svg` and `listen-shift.svg` — the charts the
 *    write-up embeds — were last rendered on 2026-07-19, when the Prestige pool
 *    had eight scored clips. It has fourteen. The committed demo said "truthful
 *    labels (1500 item-ratings)"; its own generator says 2100 today. Found by
 *    running this, on 2026-09-22.
 *
 * So this re-runs every generator whose output is tracked and asks git whether
 * anything moved. It WRITES the working tree — which is what you would have to
 * do to fix it anyway — and fails if the result differs from what is committed,
 * naming the files. `.githooks/pre-push` runs it after the suite: the deck
 * exporter takes ~20 s, which is too slow for every test run and nothing on a
 * push. The charts, which take half a second, are also held by
 * `scripts/charts-fresh.test.ts` on every run.
 *
 *   node scripts/check-generated.mjs
 */
import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Every chart the repository tracks, with the command that draws it. */
export const CHARTS = [
  { script: "scripts/analysis/bias-distribution.mjs", out: "docs/assets/bias-gap.svg" },
  { script: "scripts/analysis/bias-distribution.mjs", out: "docs/assets/bias-gap-demo.svg" },
  { script: "scripts/analysis/swapped-shift.mjs", out: "docs/assets/swapped-shift.svg" },
  { script: "scripts/analysis/listen-shift.mjs", out: "docs/assets/listen-shift.svg" },
];

/** Everything `export-copy-decks.mjs` writes. */
export const DECK_OUTPUTS = [
  "docs/copy-deck.md",
  "docs/copy-deck-vocabulary.md",
  "docs/copy-deck-instruments.md",
  "docs/copy-deck-pages.md",
  "docs/copy-deck-method.md",
  "docs/copy-deck-reading.md",
  "docs/copy-review-ledger.md",
  "docs/copy-commission.md",
];

/** Files among `paths` whose working copy differs from the last COMMIT. */
const changedSinceHead = (paths) =>
  execFileSync("git", ["diff", "HEAD", "--name-only", "--", ...paths], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);

/**
 * A chart drawn from REAL data carries no SYNTHETIC watermark and cannot be
 * redrawn here — there is no data in the repository to draw it from. Redrawing
 * it with `--demo` would replace a real result with a synthetic one, which is
 * an N3 violation wearing the costume of a freshness fix. So it is skipped, and
 * said to be skipped.
 */
export const isSynthetic = (svg) => svg.includes("SYNTHETIC");

function main() {
  const paths = [...DECK_OUTPUTS, ...CHARTS.map((c) => c.out)];
  // Regenerating overwrites these files. Uncommitted work in one of them would
  // be destroyed without a word, so refuse instead of clobbering it.
  const dirty = changedSinceHead(paths);
  if (dirty.length) {
    console.error(
      "check-generated: these generated files have uncommitted changes, and regenerating would " +
        "overwrite them. Commit or discard them first:\n" +
        dirty.map((f) => `  ${f}`).join("\n"),
    );
    process.exit(1);
  }
  execSync("node scripts/export-copy-decks.mjs", { stdio: "inherit" });
  for (const c of CHARTS) {
    if (!isSynthetic(readFileSync(c.out, "utf8"))) {
      console.log(`check-generated: ${c.out} is a REAL render; not redrawn, not checked.`);
      continue;
    }
    execFileSync("node", [c.script, "--demo", "--out", c.out], { stdio: "ignore" });
  }
  // Against HEAD, not the index: a fresh file that is staged but not committed
  // is not in the push, and comparing against the index would let it pass.
  const stale = changedSinceHead(paths);
  if (stale.length) {
    console.error(
      "\ncheck-generated: these committed files are not what their generators write today:\n" +
        stale.map((f) => `  ${f}`).join("\n") +
        "\n\nThe working tree now holds the fresh versions. Read the diff, then commit them.\n",
    );
    process.exit(1);
  }
  console.log(`check-generated: ${paths.length} generated files match their generators.`);
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) main();
