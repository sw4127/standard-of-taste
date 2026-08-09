/**
 * Pool expansion — 24 delicacy trials (PM rulings RT-7b, RT-24a, 2026-08-07).
 *
 *   node scripts/clip-pipeline/index.mjs expand [--plan] [--render]
 *
 * WHY 24 AND NOT 6. Three independent measurements said the six-trial pool is
 * too short for any of the psychometrics to work:
 *   - Cronbach's alpha 0.25, against a conventional floor of 0.70;
 *   - the §1 discrimination floor of 0.20 unreachable — 0 of 6 items can clear
 *     it, because a 2AFC guessing floor attenuates every item-total correlation;
 *   - 2PL parameters not identified — 3 of 6 items pin at the a = 4 bound.
 * Spearman-Brown puts alpha = 0.70 near 42 trials. 24 is the compromise the PM
 * ruled: it makes the instrument analysable without a session nobody finishes.
 * The write-up must not claim 24 reaches the conventional reliability floor —
 * it does not, and the honest figure is whatever the data says once fielded.
 *
 * THE DESIGN is a crossed factorial: 3 families x 4 ladder rungs, each cell
 * twice = 24. Every cell replicated on a DIFFERENT source recording, so a
 * family-by-rung effect can never be confounded with one piece of music. The
 * ladder rungs are the ones S6 verified monotone; nothing here invents a
 * strength that was not measured.
 *
 * WINDOW SELECTION IS MECHANICAL, not curated: fixed offsets spaced far enough
 * apart not to overlap, skipping any window that collides with the same
 * source's BIAS excerpt (cross-instrument familiarity would let a listener
 * recognise the material rather than hear the manipulation). Mechanical is the
 * point — the PM is out of the clip-judging loop by design, and a curated
 * window list would smuggle taste back in.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LADDER_RUNGS } from "./ladder.mjs";
import { renderPair } from "./degrade.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const PLAN = join(HERE, "expansion-plan.json");

/**
 * 18 trials: 3 families x 3 rungs x 2 replicates (PM ruling RT-25a, 2026-08-07).
 *
 * Rung 1 was dropped after Layer A measured it. It was added in S6 as a gentler
 * step and the ladder verified it was MONOTONE — but monotone is not the same as
 * SUFFICIENT, and all four rung-1 items measured 1.5-2.9x the transparency
 * anchor, under the 3x fair-trial floor. An item barely distinguishable from a
 * manipulation nobody can hear is not a trial, whatever its rung number says.
 * The rung still exists in the ladder as a measured, rejected data point; it
 * simply does not ship.
 */
export const TRIALS_TARGET = 18;
/** Ladder rungs that ship. Rung 1 is measured and rejected — see above. */
export const SHIPPING_RUNGS = [2, 3, 4];

/**
 * Sources excluded from a family because their transparency anchor is too high
 * for that family's measured magnitudes to clear the ratio floor.
 *
 * MEASURED, not guessed (2026-08-07): mean anchors run pb8 0.27 … pb3 0.73,
 * then pb5 1.30 and pb4 1.31 — the two dense orchestral/late-Chopin sources sit
 * at roughly 2.4x the pool median. Pitch-drift's own magnitudes span 1.2-3.9 dB,
 * so on those two sources it cannot reach 3x: d7 (rung 4, the STRONGEST rung)
 * measured the highest raw LSD of any pitch item and still failed at 2.8x.
 *
 * The exclusion covers BOTH ratio-gated families, not just pitch-drift. The
 * first 18-trial attempt excluded only pitch-drift and lossy rung 2 then failed
 * on pb5 at 2.0x — the same effect, a different family. timing-smear is gated
 * on measured drift rather than on a ratio, so anchors do not touch it and
 * those sources still carry timing items.
 *
 * THE COST, stated plainly: constraining two families to sparser material means
 * family effects are partly confounded with source density. That is a real
 * methodological price. It is paid because the alternative is shipping items
 * that are not fair trials, and because the confound is documented here rather
 * than discovered later in the data.
 */
export const FAMILY_SOURCE_EXCLUSIONS = {
  "pitch-drift": ["pb4", "pb5"],
  "lossy-artifact": ["pb4", "pb5"],
};
const CLIP_SEC = 20;
/** Windows start here and step by this much — no overlap, no edge effects. */
const FIRST_START = 20;
const WINDOW_STEP = 25;

/** Sources in the order they are drawn from, interleaved by artist. */
const SOURCE_ORDER = ["pb1", "pb3", "pb6", "pb4", "pb7", "pb2", "pb5", "pb8", "b1", "b2", "b3"];

const leadArtist = (item) => (item.composerOrArtist || "").trim();

/**
 * Build the render plan. Pure and deterministic: same manifest, same plan.
 */
