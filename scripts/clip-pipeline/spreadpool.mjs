/**
 * TRACK N CONTENT-OPS — fetch, window, render and validate the critic-ranked
 * pool (E17/S2).
 *
 *   node scripts/clip-pipeline/index.mjs spread-download   # sources -> .cache, SHA-256 into the manifest
 *   node scripts/clip-pipeline/index.mjs spread-analyze    # propose 40s windows
 *   node scripts/clip-pipeline/index.mjs spread-render     # trim + loudnorm -> public/audio/spread
 *   node scripts/clip-pipeline/index.mjs spread-validate   # Layer A over the rendered clips [--json]
 *
 * NOTHING HERE IS A SECOND COPY OF THE BIAS PIPELINE. The encoder is
 * `renderclip.mjs`, the window scorer is `windows.mjs`, and the fitness gates
 * are `gradeBiasClip` from `biasvalidate.mjs` with the target duration passed
 * in. The only thing this file owns is the manifest it reads and the directory
 * it writes to.
 *
 * That matters beyond tidiness: a clip is rated against other clips, so two
 * pools encoded by two copies of "the same" path is a loudness confound waiting
 * for the copies to drift.
 *
 * NO WINDOW IS APPROVED BY A PERSON. The bias pipeline's render stage still
 * waits on `window.approved`, a gate from before the ear pass was retired. Here
 * the scorer proposes and Layer A disposes: a window that produces dead air, a
 * near-silent clip, clipping, a loudness outlier or something that looks like
 * speech is FLAGGED by measurement, and a flagged clip does not ship.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gradeBiasClip, measureBiasClip } from "./biasvalidate.mjs";
import { decodePcm, suggestWindows } from "./windows.mjs";
import { renderClip } from "./renderclip.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const MANIFEST = join(ROOT, "src", "content", "spread", "manifest.json");
const CACHE = join(HERE, ".cache");
const AUDIO_OUT = join(ROOT, "public", "audio", "spread");

const load = () => JSON.parse(readFileSync(MANIFEST, "utf8"));
const save = (m) => writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const onlyFilter = (args) => {
  const i = args.indexOf("--only");
  return i >= 0 ? new Set(args[i + 1].split(",")) : null;
};

/* ----------------------------------------------------------- download */
export async function spreadDownload(args = []) {
  const m = load();
  mkdirSync(CACHE, { recursive: true });
  const only = onlyFilter(args);
  let done = 0;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    const url = item.source.downloadUrl;
    const ext = new URL(url).pathname.split(".").pop() || "bin";
    const dest = join(CACHE, `${item.id}.${ext}`);
    console.log(`- ${item.id}: ${url}`);
    let buf;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.log(`  fetch failed (${e.message}) — retrying via curl`);
      execFileSync("curl", ["-sL", "--fail", "--max-time", "900", url, "-o", dest], {
        stdio: "inherit",
      });
      buf = readFileSync(dest);
    }
    writeFileSync(dest, buf);
    // A CONTENT-TYPE IS NOT ENOUGH — one URL in this pool served 1797 bytes of
    // HTML from a page that looked like a file link (S1). Check the bytes.
    const magic = buf.subarray(0, 4).toString("latin1");
    const isAudio =
      magic.startsWith("ID3") ||
      magic === "fLaC" ||
      magic === "OggS" ||
      buf.subarray(4, 8).toString("latin1") === "ftyp" ||
      (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
    if (!isAudio) {
      throw new Error(`${item.id}: downloaded ${buf.length} bytes that are not audio (starts ${JSON.stringify(magic)})`);
    }
    item.source.sha256 = sha256(buf);
    item.source.cachedFile = `${item.id}.${ext}`;
    save(m); // per item: a throw on a later item must not lose earlier hashes
    console.log(`  ${(buf.length / 1e6).toFixed(1)} MB · sha256 ${item.source.sha256.slice(0, 12)}…`);
    done++;
  }
  console.log(`spread-download: ${done} fetched`);
}

/* ------------------------------------------------------------ analyze */

/**
 * How many ranked windows the fitter may try before giving up on a source.
 *
 * Raised from 12 (E17/S2) after the Diabelli Variations failed all twelve. The
 * work is thirty-three short variations with pauses between them, so a
 * 40-second window very often straddles a boundary or lands in a quiet one —
 * and twelve candidates, spaced at least half a clip apart, sample only a
 * sliver of a 55-minute recording. Searching harder is the honest response to
 * that; relaxing the dead-air gate would not be.
 */
export const MAX_WINDOW_CANDIDATES = 60;

export function spreadAnalyze(args = []) {
  const m = load();
  const only = onlyFilter(args);
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    if (!item.source.cachedFile) {
      console.log(`- ${item.id}: not downloaded — SKIP`);
      continue;
    }
    const s = suggestWindows(
      decodePcm(join(CACHE, item.source.cachedFile)),
      m.clipSeconds,
      MAX_WINDOW_CANDIDATES,
    );
    item.window = { ...(item.window || {}), suggestions: s };
    console.log(`- ${item.id}: ${s.length} candidates, best ${s[0].startSec}s (score ${s[0].score})`);
    save(m);
  }
  console.log("spread-analyze: candidates written — spread-fit renders down the list until Layer A accepts one");
}

/* ---------------------------------------------------------------- fit */

