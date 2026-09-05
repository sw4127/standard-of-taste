#!/usr/bin/env node
/**
 * Bias-pool content-ops pipeline (rt-answers-2026-07-11 §Content-ops).
 * PM only ear-confirms; this does the mechanics. Stages:
 *
 *   node scripts/clip-pipeline/index.mjs download   # fetch sources -> .cache, SHA-256 into manifest
 *   node scripts/clip-pipeline/index.mjs download --only pb9,pb10   # ...only these ids (leaves other hashes alone)
 *   node scripts/clip-pipeline/index.mjs snapshot   # save license-proof pages -> src/content/bias/licenses/
 *   node scripts/clip-pipeline/index.mjs analyze    # propose top-2 20s windows per item (PM ear-confirms)
 *   node scripts/clip-pipeline/index.mjs render     # trim approved windows, R128 loudnorm to target LUFS,
 *                                                   # mp3 + m4a into public/audio/bias, TASL attributions
 *   # debug helpers (local files, no manifest):
 *   node scripts/clip-pipeline/index.mjs analyze --local <file> [--len 20]
 *   node scripts/clip-pipeline/index.mjs render  --local <file> --start <sec> [--len 20] [--out <id>]
 *
 * The gatekeeping tests (src/content/bias/bias.test.ts) fail the suite if any
 * non-placeholder item ships without a license snapshot + proof URL + sha256.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderClip } from "./renderclip.mjs";
import { decodePcm, suggestWindows } from "./windows.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(dirname(fileURLToPath(import.meta.url)), ".cache");
const LICENSES = join(ROOT, "src", "content", "bias", "licenses");
const AUDIO_OUT = join(ROOT, "public", "audio", "bias");



function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST, "utf8"));
}
function saveManifest(m) {
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
}
function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

/* ------------------------------------------------------------ download */
async function download(args = []) {
  const m = loadManifest();
  mkdirSync(CACHE, { recursive: true });
  // --only pb9,pb10 : E7/S2. Without this, adding one item re-fetches all of
  // them and rewrites every recorded sha256. Those hashes are the provenance
  // record — the evidence that the bytes we normalized are the bytes the
  // licensed source served. If archive.org ever re-encodes a file, a blanket
  // re-download would silently replace that evidence with a new hash and no
  // trace that anything moved. Untouched items must stay untouched.
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  let done = 0, skipped = 0;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    if (!item.source.downloadUrl) {
      console.log(`- ${item.id}: no downloadUrl yet (resolve from proof page first) — SKIP`);
      skipped++;
      continue;
    }
    const ext = new URL(item.source.downloadUrl).pathname.split(".").pop() || "bin";
    const dest = join(CACHE, `${item.id}.${ext}`);
    console.log(`- ${item.id}: downloading ${item.source.downloadUrl}`);
    let buf;
    try {
      const res = await fetch(item.source.downloadUrl, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    } catch (e) {
      // Node fetch is flaky against some archive.org storage nodes; curl
      // (bundled with Windows 10+) handles the same redirects fine.
      console.log(`  fetch failed (${e.message}) — retrying via curl`);
      execFileSync("curl", ["-sL", "--fail", "--max-time", "600", item.source.downloadUrl, "-o", dest], { stdio: "inherit" });
      buf = readFileSync(dest);
    }
    writeFileSync(dest, buf);
    item.source.sha256 = sha256(buf);
    item.source.cachedFile = `${item.id}.${ext}`;
    saveManifest(m); // per item — see render()
    console.log(`  saved ${dest} (${(buf.length / 1e6).toFixed(1)} MB, sha256 ${item.source.sha256.slice(0, 12)}…)`);
    done++;
  }
  saveManifest(m);
  console.log(`download: ${done} fetched, ${skipped} skipped`);
}

/* ------------------------------------------------------------ snapshot */
async function snapshot(args = []) {
  const m = loadManifest();
  mkdirSync(LICENSES, { recursive: true });
  // --only pb7,b3 : restrict to named ids so unverified proof URLs (e.g. the
  // Musopen pages pending live verification) never get a snapshot stamp that
  // could masquerade as a checked license.
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  let done = 0, skipped = 0;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    const url = item.license.proofPageUrl;
    if (!url) {
      console.log(`- ${item.id}: no proofPageUrl — SKIP`);
      skipped++;
      continue;
    }
    console.log(`- ${item.id}: snapshotting ${url}`);
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`${item.id}: HTTP ${res.status} from ${url}`);
    const body = await res.text();
    const file = `${item.id}.html`;
    writeFileSync(join(LICENSES, file), `<!-- snapshot of ${url} at ${new Date().toISOString()} -->\n` + body);
    item.license.snapshotFile = file;
    item.license.confirmedAt = new Date().toISOString().slice(0, 10);
    done++;
  }
  saveManifest(m);
  console.log(`snapshot: ${done} saved, ${skipped} skipped — PM/engineer must still READ the license line in each snapshot (gatekeeping §A)`);
}

