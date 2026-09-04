/**
 * TRACK N / S1 proof. PRE-REGISTERED, written before the pool was authored:
 *
 *   (a) THE PAIR STRUCTURE IS COMPUTED FROM THE RANK TABLE, never asserted.
 *       The pool must yield at least MIN_PAIRS_PER_KIND critic-far and
 *       MIN_PAIRS_PER_KIND critic-close pairs. This is the pre-registered
 *       sourcing criterion, and it now lives in the build rather than in a
 *       session's prose, so a later pool edit that quietly breaks it stops.
 *   (b) NO ITEM CARRIES A LICENCE THIS PROJECT MAY NOT USE. Public domain, CC0
 *       or CC-BY only, and — the part that actually caught something — no
 *       territorial qualifier. A candidate read as "Creative Commons Zero"
 *       and was in fact "Creative Commons Zero 1.0 - Non-PD US".
 *   (c) AGREEMENT WITH THE CRITIC IS UNCOMPUTABLE from what ranking.ts exports.
 *   (d) EVERY LICENCE SNAPSHOT EXISTS AND CONTAINS THE LINE IT PROVES.
 *   (e) THE TWO TABLES AGREE — manifest.json and ranking.ts describe one pool.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CLOSE_POSITIONS,
  FAR_POSITIONS,
  MIN_PAIRS_PER_KIND,
  SPREAD_POOL,
  TANNER_RANKING,
  closePairs,
  farPairs,
  spreadPairs,
  type SpreadItem,
} from "./ranking";

const DIR = "src/content/spread";
const manifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8"));

/**
 * The licence values this project may build on, as EXACT strings.
 *
 * An allowlist of exact values rather than a blocklist of bad substrings,
 * because the failure that nearly shipped was a GOOD prefix with a bad suffix.
 * A blocklist has to anticipate the qualifier; an allowlist only has to
 * recognise the clean value, and anything decorated is no longer that value.
 */
const ALLOWED = new Set(["PD-dedicated", "PD-mark", "CC0-1.0", "CC-BY-3.0", "CC-BY-4.0"]);

/** Substrings that disqualify a licence no matter what precedes them. */
const DISQUALIFYING = [
  "Non-PD",
  "NonCommercial",
  "Non-commercial",
  "NoDeriv",
  "No Derivatives",
  "ShareAlike",
  "Share Alike",
];

describe("(a) the pool's pair structure, computed from the rank table", () => {
  it("yields at least the pre-registered floor of critic-far pairs", () => {
    expect(farPairs().length).toBeGreaterThanOrEqual(MIN_PAIRS_PER_KIND);
  });

  it("yields at least the pre-registered floor of critic-close pairs", () => {
    expect(closePairs().length).toBeGreaterThanOrEqual(MIN_PAIRS_PER_KIND);
  });

  it("computes the floor from the pool rather than restating it", () => {
    // Proven by mutation: a pool sliced below the floor must fail, or the
    // guard above is asserting a constant it happens to agree with.
    const tooFew: SpreadItem[] = SPREAD_POOL.slice(0, 3);
    const failed =
      farPairs(tooFew).length < MIN_PAIRS_PER_KIND ||
      closePairs(tooFew).length < MIN_PAIRS_PER_KIND;
    expect(failed).toBe(true);
  });

  it("classifies every usable pair as exactly one of far or close", () => {
    for (const p of spreadPairs()) {
      const far = p.distance >= FAR_POSITIONS;
      const close = p.distance <= CLOSE_POSITIONS;
      expect(far !== close).toBe(true);
      expect(p.kind).toBe(far ? "far" : "close");
    }
  });

  it("drops middling gaps rather than folding them into either side", () => {
    const kept = new Set(spreadPairs().map((p) => `${p.a.id}|${p.b.id}`));
    let middling = 0;
    for (let i = 0; i < SPREAD_POOL.length; i += 1) {
      for (let j = i + 1; j < SPREAD_POOL.length; j += 1) {
        const d = Math.abs(SPREAD_POOL[i].position - SPREAD_POOL[j].position);
        if (d > CLOSE_POSITIONS && d < FAR_POSITIONS) {
          middling += 1;
          expect(kept.has(`${SPREAD_POOL[i].id}|${SPREAD_POOL[j].id}`)).toBe(false);
        }
      }
    }
    // Assert the scan FOUND something before asserting anything about it.
    expect(middling).toBeGreaterThan(0);
  });

  it("does not align the scoring-forces confound with the far/close split", () => {
    // A solo piano and an orchestra differ audibly for reasons no ranking
    // caused. That is tolerable while cross-forces pairs fall on BOTH sides;
    // it is fatal if every far pair is cross-forces and every close pair is
    // not, because then the statistic is just instrumentation.
    const cross = (ps: ReturnType<typeof spreadPairs>) =>
      ps.filter((p) => p.a.forces !== p.b.forces).length;
    const far = farPairs();
    const close = closePairs();
    expect(cross(far)).toBeGreaterThan(0);
    expect(cross(far)).toBeLessThan(far.length);
    expect(cross(close)).toBeGreaterThan(0);
    expect(cross(close)).toBeLessThan(close.length);
  });
});