export function buildPlan(durations) {
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const byId = new Map(bias.items.map((i) => [i.id, i]));

  // Candidate windows per source, minus anything overlapping its bias excerpt.
  const windows = new Map();
  for (const id of SOURCE_ORDER) {
    const item = byId.get(id);
    if (!item?.source?.cachedFile) continue;
    const dur = durations[id];
    if (!dur) continue;
    const biasStart = item.window?.approved?.startSec ?? null;
    const list = [];
    for (let t = FIRST_START; t + CLIP_SEC <= dur - 10; t += WINDOW_STEP) {
      if (biasStart !== null && Math.abs(t - biasStart) < CLIP_SEC + 5) continue;
      list.push(t);
    }
    windows.set(id, list);
  }

  // The 12 cells, each needing 2 replicates on different source recordings.
  const cells = [];
  for (const [family, spec] of Object.entries(LADDER_RUNGS)) {
    for (const rung of SHIPPING_RUNGS) {
      cells.push({ family, rung, param: spec.values[rung - 1] });
    }
  }

  const used = new Map(SOURCE_ORDER.map((id) => [id, 0]));
  const plan = [];
  let cursor = 0;

  for (let rep = 0; rep < 2; rep++) {
    for (const cell of cells) {
      // Walk the source ring until one has an unused window AND (on the second
      // replicate) a different lead artist from the first.
      let chosen = null;
      for (let attempt = 0; attempt < SOURCE_ORDER.length * 2; attempt++) {
        const id = SOURCE_ORDER[(cursor + attempt) % SOURCE_ORDER.length];
        const avail = windows.get(id) ?? [];
        if (used.get(id) >= avail.length) continue;
        if ((FAMILY_SOURCE_EXCLUSIONS[cell.family] ?? []).includes(id)) continue;
        if (rep === 1) {
          const first = plan.find((p) => p.family === cell.family && p.rung === cell.rung);
          if (first && leadArtist(byId.get(first.sourceId)) === leadArtist(byId.get(id))) continue;
        }
        chosen = id;
        cursor = (cursor + attempt + 1) % SOURCE_ORDER.length;
        break;
      }
      if (!chosen) throw new Error(`expand: ran out of windows for ${cell.family} rung ${cell.rung}`);

      const wIndex = used.get(chosen);
      used.set(chosen, wIndex + 1);
      const startSec = windows.get(chosen)[wIndex];
      const n = plan.length + 1;
      plan.push({
        id: `d${n}`,
        sourceId: chosen,
        artist: leadArtist(byId.get(chosen)),
        startSec,
        clipSec: CLIP_SEC,
        family: cell.family,
        rung: cell.rung,
        param: cell.param,
        // Deterministic, distinct per trial: same plan always renders the same audio.
        seed: 8000 + n * 7,
      });
    }
  }
  return plan;
}

/**
 * Order for presentation. Greedy: never place a trial adjacent to one sharing
 * its family or its lead artist, so neither the answer pattern nor the
 * sound-world becomes predictable partway through a session.
 */
export function orderForPresentation(plan) {
  const remaining = [...plan];
  const out = [];

  // MOST-CONSTRAINED-FIRST, not plain greedy. A naive scan takes the first
  // legal trial each time, which quietly hoards one family for the end and
  // then has no legal move left: the first attempt at 18 trials finished with
  // two lossy-artifact trials adjacent because nothing else remained. Drawing
  // from the family with the MOST items outstanding keeps every family
  // draining at the same rate, so the tail never becomes single-family.
  const countsLeft = () => {
    const m = new Map();
    for (const t of remaining) m.set(t.family, (m.get(t.family) ?? 0) + 1);
    return m;
  };

  while (remaining.length > 0) {
    const prev = out[out.length - 1];
    const left = countsLeft();
    const rank = (t) => left.get(t.family) * 10 + (prev && t.artist !== prev.artist ? 1 : 0);

    const legal = remaining.filter((t) => !prev || t.family !== prev.family);
    // Prefer a different artist too, but never at the cost of the family rule:
    // a repeated sound-world is milder than a predictable answer pattern.
    const pool = legal.length > 0 ? legal : remaining;
    const best = pool.reduce((a, b) => (rank(b) > rank(a) ? b : a));
    out.push(best);
    remaining.splice(remaining.indexOf(best), 1);
  }
  return out;
}