/**
 * THE WINDOW IS CHOSEN BY MEASUREMENT, NOT BY SCORE AND NOT BY A PERSON.
 *
 * The scorer ranks windows by energy, dynamics and onset density, which is a
 * decent proxy for "something is happening here" and no guarantee at all that
 * the result is fit to rate. On the first run its top pick was 32% near-silent
 * for one source and sat across a 4.3-second gap between two Diabelli
 * variations for another — both caught by Layer A, neither visible to the score.
 *
 * So this renders the top candidate, measures the actual file, and moves down
 * the ranked list until one PASSES. What ships is the first window the gates
 * accept, and the manifest records how many were rejected to get there — a
 * source that needed nine attempts is telling you something about the source.
 */
export function spreadFit(args = []) {
  const m = load();
  const only = onlyFilter(args);
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    const cands = item.window && item.window.suggestions;
    if (!item.source.cachedFile || !cands || !cands.length) {
      console.log(`- ${item.id}: needs cachedFile + analyzed candidates — SKIP`);
      continue;
    }
    const tried = [];
    let accepted = null;
    for (const cand of cands) {
      const r = renderClip(
        join(CACHE, item.source.cachedFile),
        cand.startSec,
        m.clipSeconds,
        item.id,
        m.lufsTarget,
        AUDIO_OUT,
      );
      const graded = gradeBiasClip(
        measureBiasClip(
          { id: item.id, source: { downloadUrl: item.source.downloadUrl }, window: null },
          join(AUDIO_OUT, `${item.id}.mp3`),
        ),
        m.clipSeconds,
      );
      tried.push({ startSec: cand.startSec, verdict: graded.verdict, reasons: graded.reasons });
      console.log(`  ${item.id} @ ${cand.startSec}s -> ${graded.verdict}${graded.reasons.length ? ` (${graded.reasons[0]})` : ""}`);
      if (graded.verdict === "PASS") {
        accepted = { startSec: cand.startSec, by: `Layer A accepted after ${tried.length} candidate(s)` };
        item.render = {
          ...r,
          renderedAt: new Date().toISOString().slice(0, 10),
          attribution: item.attribution,
        };
        break;
      }
    }
    item.window.chosen = accepted;
    item.window.tried = tried;
    if (!accepted) {
      // The rendered file on disk is the LAST REJECTED candidate. Say so
      // rather than leaving a failing clip sitting where a passing one goes.
      item.render = null;
      console.log(`- ${item.id}: NO WINDOW PASSED after ${tried.length} candidates — audio on disk is a reject`);
    }
    save(m);
  }
  console.log("spread-fit: done — run spread-validate to confirm what is on disk");
}

/* ------------------------------------------------------------- render */
function tasl(item) {
  return item.attribution;
}

export function spreadRender(args = []) {
  const m = load();
  const only = onlyFilter(args);
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    if (!item.source.cachedFile || !item.window || !item.window.chosen) {
      console.log(`- ${item.id}: needs cachedFile + a chosen window — SKIP`);
      continue;
    }
    const r = renderClip(
      join(CACHE, item.source.cachedFile),
      item.window.chosen.startSec,
      m.clipSeconds,
      item.id,
      m.lufsTarget,
      AUDIO_OUT,
    );
    item.render = { ...r, renderedAt: new Date().toISOString().slice(0, 10), attribution: tasl(item) };
    save(m);
    console.log(`- ${item.id}: ${r.mp3} (${r.durationSec.toFixed(2)}s)`);
  }
  console.log("spread-render: done — run spread-validate before wiring anything to these files");
}

/* ----------------------------------------------------------- validate */
export function spreadValidate(args = []) {
  const m = load();
  const only = onlyFilter(args);
  const rows = m.items
    .filter((i) => (only ? only.has(i.id) : true))
    .map((i) => {
      const file = join(AUDIO_OUT, `${i.id}.mp3`);
      const measured = measureBiasClip(
        { id: i.id, source: { downloadUrl: i.source.downloadUrl }, window: null },
        existsSync(file) ? file : null,
      );
      return gradeBiasClip(measured, m.clipSeconds);
    });

  if (args.includes("--json-silent")) return rows;
  if (args.includes("--json")) {
    console.log(JSON.stringify(rows, null, 2));
    return rows;
  }
  const h = ["id", "sec", "LUFS", "dBTP", "LRA", "clip%", "quiet%", "dead", "speech", "verdict"];
  const w = [6, 7, 8, 8, 6, 8, 8, 7, 8, 9];
  console.log(h.map((s, i) => s.padStart(w[i])).join(""));
  for (const r of rows) {
    if (r.fileMissing) {
      console.log(`${r.id.padStart(6)}   (no audio rendered)`);
      continue;
    }
    console.log(
      [
        r.id,
        r.durationSec.toFixed(2),
        r.lufs.toFixed(2),
        r.truePeakDb.toFixed(2),
        r.lra.toFixed(1),
        (r.clippedFraction * 100).toFixed(3),
        (r.quietFraction * 100).toFixed(1),
        r.longestSilenceSec.toFixed(2),
        r.speechRisk.toFixed(3),
        r.verdict,
      ]
        .map((s, i) => String(s).padStart(w[i]))
        .join(""),
    );
    for (const why of r.reasons) console.log(`        ^ ${why}`);
  }
  const flagged = rows.filter((r) => r.verdict !== "PASS");
  console.log(`\n${rows.length} clips measured, ${flagged.length} flagged.`);
  return rows;
}