describe("(b) no item carries a licence this project may not use", () => {
  it("every manifest licence is an exact allowed value", () => {
    expect(manifest.items.length).toBeGreaterThan(0);
    for (const item of manifest.items) {
      expect(ALLOWED.has(item.license.expected)).toBe(true);
    }
  });

  it("no licence line read off the page carries a disqualifying qualifier", () => {
    for (const item of manifest.items) {
      for (const bad of DISQUALIFYING) {
        expect(item.license.readLine.includes(bad)).toBe(false);
      }
    }
  });

  it("rejects a good value decorated with a territorial qualifier", () => {
    // The mutation that matters: this exact string passed a substring check
    // during sourcing and is the reason the allowlist is exact.
    const decorated = "Creative Commons Zero 1.0 - Non-PD US";
    expect(ALLOWED.has(decorated)).toBe(false);
    expect(DISQUALIFYING.some((bad) => decorated.includes(bad))).toBe(true);
  });
});

describe("(c) agreement with the critic is uncomputable", () => {
  it("exposes distance between positions and never a direction", () => {
    for (const p of spreadPairs()) {
      expect(p.distance).toBe(Math.abs(p.a.position - p.b.position));
      expect(p.distance).toBeGreaterThan(0);
      expect(Object.keys(p).sort()).toEqual(["a", "b", "distance", "kind"]);
    }
  });

  it("carries no field ordering one work above another", () => {
    const banned = /better|worse|superior|greater|higher|lower|rank(ed)?Above|beats/i;
    for (const item of SPREAD_POOL) {
      for (const key of Object.keys(item)) expect(banned.test(key)).toBe(false);
    }
    // `position` is the only ranking-derived field, and the file never says
    // which end of the countdown is the top.
    const src = readFileSync(`${DIR}/ranking.ts`, "utf8");
    expect(/const\s+\w*(BEST|TOP|GREATEST)\w*\s*=/.test(src)).toBe(false);
  });
});

