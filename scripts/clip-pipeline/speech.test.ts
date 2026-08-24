import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
// Pipeline modules are plain .mjs; the checker resolves them via allowJs.
import { speechRisk, SPEECH_RISK_GATE, windowStartVerdict, MIN_START_SEC_WITH_SPOKEN_INTRO } from "./speech.mjs";

/**
 * E7/S3 — THE CALIBRATION, AND THE BLIND SPOT IT REFUSES TO HIDE.
 *
 * This file exists because the first version of the gate did not work and would
 * have shipped a threshold anyway. Calibrating it caught that: pure speech
 * scored 0.179 against music at 0.243 — the classes were INVERTED, and the
 * threshold already written into the module would have passed a recording of
 * someone reading a book aloud.
 *
 * So the rule here is that the gate is not allowed to be believed. Every claim
 * is measured against real audio on every run, and the last test asserts the
 * blind spot still EXISTS — because the day somebody "improves" the feature and
 * that test starts failing, they have either solved a hard problem or broken
 * the calibration, and both deserve a human looking.
 */
const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const SPEECH = join(__dirname, "fixtures", "speech-pd-60s.mp3");
const SR = 22050;
const POOL = ["pb1", "pb2", "pb3", "pb4", "pb5", "pb6", "pb7", "pb8", "b1", "b2", "b3"];
const poolFile = (id: string) => join(process.cwd(), "public", "audio", "bias", `${id}.mp3`);

function pcm(args: string[]): Float32Array {
  const out = execFileSync(FFMPEG, [...args, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-v", "error", "pipe:1"], {
    maxBuffer: 1 << 28,
  });
  const n = Math.floor(out.length / 2);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = out.readInt16LE(i * 2) / 32768;
  return s;
}
const cut = (f: string, st: number, len = 20) => pcm(["-ss", String(st), "-t", String(len), "-i", f]);

/**
 * Speech over music at `db` relative to the music. BOTH SIDES ARE AT POOL
 * LOUDNESS, which is the entire reason the fixture is normalised: the first
 * version of this harness mixed a -27.8 LUFS speech file into -16 LUFS clips
 * and labelled the result "0 dB". Every number it produced was a voice twelve
 * decibels quieter than the label claimed, and it made the detector look blind
 * on the one clip it most needed to work on.
 */
function over(musicFile: string, db: number, dur = 20, delaySec = 0): Float32Array {
  const g = Math.pow(10, db / 20);
  return pcm([
    "-t", "20", "-i", musicFile,
    "-ss", "5", "-t", String(dur), "-i", SPEECH,
    "-filter_complex",
    `[1:a]volume=${g},adelay=${delaySec * 1000}:all=1[v];[0:a][v]amix=inputs=2:duration=first:normalize=0[a]`,
    "-map", "[a]",
  ]);
}

const risk = (x: Float32Array) => speechRisk(x, SR) as number;

describe("E7/S3 — gate 1: an excerpt that is largely someone talking", () => {
  it("the fixture is present, or nothing below means anything", () => {
    expect(existsSync(SPEECH), "PD speech fixture missing — the calibration cannot run").toBe(true);
  });

  it("separates pure speech from every clip in the shipped pool", () => {
    const speech = [0, 8, 16, 24, 32, 40].map((t) => risk(cut(SPEECH, t)));
    const music = POOL.map((id) => ({ id, v: risk(cut(poolFile(id), 0)) }));
    const worstSpeech = Math.min(...speech);
    const loudest = music.reduce((a, b) => (b.v > a.v ? b : a));
    const report = [
      `speech (6 cuts): ${speech.map((v) => v.toFixed(3)).join(" ")}  -> min ${worstSpeech.toFixed(3)}`,
      `music (${POOL.length} shipped): max ${loudest.v.toFixed(3)} (${loudest.id})`,
      `gate ${SPEECH_RISK_GATE}: ${((SPEECH_RISK_GATE / loudest.v - 1) * 100).toFixed(0)}% above the loudest clean clip, ` +
        `${((1 - SPEECH_RISK_GATE / worstSpeech) * 100).toFixed(0)}% below the quietest speech`,
    ].join("\n");
    expect(worstSpeech, `no separation at all:\n${report}`).toBeGreaterThan(loudest.v);
    expect(worstSpeech, `speech falls below the gate:\n${report}`).toBeGreaterThan(SPEECH_RISK_GATE);
    expect(loudest.v, `a shipped clip trips the gate:\n${report}`).toBeLessThan(SPEECH_RISK_GATE);
  });

  it("catches a voice running the whole length of the clip", () => {
    const rows: string[] = [];
    for (const id of ["pb2", "pb4", "pb5", "pb7"]) {
      const clean = risk(cut(poolFile(id), 0));
      const at0 = risk(over(poolFile(id), 0));
      rows.push(`${id}: clean ${clean.toFixed(3)} -> voice at 0 dB ${at0.toFixed(3)} (${(at0 / clean).toFixed(2)}x)`);
      expect(
        at0,
        `a full-length voice over ${id} barely moved the figure:\n${rows.join("\n")}`,
      ).toBeGreaterThan(clean * 1.4);
    }
  });
});