/* ------------------------------------------------------------- analyze */
function analyze(args) {
  const localIdx = args.indexOf("--local");
  const lenIdx = args.indexOf("--len");
  const clipSec = lenIdx >= 0 ? Number(args[lenIdx + 1]) : loadManifest().clipSeconds;
  if (localIdx >= 0) {
    const file = args[localIdx + 1];
    const s = suggestWindows(decodePcm(file), clipSec);
    console.log(`analyze --local ${file} (window ${clipSec}s):`);
    for (const w of s) console.log(`  suggest ${w.startSec}s → ${w.endSec}s  (score ${w.score}, onsets ${w.onsets})`);
    return;
  }
  const m = loadManifest();
  // --only: E7/S3, same reasoning as download's. Re-analysing every item
  // rewrites suggestions that an approved window was chosen against.
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    if (!item.source.cachedFile) {
      console.log(`- ${item.id}: not downloaded — SKIP`);
      continue;
    }
    const s = suggestWindows(decodePcm(join(CACHE, item.source.cachedFile)), m.clipSeconds);
    item.window.suggestions = s;
    console.log(`- ${item.id}: ${s.map((w) => `${w.startSec}s→${w.endSec}s (score ${w.score})`).join("  |  ")}`);
  }
  saveManifest(m);
  console.log("analyze: suggestions written — PM ear-confirms and sets window.approved = {startSec} per item");
}

/* -------------------------------------------------------------- render */
function tasl(item) {
  // TASL: Title, Author, Source, License — plus the excerpt notice (CC BY).
  const src = item.license.proofPageUrl || item.source.pageUrl || "";
  return `"${item.title}" — ${item.composerOrArtist}${item.performer && item.performer !== item.composerOrArtist ? `, perf. ${item.performer}` : ""} · ${src} · ${item.license.expected} · excerpt (trimmed + loudness-normalized)`;
}

/**
 * The encoder now lives in `renderclip.mjs` so Track N can render through it
 * without importing this CLI, which would run its argument dispatch (E17/S2).
 * This wrapper keeps the bias pool's output directory as the default.
 */
function renderOne(input, startSec, lenSec, outBase, lufs, outDir = AUDIO_OUT) {
  return renderClip(input, startSec, lenSec, outBase, lufs, outDir);
}

function render(args) {
  const localIdx = args.indexOf("--local");
  if (localIdx >= 0) {
    const file = args[localIdx + 1];
    const start = Number(args[args.indexOf("--start") + 1] || 0);
    const lenIdx = args.indexOf("--len");
    const len = lenIdx >= 0 ? Number(args[lenIdx + 1]) : 20;
    const outIdx = args.indexOf("--out");
    const out = outIdx >= 0 ? args[outIdx + 1] : "local-test";
    const r = renderOne(file, start, len, out, loadManifest().lufsTarget);
    console.log(`render --local: wrote public/audio/bias/${r.mp3} (${r.durationSec.toFixed(2)}s @ ${loadManifest().lufsTarget} LUFS)`);
    return;
  }
  const m = loadManifest();
  // --only: E7/S3. WITHOUT THIS, RENDERING ONE NEW CLIP RE-ENCODES ALL OF THEM.
  // The eleven shipped mp3s under public/audio/bias are the exact bytes the
  // live site serves and the exact bytes every past session measured. Silently
  // replacing them while adding an unrelated item is how a pool change becomes
  // an audio change nobody looked for.
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  for (const item of m.items) {
    if (only && !only.has(item.id)) continue;
    if (!item.source.cachedFile || !item.window.approved) {
      console.log(`- ${item.id}: needs cachedFile + PM-approved window — SKIP`);
      continue;
    }
    const r = renderOne(join(CACHE, item.source.cachedFile), item.window.approved.startSec, m.clipSeconds, item.id, m.lufsTarget);
    item.render = { ...r, renderedAt: new Date().toISOString().slice(0, 10), attribution: tasl(item) };
    // SAVED PER ITEM (E7/S4). This used to save once after the loop, so when
    // pb14 threw on the last iteration it took the five successful renders with
    // it — the files were on disk and the manifest denied they existed.
    saveManifest(m);
    console.log(`- ${item.id}: ${r.mp3} · attribution: ${item.render.attribution}`);
  }
  saveManifest(m);
  console.log("render: done — wire items.ts from manifest.render + bump BIAS_POOL_VERSION");
}

