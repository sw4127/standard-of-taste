/**
 * THE EVAL'S SCORER, PROVEN IN BOTH DIRECTIONS (2026-09-28, brief Part 5).
 *
 * A scorer that fails the product's own template lines is measuring its own
 * strictness, and one that passes a planted breach is measuring nothing. So the
 * templates must pass all four checks, and one planted line per check must fail
 * exactly that check. Also: no page or route imports the harness (BA-10).
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LISTENERS } from "@/content/reading/listeners";
import { readingFor } from "@/content/reading/reading";
import { briefFor, scoreLine, tally, voiceCounts, type DraftLine } from "./harness";

const templateLines = LISTENERS.flatMap((l) =>
  readingFor(l).lines.map((line) => ({
    listener: l.id,
    line: { fact: line.kind, pattern: line.pattern, receipt: line.receipt, offers: line.offers.map((o) => o.question) } as DraftLine,
  })),
);

describe("the control: the product's own template lines", () => {
  it("pass all four checks, every one of them", () => {
    expect(templateLines.length).toBeGreaterThanOrEqual(9);
    const t = tally(LISTENERS.map((l) => ({
      name: `templates-${l.id}`,
      draft: { listener: l.id, drafter: "templates", lines: templateLines.filter((x) => x.listener === l.id).map((x) => x.line) },
    })));
    expect(t.failures.map((f) => `${f.listener} ${f.line.fact} ${f.check}: ${f.why.join("; ")}`)).toEqual([]);
    expect(t.allFour).toBe(t.lines);
  });
});

describe("one planted breach per check fails that check and no other", () => {
  const l = LISTENERS[0];
  const facts = readingFor(l).facts;
  const good = templateLines.find((x) => x.listener === l.id)!.line;
  const failing = (line: DraftLine) =>
    Object.entries(scoreLine(line, facts)).filter(([, why]) => why.length > 0).map(([c]) => c);

  it("register: a pattern that names a feeling", () => {
    expect(failing({ ...good, pattern: `${good.pattern} It sounds lonely.` })).toEqual(["register"]);
  });
  it("register: an offer that is not a question", () => {
    expect(failing({ ...good, offers: [good.offers[0], "This is the hour you keep for yourself."] })).toEqual(["register"]);
  });
  it("register: three offers where the reading gives two", () => {
    // Added when deleting the two-offer rule survived the mutation run.
    expect(failing({ ...good, offers: [...good.offers, "Or something else entirely?"] })).toEqual(["register"]);
  });
  it("carve-out: an offer that reaches for grief", () => {
    expect(failing({ ...good, offers: [good.offers[0], "Is this how grief sounds for you?"] })).toEqual(["carveOut"]);
  });
  it("comparison: most listeners", () => {
    expect(failing({ ...good, pattern: `${good.pattern} More than most listeners do.` })).toEqual(["comparison"]);
  });
  it("arithmetic: an invented count", () => {
    expect(failing({ ...good, receipt: `${good.receipt} and 997 more` })).toEqual(["arithmetic"]);
  });
  it("arithmetic: a wrong decimal share, which splitting on the point once let through", () => {
    expect(failing({ ...good, receipt: `${good.receipt} (7.2%)` })).toEqual(["arithmetic"]);
  });
  it("arithmetic: a right decimal share passes", () => {
    const late = readingFor(LISTENERS[1]).facts.find((f) => f.kind === "lateNight")!;
    if (late.kind !== "lateNight") throw new Error("teo has no late-night fact");
    const share = ((100 * late.late) / late.total).toFixed(1);
    const line = { fact: "lateNight", pattern: `${late.late} of ${late.total} plays were late.`, receipt: `${late.late} of ${late.total} plays (${share}%)`, offers: ["A?", "B?"] };
    expect(Object.values(scoreLine(line, readingFor(LISTENERS[1]).facts)).flat()).toEqual([]);
  });
  it("arithmetic: a fact the reading does not have", () => {
    expect(failing({ ...good, fact: "moonPhase" })).toEqual(["arithmetic"]);
  });
});

describe("the holes the red-team subagent found in the first scorer stay closed", () => {
  const facts = (id: string) => readingFor(LISTENERS.find((l) => l.id === id)!).facts;
  const line = (fact: string, pattern: string, receipt: string): DraftLine => ({ fact, pattern, receipt, offers: ["A?", "B?"] });
  const failing = (id: string, l: DraftLine) =>
    Object.entries(scoreLine(l, facts(id))).filter(([, why]) => why.length > 0).map(([c]) => c);

  it("an assertion in the pattern fails, even when an offer later ends in a question mark", () => {
    expect(failing("lin", line("newShare", "You needed the familiar.", "45 of 251 plays"))).toEqual(["register"]);
  });
  it("a feeling word in the receipt is not judged, as the product does not judge it", () => {
    expect(failing("lin", line("repetition", "Three tracks took 108 of 251 plays.", "Fennow Letter alone had 47 of 251 (19%)"))).toEqual([]);
  });
  it("a count over the wrong base fails: week one's 43 over week four's 58", () => {
    expect(failing("lin", line("drift", "The wall of sound took 43 of 58 plays in week four.", "43 of 58 plays"))).toEqual(["arithmetic"]);
  });
  it("a share that belongs to another pair fails: 45 of 251 is not 82%", () => {
    expect(failing("lin", line("newShare", "45 of 251 plays (82%) were of new tracks.", "45 of 251"))).toEqual(["arithmetic"]);
  });
  it("a small wrong count fails even though 4 is a time number: the rising track had 1 play", () => {
    expect(failing("mira", line("newShare", "Sistrum Weather was played 4 times in week four.", "33 of 294 plays"))).toEqual(["arithmetic"]);
  });
  it("a time number beside its unit passes: 28 days, 30 seconds, 11 at night, 23:00-03:59", () => {
    expect(failing("teo", line("lateNight", "Over 28 days, 14 of 384 plays fell between 11 at night and 4 in the morning.", "14 of 384 plays (3.6%) between 23:00 and 03:59"))).toEqual([]);
  });
});

describe("what the checks cannot see, counted", () => {
  const item = (listener: string, offers: string[], pattern = "x") => ({ name: `${listener}-t`, listener, line: { fact: "f", pattern, receipt: "1", offers } });

  it("counts a line that says you, one that names the listener, and one that assumes a pronoun", () => {
    const v = voiceCounts([
      item("mira", ["Is this your hour?", "Or not?"]),
      item("mira", ["Did Mira keep this hour?", "Or not?"]),
      item("mira", ["Is it hers?", "Or not?"], "tracks new to her"),
    ]);
    expect([v.second, v.byName, v.gendered]).toEqual([1, 1, 1]);
    expect(v.genderedDrafts).toEqual(["mira-t"]);
  });

  it("does not count a word that only contains one: here, shed, youth, Miranda", () => {
    const v = voiceCounts([item("mira", ["Is it here, or in the shed?", "Youth, or Miranda?"])]);
    expect([v.second, v.byName, v.gendered]).toEqual([0, 0, 0]);
  });

  it("the control: the product's own lines never name the listener and never assume a pronoun", () => {
    // They say "you", or nobody: Teo's late-night offers are impersonal ("Is music part
    // of how the day gets done?"). Found by this control, which first asserted "all you".
    const v = voiceCounts(templateLines.map((x) => ({ name: `templates-${x.listener}`, ...x })));
    expect([v.byName, v.gendered]).toEqual([0, 0]);
    expect(v.second).toBeGreaterThanOrEqual(templateLines.length - 1);
  });
});

describe("the brief", () => {
  it("gives each listener's facts with their true counts, and the rules in prose, not the regexes", () => {
    for (const l of LISTENERS) {
      const b = briefFor(l);
      expect(b).toContain(`"${l.name}"`);
      for (const f of readingFor(l).facts) expect(b).toContain(`"kind": "${f.kind}"`);
      expect(b).not.toMatch(/FEELING_WORDS|\\b|RegExp/);
    }
  });
});

describe("nothing the eval writes can reach a page (BA-10)", () => {
  it("no file under src/ imports the harness", () => {
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
    // An import, not a mention: a comment naming the harness is not a path to a page.
    const importsIt = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'][^"']*eval-reading-lines/;
    const importers = walk("src").filter((f) => /\.(ts|tsx)$/.test(f) && importsIt.test(readFileSync(f, "utf8")));
    expect(importers).toEqual([]);
  });
});
