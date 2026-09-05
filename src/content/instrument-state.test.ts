import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DELICACY_LIVE } from "./delicacy/items";
import { LEARN_PAGES, learnPage } from "./learn";
import {
  landingLead,
  landingHint,
  countWord,
  countWordCapitalised,
  SECONDARY_DOORS,
} from "./landing";
import { MACHINES } from "@/components/OtherMachines";

/**
 * E11/S2 (Track B) — THE COPY MUST AGREE WITH THE FLAG, IN BOTH DIRECTIONS.
 *
 * The Delicacy Trials opened on 2026-08-08. For twenty days after that, three
 * strings in the reading room went on calling them locked, unopened or
 * forthcoming, and the front door went on saying "Two machines" over three
 * cards. Every one of them was true when it was written, and nothing tied it to
 * the thing that stopped it being true (N3).
 *
 * WHY THIS DOES NOT SWEEP SOURCE TEXT FOR THE WORD "LOCKED". Two blocks say it
 * and are not defects: the front door's `MACHINE 02` card and the bias
 * debrief's `NEXT MACHINE` door both sit inside `!DELICACY_LIVE` and are the D3
 * visible-and-locked design, correct in the state they render in. A text sweep
 * cannot tell them from the four that were wrong, and the repair it would push
 * you toward — delete every mention — would destroy the door.
 *
 * So the assertion is the biconditional: locked-state language appears IF AND
 * ONLY IF the instrument is not live. That is checkable today in the state that
 * ships, checkable in the other state the moment the flag moves, and cannot be
 * satisfied by deleting the copy.
 */

const NEWLINE = String.fromCharCode(10);

/** Anything that is not a letter, for splitting prose into words. */
const NOT_LETTERS = new RegExp("[^a-z]+");

/** Language that asserts an instrument is shut, or not yet built. */
const LOCKED_STATE: [RegExp, string][] = [
  [/\block(ed|s)?\b/i, "calls it locked"],
  [/\bopens?\s+when\b/i, "conditions its opening on something"],
  [/\bwhen\s+do\b[^?]*\bopen\b/i, "asks when it opens"],
  [/\bwill\s+the\b[^?]*\bwork\b/i, "future tense about how it works"],
  [/\bbefore\s+(they|it)\s+open\b/i, "places it before its own opening"],
  [/\b(coming|in the gym)\s+soon\b/i, "promises it later"],
  [/\bnot\s+yet\s+(open|live|built)\b/i, "says it is not yet open"],
];

function lockedHits(text: string): string[] {
  return LOCKED_STATE.filter(([re]) => re.test(text)).map(([, why]) => why);
}

/** Every string the delicacy entry publishes — page copy AND FAQPage JSON-LD. */
function delicacyStrings(): { where: string; text: string }[] {
  const p = LEARN_PAGES.find((x) => x.slug === "delicacy")!;
  const out = [
    { where: "title", text: p.title },
    { where: "metaTitle", text: p.metaTitle },
    { where: "description", text: p.description },
    { where: "teaser", text: p.teaser },
  ];
  p.faq.forEach((f, i) => {
    out.push({ where: `faq[${i}].q`, text: f.q });
    out.push({ where: `faq[${i}].a`, text: f.a });
  });
  return out;
}

describe("the reading room describes the instrument that actually shipped", () => {
  /**
   * THE FIRST DRAFT OF THIS ASSERTED A BICONDITIONAL OVER EVERY STRING, and
   * proving it caught it: with the flag flipped it demanded that the page
   * TITLE — "Delicacy of taste" — announce the machine was shut. The needle
   * described something the name overstated, which is the failure this
   * repository has now shipped six times.
   *
   * The two directions are not symmetric, so they are written as two rules:
   * while the machine is open NOTHING may call it shut, and while it is shut
   * the INDEX CARD must say so, because that card is the only sentence a
   * person sees before deciding whether to walk over to it.
   */
  it("while the machine is open, nothing in the reading room calls it shut", () => {
    if (!DELICACY_LIVE) return;
    const offenders = delicacyStrings()
      .map((s) => ({ ...s, why: lockedHits(s.text) }))
      .filter((s) => s.why.length > 0)
      .map((o) => `${o.where}: ${o.why.join(", ")} — ${o.text.slice(0, 90)}`);
    expect(
      offenders,
      "DELICACY_LIVE is true, so these strings describe a machine that is not this one:" + NEWLINE,
    ).toEqual([]);
  });

  it("while the machine is shut, the index card says so", () => {
    if (DELICACY_LIVE) return;
    const teaser = LEARN_PAGES.find((x) => x.slug === "delicacy")!.teaser;
    expect(
      lockedHits(teaser).length,
      "DELICACY_LIVE is false and the /learn index still advertises the machine as available: " +
        teaser,
    ).toBeGreaterThan(0);
  });

  /**
   * The other six explainers must not pick the habit up. Scoped by slug rather
   * than by sweeping every page, because `practice` and `methodology` are
   * entitled to discuss gating in the abstract.
   */
  it("no other explainer's teaser claims a machine is shut", () => {
    const offenders = LEARN_PAGES.filter((p) => p.slug !== "delicacy")
      .filter((p) => lockedHits(p.teaser).length > 0)
      .map((p) => `${p.slug}: ${p.teaser}`);
    expect(offenders).toEqual([]);
  });
});