describe("(d) every licence snapshot exists and contains the line it proves", () => {
  it("captures a proof page per item", () => {
    for (const item of manifest.items) {
      const path = `${DIR}/licenses/${item.license.snapshotFile}`;
      expect(existsSync(path)).toBe(true);
      const html = readFileSync(path, "utf8");
      expect(html.length).toBeGreaterThan(1000);
      expect(html.includes(item.license.readLine)).toBe(true);
    }
  });

  it("finds every proof token inside the page that licenses the item", () => {
    // These replaced a derived-surname check that degenerated to the word
    // "Orchestra" for two ensemble items — a guard weaker than its name,
    // asserting only that a megabyte of HTML contains a common noun.
    for (const item of manifest.items) {
      const html = readFileSync(`${DIR}/licenses/${item.license.snapshotFile}`, "utf8");
      expect(item.license.proofTokens.length).toBeGreaterThan(1);
      for (const token of item.license.proofTokens) {
        expect(html.includes(token)).toBe(true);
      }
    }
  });

  it("uses proof tokens that identify the recording rather than generic words", () => {
    // The failure being guarded against is a token so common that its presence
    // proves nothing about WHICH page was captured.
    const generic = new Set([
      "orchestra",
      "piano",
      "beethoven",
      "symphony",
      "sonata",
      "concerto",
      "public domain",
      "creative commons",
      "music",
      "audio",
    ]);
    for (const item of manifest.items) {
      for (const token of item.license.proofTokens) {
        expect(generic.has(token.toLowerCase())).toBe(false);
        expect(token.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("distinguishes the six pages from one another", () => {
    // A token set that matched every snapshot would pass the check above and
    // still prove nothing. Each item's tokens must fail on some other page.
    const pages = new Map<string, string>();
    for (const item of manifest.items) {
      pages.set(item.id, readFileSync(`${DIR}/licenses/${item.license.snapshotFile}`, "utf8"));
    }
    for (const item of manifest.items) {
      const others = [...pages.entries()].filter(([id]) => id !== item.id);
      const matchesAll = others.filter(([, html]) =>
        item.license.proofTokens.every((t: string) => html.includes(t)),
      );
      expect(matchesAll).toEqual([]);
    }
  });
});

describe("(f) every download URL points at audio", () => {
  it("records what the URL actually returned, with audio magic bytes", () => {
    // Five of these six were audio and one was a JavaScript redirect page.
    // Nothing would have surfaced that until the render step failed.
    const MAGIC = new Set(["ID3", "fLaC", "ftyp", "OggS"]);
    for (const item of manifest.items) {
      const f = item.source.fetched;
      expect(f.contentType.startsWith("audio/")).toBe(true);
      expect(MAGIC.has(f.magic)).toBe(true);
      expect(f.bytes).toBeGreaterThan(1_000_000);
    }
  });

  it("gives every download URL a media file extension", () => {
    // The shape check that would have caught the redirect page on its own.
    for (const item of manifest.items) {
      const url: string = item.source.downloadUrl;
      expect(/\.(mp3|flac|m4a|ogg|wav)$/i.test(url)).toBe(true);
    }
  });

  it("rejects the redirect page that was recorded here first", () => {
    const wasWrong = "https://imslp.org/wiki/Special:ImagefromIndex/851326";
    expect(/\.(mp3|flac|m4a|ogg|wav)$/i.test(wasWrong)).toBe(false);
    expect(manifest.items.some((i: { source: { downloadUrl: string } }) =>
      i.source.downloadUrl === wasWrong)).toBe(false);
  });
});

describe("(e) the two tables agree", () => {
  it("manifest and pool describe the same items, in the same order", () => {
    expect(manifest.items.map((i: { id: string }) => i.id)).toEqual(
      SPREAD_POOL.map((i) => i.id),
    );
    for (const [n, item] of manifest.items.entries()) {
      expect(item.position).toBe(SPREAD_POOL[n].position);
      expect(item.work).toBe(SPREAD_POOL[n].work);
      expect(item.forces).toBe(SPREAD_POOL[n].forces);
    }
  });

  it("every pooled work sits at its published position in the ranking", () => {
    for (const item of SPREAD_POOL) {
      const entry = TANNER_RANKING.find((w) => w.position === item.position);
      expect(entry).toBeDefined();
      expect(entry?.work).toBe(item.work);
    }
  });

  it("the ranking is a complete run of positions with no repeats", () => {
    const positions = TANNER_RANKING.map((w) => w.position);
    expect(new Set(positions).size).toBe(positions.length);
    expect(Math.min(...positions)).toBe(1);
    expect(positions).toEqual(
      Array.from({ length: TANNER_RANKING.length }, (_, n) => n + 1),
    );
  });

  it("pools each work once", () => {
    const ids = SPREAD_POOL.map((i) => i.id);
    const positions = SPREAD_POOL.map((i) => i.position);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