export async function expand(args) {
  const { execFileSync } = await import("node:child_process");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));

  const durations = {};
  for (const item of bias.items) {
    if (!item.source?.cachedFile) continue;
    const f = join(HERE, ".cache", item.source.cachedFile);
    durations[item.id] = Number(
      execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f])
        .toString()
        .trim(),
    );
  }

  const plan = orderForPresentation(buildPlan(durations)).map((t, i) => ({ ...t, id: `d${i + 1}` }));
  writeFileSync(PLAN, JSON.stringify({ trialsTarget: TRIALS_TARGET, clipSec: CLIP_SEC, plan }, null, 2) + "\n");

  console.log(`Expansion plan — ${plan.length} trials (3 families x ${SHIPPING_RUNGS.length} rungs x 2 replicates)`);
  console.log("  id    source  artist                start  family          rung  param");
  for (const t of plan) {
    console.log(
      `  ${t.id.padEnd(6)}${t.sourceId.padEnd(8)}${t.artist.slice(0, 20).padEnd(22)}${String(t.startSec).padStart(5)}s  ` +
        `${t.family.padEnd(16)}${String(t.rung).padEnd(6)}${t.param}`,
    );
  }

  // Contract checks on the plan itself, before a single second of audio renders.
  const errs = [];
  const count = (key) => {
    const m = new Map();
    for (const t of plan) m.set(t[key], (m.get(t[key]) ?? 0) + 1);
    return m;
  };
  if (plan.length !== TRIALS_TARGET) errs.push(`expected ${TRIALS_TARGET} trials, got ${plan.length}`);
  const perFamily = TRIALS_TARGET / 3;
  const perRung = TRIALS_TARGET / SHIPPING_RUNGS.length;
  for (const [f, n] of count("family")) if (n !== perFamily) errs.push(`family ${f} appears ${n}x (want ${perFamily})`);
  for (const [r, n] of count("rung")) if (n !== perRung) errs.push(`rung ${r} appears ${n}x (want ${perRung})`);
  for (const t of plan) {
    if ((FAMILY_SOURCE_EXCLUSIONS[t.family] ?? []).includes(t.sourceId))
      errs.push(`${t.id}: ${t.family} on excluded source ${t.sourceId}`);
  }
  const cellKeys = new Map();
  for (const t of plan) {
    const k = `${t.family}/${t.rung}`;
    cellKeys.set(k, (cellKeys.get(k) ?? 0) + 1);
  }
  for (const [k, n] of cellKeys) if (n !== 2) errs.push(`cell ${k} appears ${n}x (want 2)`);
  for (const [k] of cellKeys) {
    const reps = plan.filter((t) => `${t.family}/${t.rung}` === k);
    if (reps[0].artist === reps[1].artist) errs.push(`cell ${k} replicated on the SAME artist (${reps[0].artist})`);
  }
  const windowKeys = plan.map((t) => `${t.sourceId}@${t.startSec}`);
  if (new Set(windowKeys).size !== windowKeys.length) errs.push("duplicate source windows in the plan");
  let adjFamily = 0;
  let adjArtist = 0;
  for (let i = 1; i < plan.length; i++) {
    if (plan[i].family === plan[i - 1].family) adjFamily++;
    if (plan[i].artist === plan[i - 1].artist) adjArtist++;
  }
  if (adjFamily > 0) errs.push(`${adjFamily} adjacent same-family pairs`);

  console.log(
    `\n  distinct sources ${new Set(plan.map((t) => t.sourceId)).size} · distinct artists ` +
      `${new Set(plan.map((t) => t.artist)).size} · adjacent same-artist ${adjArtist} · adjacent same-family ${adjFamily}`,
  );
  if (errs.length > 0) {
    for (const e of errs) console.error(`  PLAN ERROR: ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log(`  plan contract: OK · written to scripts/clip-pipeline/expansion-plan.json`);

  if (!args.includes("--render")) {
    console.log(`  (dry run — pass --render to render the audio)`);
    return;
  }

  // Rendering goes through renderPair, the SAME function the single-pair CLI
  // uses. A separate path here would mean the expanded pool was produced by
  // code nobody had verified.
  console.log(`
Rendering ${plan.length} pairs — same path as \`clip-pipeline degrade\``);
  let failed = 0;
  for (const t of plan) {
    const ok = await renderPair({
      id: t.id,
      sourceId: t.sourceId,
      startSec: t.startSec,
      clipSec: t.clipSec,
      family: t.family,
      magnitude: t.rung,
      param: t.param,
      seed: t.seed,
      quiet: true,
    });
    if (!ok) failed++;
  }
  // Anything the previous plan left behind must go: a stale manifest entry or
  // an orphaned audio file is an answer key pointing at audio nobody planned.
  const { existsSync, rmSync } = await import("node:fs");
  const DELICACY_MANIFEST = join(ROOT, "src", "content", "delicacy", "manifest.json");
  const planned = new Set(plan.map((t) => t.id));
  const man = JSON.parse(readFileSync(DELICACY_MANIFEST, "utf8"));
  const orphans = man.pairs.filter((p) => !planned.has(p.id));
  if (orphans.length > 0) {
    man.pairs = man.pairs.filter((p) => planned.has(p.id));
    writeFileSync(DELICACY_MANIFEST, JSON.stringify(man, null, 2) + "\n");
    for (const o of orphans) {
      for (const side of ["a", "b"]) {
        for (const ext of ["mp3", "m4a"]) {
          const f = join(ROOT, "public", "audio", "delicacy", `${o.id}-${side}.${ext}`);
          if (existsSync(f)) rmSync(f, { force: true });
        }
      }
    }
    console.log(`  pruned ${orphans.length} orphaned pair(s) from the previous plan: ${orphans.map((o) => o.id).join(", ")}`);
  }

  console.log(`
rendered ${plan.length - failed}/${plan.length} pairs`);
  if (failed > 0) {
    console.error(`expand: ${failed} pair(s) failed render validation`);
    process.exitCode = 1;
  } else {
    console.log(`  next: node scripts/clip-pipeline/index.mjs validate   (Layer A magnitudes)`);
  }
}