describe("the front door counts the machines it is rendering", () => {
  it("names the count as a word, from the number it is given", () => {
    expect(landingLead(3)).toContain("Three machines");
    expect(landingLead(2)).toContain("Two machines");
    expect(landingLead(4)).toContain("Four machines");
    expect(countWord(3)).toBe("three");
  });

  it("agrees with the machine registry", () => {
    const live = MACHINES.filter((m) => m.live).length;
    expect(landingLead(live)).toContain(countWordCapitalised(live) + " machines");
  });

  /**
   * COUNTING WITHOUT A NUMBER (E11/S2).
   *
   * The hint line under the cards said "pick either" while three cards were on
   * screen. Every sweep this slice ran looked for a numeral or a number-word
   * and none of them could see it, because "either" counts to two without
   * saying two. It was found by reading the rendered page.
   *
   * So the rule for that line is that it must not count AT ALL — a sentence
   * with no arity cannot disagree with the list above it, whatever ships next.
   */
  it("the hint line under the cards does not count the machines", () => {
    /*
     * WORD MEMBERSHIP, NOT WORD-BOUNDARY REGEXES. Two attempts to script a
     * word-boundary escape into this file wrote a literal BACKSPACE byte
     * instead, which renders as nothing and turns the pattern into a bare
     * /two/i that also matches "between". `voice.ts` gave the same escape up
     * for the same reason. Splitting into words needs no escape at all and
     * cannot half-work.
     */
    const COUNTING = new Set(["either", "both", "two", "three", "four", "pair"]);
    const words = landingHint()
      .toLowerCase()
      .split(NOT_LETTERS)
      .filter(Boolean);
    const hits = words.filter((w) => COUNTING.has(w));
    expect(hits, `this line counts, and so it can go stale: ${landingHint()}`).toEqual([]);
  });

  /**
   * A TRIPWIRE, AND IT SAYS SO. The lead's three clauses are written prose, one
   * per machine, and no test can tell that a fourth machine's clause is
   * missing. What it can tell is that the count moved — so this fails loudly
   * and names the file to go and write in, rather than letting a fourth machine
   * ship under a sentence that describes three.
   */
  it("still describes exactly the machines that exist", () => {
    const live = MACHINES.filter((m) => m.live).length;
    expect(
      live,
      "The machine count changed. `landingLead` in src/content/landing.ts names " +
        "one clause per machine by hand; go and write the missing clause, then " +
        "update this number.",
    ).toBe(4);
  });
});