/* ---------------------------------------------------------------- main */
const [stage, ...args] = process.argv.slice(2);
try {
  if (stage === "download") await download(args);
  else if (stage === "snapshot") await snapshot(args);
  else if (stage === "analyze") analyze(args);
  else if (stage === "render") render(args);
  else if (stage === "degrade") await (await import("./degrade.mjs")).degrade(args);
  else if (stage === "validate") await (await import("./validate.mjs")).validate(args);
  else if (stage === "bias-validate") (await import("./biasvalidate.mjs")).biasValidate(args);
  else if (stage === "spread-download") await (await import("./spreadpool.mjs")).spreadDownload(args);
  else if (stage === "spread-analyze") (await import("./spreadpool.mjs")).spreadAnalyze(args);
  else if (stage === "spread-fit") (await import("./spreadpool.mjs")).spreadFit(args);
  else if (stage === "spread-render") (await import("./spreadpool.mjs")).spreadRender(args);
  else if (stage === "spread-validate") (await import("./spreadpool.mjs")).spreadValidate(args);
  else if (stage === "spread-bandwidth") (await import("./spreadbandwidth.mjs")).spreadBandwidth(args);
  else if (stage === "expand") await (await import("./expand.mjs")).expand(args);
  else if (stage === "ladder") await (await import("./ladder.mjs")).ladder(args);
  else if (stage === "sweep") await (await import("./sweep.mjs")).sweep(args);
  else if (stage === "curve") await (await import("./curve.mjs")).curve(args);
  else if (stage === "solve-check") await (await import("./solvecheck.mjs")).solveCheck(args);
  else if (stage === "render-plan") await (await import("./renderplan.mjs")).renderPlanCli(args);
  else if (stage === "staircase-render") await (await import("./staircaserender.mjs")).staircaseRenderCli(args);
  else if (stage === "timing-fidelity") await (await import("./timingfidelity.mjs")).timingFidelity(args);
  else if (stage === "staircase-validate") await (await import("./staircasevalidate.mjs")).staircaseValidate(args);
  else {
    console.log("usage: node scripts/clip-pipeline/index.mjs <download|snapshot|analyze|render|degrade|validate|ladder|sweep|expand> [--local <file>] [--start N] [--len N] [--out id]");
    console.log("       degrade: --id <pairId> --source <biasItemId> --start <sec> --family <pitch-drift|timing-smear|lossy-artifact> --magnitude <ladder rung 1-4; 2-4 ship> --seed <int> [--len <sec>]");
    console.log("       validate: Layer A spectral measurement of every shipped pair vs the transparency anchors [--json]");
    console.log("       ladder:   render 4 calibrated rungs per family from ONE source and prove the parameter drives the measure");
    console.log("       sweep:    measure the SHIPPED pool in each family's own physical unit (cents / ms / dB) [--family <name>] [--json]");
    console.log("       curve:    dense parameter sweep for ONE family from ONE window — the shape the ladder is spaced against");
    console.log("                 --family <name> [--values a,b,c] [--source pb1] [--start 75] [--len 20] [--json]");
    console.log("       solve-check: solve every lossy staircase level against a source's measured curve, RENDER at the");
    console.log("                 solved bitrate, and report how far the achieved dB missed — in ladder steps (E4/S1)");
    console.log("                 [--sources pb1,pb6,pb8] [--start 75] [--len 20] [--json]");
    console.log("       staircase-render: render + measure every staircase LEVEL of the pitch and timing ladders");
    console.log("                 for the per-source window plan, and fail if a measured ladder is not strictly");
    console.log("                 increasing (E4/S3). Lossy is per-source and is not rendered here.");
    console.log("                 [--sources a,b] [--only pb1@75,pb6@30] [--families ...] [--len 20] [--force] [--json]");
    console.log("       staircase-validate: Layer A over the staircase pool — is each clip FIT to put in front of a");
    console.log("                 listener (dead air, near-silence, clipping, the ruler's own floor)? Distinct from");
    console.log("                 staircase-render, which asks whether a clip IS the magnitude it claims (E4/S5).");
    console.log("                 [--no-anchors] [--json]");
    process.exit(2);
  }
} catch (e) {
  console.error(`clip-pipeline ${stage} FAILED:`, e.message);
  process.exit(1);
}