describe("E7/S3 — gate 2: windows may not start in a track's spoken head", () => {
  const MUSOPEN = "https://archive.org/download/MusopenCollectionAsFlac/x.mp3";

  it("classifies the one case a human actually labelled", () => {
    // pb4, 2026-07-12: the PM vetoed the 30s cut for an audible announcer and
    // the clip was re-windowed to 120s. This is why the gate is positional
    // rather than acoustic — the detector ranks that same window FOURTH by
    // within-track anomaly, below three windows containing no speech at all.
    expect(windowStartVerdict(MUSOPEN, 30).pass, "the vetoed window passed").toBe(false);
    expect(windowStartVerdict(MUSOPEN, 120).pass, "the shipped window failed").toBe(true);
  });

  it("is scoped to the collection where spoken intros are documented", () => {
    // Applying it to modern CC releases would be superstition, not a gate:
    // pb6 ships from 0s, pb7 from 4s, b3 from 7s, none with an announcement.
    expect(windowStartVerdict("https://archive.org/download/Komiku-TaleOnTheLate/x.mp3", 4).gated).toBe(false);
    expect(windowStartVerdict("https://audionautix.com/Music/x.mp3", 9).gated).toBe(false);
    expect(windowStartVerdict(MUSOPEN, 120).gated).toBe(true);
  });

  it("states its floor rather than hiding it inside a comparison", () => {
    expect(MIN_START_SEC_WITH_SPOKEN_INTRO).toBe(60);
  });
});

describe("E7/S3 — the blind spot, asserted so it cannot be quietly assumed away", () => {
  it("a short announcement over busy music is NOT caught", () => {
    const pb8Clean = risk(cut(poolFile("pb8"), 0));
    const pb8Credits = risk(over(poolFile("pb8"), 0, 5, 0));
    const report = `pb8 clean ${pb8Clean.toFixed(3)} -> with 5s of credits ${pb8Credits.toFixed(3)}`;
    expect(
      pb8Credits,
      `the blind spot closed — the feature changed and every threshold must be re-derived:\n${report}`,
    ).toBeLessThan(SPEECH_RISK_GATE);

    writeFileSync(
      join(process.cwd(), "docs", "analytics", "e7-speech-gate.txt"),
      [
        "E7/S3 SPOKEN-VOICE HAZARD — OPERATING CHARACTERISTIC [real audio, not simulated]",
        "The automated stand-in for the PM ear-veto retired by artifact-pivot section 1.",
        "",
        `GATE 1  speechRisk > ${SPEECH_RISK_GATE}  (zero-crossing-rate coefficient of variation)`,
        "  CATCHES an excerpt that is largely someone talking.",
        "  CATCHES a voice running the full clip length at 0 dB (1.9x-3.3x on four hosts).",
        `  MISSES  a short announcement over busy music. ${report}.`,
        "          Clean pb11 (Brahms, Tragic Overture) measures 0.709 — ABOVE that mixture.",
        "          The classes overlap; no threshold on this feature separates them.",
        "",
        `GATE 2  windows from MusopenCollectionAsFlac must start at or after ${MIN_START_SEC_WITH_SPOKEN_INTRO}s`,
        "  Deterministic, no classifier. Correctly classifies the one labelled case there is:",
        "  pb4 at 30s (PM veto, announcer audible) FAILS; pb4 at 120s (shipped) PASSES.",
        "",
        "FIVE FEATURES THAT DID NOT WORK, recorded so nobody pays for them twice:",
        "  syllabic modulation share, broadband        speech 0.179 vs music 0.243   INVERTED",
        "  syllabic modulation share, 300-3400 Hz      speech 0.170 vs music 0.226   INVERTED",
        "  per-band syllabic share (Scheirer-Slaney)   speech 0.203 vs music 0.248   INVERTED",
        "  low-energy frame fraction, broadband        1.20x                          overlapping",
        "  low-energy frame fraction, voice band       1.01x                          overlapping",
        "  within-track anomaly ranking                pb4's vetoed window ranks 4th of 24",
        "",
        "Regenerated by scripts/clip-pipeline/speech.test.ts on every test run.",
      ].join("\n"),
    );
  });
});