describe("the visible-and-locked door is still there for when it is true", () => {
  /**
   * The D3 door is the correct copy for a pool that has not cleared
   * validation, and it is exactly what a future tidy-up of "stale locked copy"
   * would delete. Both branches are load-bearing; this asserts the one that
   * does not currently render.
   */
  /*
   * THE FIRST VERSION OF THIS ASSERTED "MACHINE 02" AND PASSED WHILE THE DOOR
   * WAS BEING DISMANTLED. Proving it is the only reason that is known: the
   * locked marker was stripped and the guard stayed green, because the needle
   * matched the half of the string that was not the point. It now asserts the
   * words that only the locked state has — the marker and the blurb — which
   * are the parts a tidy-up would actually remove.
   */
  it("both surfaces still carry their !DELICACY_LIVE branch", () => {
    const front = readFileSync("src/app/page.tsx", "utf8");
    const debrief = readFileSync("src/app/bias/BiasFlow.tsx", "utf8");
    const marker = "LOCKED";
    expect(front, "the front door's locked-state card lost its marker").toContain(marker);
    expect(front).toContain("Opens when its item pool clears validation.");
    expect(front).toContain("DELICACY_LIVE ? null :");
    expect(debrief, "the bias debrief's locked-state door lost its marker").toContain(marker);
    expect(debrief).toContain("In the gym soon.");
    expect(debrief).toContain("!DELICACY_LIVE ?");
  });

  /**
   * WHAT THIS CANNOT DO, said plainly. There is no jsdom and no
   * testing-library in this project, so no test here renders a component; the
   * explainer's paragraph is JSX and its two branches cannot be evaluated.
   * This asserts only that the sentence READS the flag — which is what stops
   * it being hand-typed state again, and is not the same as checking what it
   * renders. The rendered HTML was read out of the build by hand in E11/S2.
   */
  /*
   * The first version matched the string "DELICACY_LIVE ?" and went red when
   * the ternary was reformatted onto three lines — a guard asserting a code
   * style, not a fact. It now asserts that the flag is imported and that BOTH
   * branch sentences exist, which is the property that matters and which no
   * reformatting can break.
   */
  it("the delicacy explainer's state sentence reads the flag", () => {
    const src = readFileSync("src/app/learn/delicacy/page.tsx", "utf8");
    expect(src).toContain('from "@/content/delicacy/items"');
    expect(src).toContain("DELICACY_LIVE");
    expect(src, "the open-state sentence is missing").toContain("and they are open");
    expect(src, "the shut-state sentence is missing").toContain("visible and locked");
  });
});

describe("the needles catch the statements this slice removed", () => {
  const fixture = "src/content/__fixtures__/locked-claims-before-e11s2.txt";

  function sections(): Map<string, string> {
    const raw = readFileSync(fixture, "utf8");
    const out = new Map<string, string>();
    for (const part of raw.split("--- ").slice(1)) {
      const head = part.slice(0, part.indexOf(" ---"));
      out.set(head, part.slice(part.indexOf(" ---") + 4));
    }
    return out;
  }

  it("every state claim in the fixture trips at least one needle", () => {
    const s = sections();
    const stateSites = [...s.keys()].filter((k) => !k.includes("page.tsx:158"));
    expect(stateSites.length, "the fixture lost its samples").toBe(4);
    for (const k of stateSites) {
      expect(lockedHits(s.get(k)!).length, `${k} no longer trips any needle`).toBeGreaterThan(0);
    }
  });

  it("the count claim is caught by the count, not by a needle", () => {
    const lead = sections().get("src/app/page.tsx:158")!;
    // The defect was arithmetic, not vocabulary: the words were unobjectionable,
    // which is exactly why no wording rule would ever have found it.
    expect(lockedHits(lead)).toEqual([]);
    expect(lead.toLowerCase()).toContain("two machines");
    expect(
      landingLead(MACHINES.filter((m) => m.live).length).toLowerCase(),
    ).not.toContain("two machines");
  });
});

describe("the secondary doors under the machines", () => {
  it("offers the reference page, and offers it first", () => {
    expect(SECONDARY_DOORS[0].href, "the creator reference is not the first door").toBe(
      "/learn/flaws",
    );
    expect(SECONDARY_DOORS).toHaveLength(3);
  });

  /**
   * EVERY DOOR GOES SOMEWHERE. A reading-room href is checked against the
   * registry rather than against a string, so renaming a slug fails here
   * instead of shipping a 404 on the front door.
   */
  it("every reading-room door resolves to a registered page", () => {
    const broken = SECONDARY_DOORS.filter((d) => d.href.startsWith("/learn/"))
      .filter((d) => !learnPage(d.href.slice("/learn/".length)))
      .map((d) => d.href);
    expect(broken, `these front-door links point at no registered page: ${broken.join(", ")}`).toEqual(
      [],
    );
  });

  /**
   * RT-C(b) — THE LANDING STAYS GENERAL. The creator language lives on the
   * reference page and on results; the front door may point at it without
   * naming the audience. This is the ruling written as a check, because "one
   * more line about who this is for" is the easiest sentence in the world to
   * add later.
   */
  it("names no audience on the landing page", () => {
    const AUDIENCE = ["ai music", "ai-generated", "producers", "creators", "generated music"];
    const text = SECONDARY_DOORS.map((d) => `${d.label} ${d.line}`).join(" ").toLowerCase();
    const named = AUDIENCE.filter((a) => text.includes(a));
    expect(named, `RT-C(b) keeps the landing general; it now names: ${named.join(", ")}`).toEqual([]);
  });
});
