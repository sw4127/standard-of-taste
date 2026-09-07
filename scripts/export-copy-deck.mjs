/**
 * EXPORT EVERY SENTENCE THE VOCABULARY LAYER CAN SAY (E8/S11, RT-J(a)).
 *
 * WHY A SCRIPT AND NOT A HAND-WRITTEN DOCUMENT. The PM rates this engineer the
 * weaker writer and asked for one artefact to hand to a stronger one. A copy
 * deck typed out by hand would be a snapshot that starts rotting immediately —
 * and worse, it would be MY selection of what I thought was worth reviewing,
 * which is exactly the wrong hand to leave on the tiller. This regenerates from
 * the same fixtures the voice gate uses, so the document and the shipped
 * strings cannot disagree, and a sentence I forgot cannot hide from the review.
 *
 * IT WRITES CONTEXT, NOT JUST LINES. A reviewer cannot judge "This session will
 * not break your result down by flaw type" without knowing that it sits under a
 * measurement paragraph on the Delicacy result screen, that its second half is
 * a refusal the arithmetic forced, and that the sentence above it already said
 * something adjacent. So each block carries where it renders, what precedes it,
 * and what it is forbidden from saying.
 *
 *   node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md
 */
import { execSync } from "node:child_process";
import { allChains, matchesFor } from "./template-match.mjs";

/*
 * The fixtures are TypeScript with path aliases, so they are run through
 * vitest rather than imported directly — the same reason `render-charts.mjs`
 * shells out instead of reaching into src/.
 */
const script = `
import { vocabularyStrings } from "@/content/vocabulary/fixtures";
import { describe, it } from "vitest";

describe("export", () => {
  it("emits the deck", () => {
    const out = { strings: vocabularyStrings() };
    console.log("DECK_START" + JSON.stringify(out) + "DECK_END");
  });
});
`;

import { writeFileSync, unlinkSync } from "node:fs";
const tmp = "src/content/vocabulary/__export.test.ts";
writeFileSync(tmp, script, "utf8");
let raw = "";
try {
  // Fixed command string: no interpolation, so nothing here is injectable.
  raw = execSync(`npx vitest run ${tmp} --reporter=verbose`, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
} finally {
  unlinkSync(tmp);
}

const match = /DECK_START([\s\S]*?)DECK_END/.exec(raw);
if (!match) {
  console.error(raw.slice(-4000));
  throw new Error("export-copy-deck: fixtures produced no deck");
}
const { strings } = JSON.parse(match[1]);

/** surface prefix -> where it renders and what governs it. */
const SECTIONS = [
  {
    key: "threshold",
    alongside:
      "`creatorLines` emits the symptom line, then the consequence line. On a wide band it emits " +
      "the symptom line ALONE — the consequence is dropped rather than hedged.",
    title: "Threshold result — “WHAT THIS MEANS IN A RENDER”",
    where:
      "Renders on `/threshold/[slug]/result` and at the end of a Gym session, in a bordered panel " +
      "BELOW the measurement paragraphs and ABOVE the no-cohort footnote.",
    already:
      "The screen has already said: the band (“You caught the damage at 25 cents. At 8.8 cents you " +
      "were guessing.”), the fitted point where one exists, the per-rung ladder, the material, and " +
      "“Come back in a week and run it again.”",
    job: "Say what this flaw IS in a track the reader made, and what their measured band implies gets past them.",
    rules: [
      "Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).",
      "No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.",
      "No claim about the person, no prediction about their future (D1).",
      "Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).",
    ],
  },
  {
    key: "delicacy",
    alongside:
      "`creatorLines` emits the naming line, then the per-family refusal where one applies. On a " +
      "session that caught nothing it emits the refusal ALONE, so that sentence carries the screen.",
    title: "Delicacy result — “WHAT THIS MEANS IN YOUR WORK”",
    where:
      "Renders on `/delicacy/result` and in the flow's reveal, between the flaw line it interprets " +
      "and the “DID YOU KNOW WHEN YOU KNEW?” calibration block.",
    already:
      "The screen has already said: the score against chance, the detection band, “And on the ones you " +
      "caught, you named the flaw 5 of 8 times”, and the whole calibration read.",
    job: "Say why NAMING a flaw is the half that transfers, and why the result is not broken down per flaw.",
    rules: [
      "The second sentence is a REFUSAL and the arithmetic forces it: at 5 pairs a family, an equally " +
        "good ear looks uneven 88.7–92.8% of the time. It must not read as modesty or apology.",
      "A session that caught nothing gets ONE sentence, not two stacked refusals.",
      "Never a per-family count or percentage on this screen.",
      "Must say nothing about confidence or calibration — that block owns it.",
    ],
  },
  {
    key: "bias",
    alongside:
      "`creatorLines` emits `CUE_IN_YOUR_WORK` — which names the cues this test could not show — " +
      "and then the verdict-branched boundary, which refers back to it as \"the cues above\". The " +
      "two always render together, in that order.",
    title: "Prestige result — “WHAT THIS MEANS IN YOUR WORK”",
    where: "Renders on `/bias/result` and in the flow's debrief, under the verdict and above the share card.",
    already:
      "The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, " +
      "the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt " +
      "pill “You moved with the label on N of M clips that could move.”",
    job: "Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.",
    rules: [
      "Carries NO counts — the receipt pill and the share card own those.",
      "The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, " +
        "model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.",
      "A contrarian result must not be congratulated as unbiased.",
    ],
  },
  {
    key: "spread",
    alongside:
      "`spreadLines` emits, in this order: what was set aside; then, only if a reading was " +
      "produced, the two figures and the direction; then `SPREAD_BOUNDARY`, every time. The " +
      "boundary is always the last thing a reader sees, so anything it already says does not need " +
      "saying above it.",
    title: "The Ranking Test — “WHERE YOUR GAPS FELL”",
    where:
      "The whole reading on `/spread`, below the two figures. There is no share page for this " +
      "instrument, so this is the only place these sentences are ever seen.",
    already:
      "The screen has already shown the two numbers themselves, each with the chance figure beside " +
      "it (“Rating at random gives 3.6 on both”). On a refused reading it has shown no number at all.",
    job:
      "Say what was set aside and why, read both figures against chance, name which way they fell " +
      "without claiming the gap between them means anything, and mark the boundary.",
    rules: [
      "AGREEMENT WITH THE CRITIC IS NEVER SCORED AND CANNOT BE COMPUTED. Only the DISTANCE between " +
        "two of his positions was ever imported, never which he ranked higher. No sentence may " +
        "imply the reader agreed or disagreed with him, or that agreeing would be better.",
      "The difference between the two figures is never reported (RT-N2 a). Both numbers, side by " +
        "side, against chance — never their gap, because nobody has sat this twice and there is no " +
        "measured wobble against which a difference could be called real.",
      "The recognition filter is SELF-REPORT and that is disclosed every time it is described (N3). " +
        "Nothing checks; it only ever removes evidence, and what was recognised is never a score.",
      "A REFUSAL MUST NOT FLATTER. “You know your Beethoven!” converts a failure to measure into a " +
        "compliment about the person — a verdict smuggled in where the instrument just said it had " +
        "nothing. Every refusal names what was set aside and invites the reader back.",
      "Small numbers are not a poor result. Six recordings of six different works are not spaced " +
        "out by quality; if they genuinely sounded close, rating them close was accurate.",
      "Nothing may count. Every number in a sentence is derived from the result, never written in.",
    ],
  },
  {
    key: "arc",
    alongside:
      "`arcLines` emits the reading, then — where the sitting count supports it — the pooled " +
      "sentence about what coming back buys. `ARC_DEVICE_NOTE` sits under both.",
    title: "The retest arc — “DID YOUR EAR MOVE”",
    where:
      "Renders under a result when this device holds an EARLIER sitting of the same instrument, " +
      "and only when the result on screen is this device's own — never on somebody else's link.",
    already:
      "The screen has already given this sitting's own reading in full. This layer adds the only " +
      "thing a single sitting cannot say: what happened between then and now.",
    job:
      "Say whether the change is bigger than what the instrument can resolve, and when it is not, " +
      "name the floor in the reader's own units so a refusal is not read as a shrug.",
    rules: [
      "THE REFUSAL IS THE MAIN CASE, NOT THE EDGE CASE. A pitch threshold has to change by about " +
        "three and a half times before anything may be said, so “no change you could hear” is what " +
        "most readers get most of the time. It is a statement about the INSTRUMENT — “smaller than " +
        "this ladder can see” — never “you did not improve”, which is a claim about a person the " +
        "data does not support (D1).",
      "It NAMES THE FLOOR in the reader's own units (PM ruling RT-H1 a). A bare “no change” invites " +
        "the reader to conclude they failed; “it would take about a 3.5x change” tells them what " +
        "would have had to happen.",
      "The staircase sentences report the size of a change as a MULTIPLE and never an endpoint as a " +
        "number. Printing “34 cents” beside a result screen that reads “no reading — somewhere " +
        "between 8.8 and 100 cents” makes the page contradict itself, and that defect shipped once.",
      "NOTHING MAY COUNT, and this layer has broken that rule twice. The readings are arity-free — " +
        "“across your sittings”, “before”, “since” — because a reading that said “between these two " +
        "sittings” went false the day it rested on four. Only the pooled line may state a number.",
      "An arc compares one person to themselves. That is the only comparison this product may make: " +
        "no cohort, no percentile, and no promise that practice will work (N3).",
      "It says where the memory lives. This is the strongest claim to remembering anywhere in the " +
        "product, and it is one browser's localStorage.",
    ],
  },
  {
    key: "comparison",
    alongside:
      "`comparisonLines` emits the degrees sentence, then the stability sentence — each replaced " +
      "by its own refusal where the evidence floor is not met — then `COMPARISON_BOUNDARY`, every " +
      "time. The critic-scale lines and the our-scale line render beside them as a reference panel.",
    title: "Comparison — “DEGREES OF PRAISE”",
    where:
      "Renders under the Prestige result, on both the flow's debrief and the share page. It is " +
      "computed from the Prestige Test's own ratings — no new clip, no new tap.",
    already:
      "The screen has already given the prestige verdict and its percentage. This layer adds a " +
      "different question about the same ratings: how much of the scale the listener used, and " +
      "whether they put the same clips in the same order twice.",
    job:
      "Report a spread and a stability without either reading as a mark out of eleven, and mark " +
      "the boundary that says a narrow spread may simply be correct.",
    rules: [
      "A DEGREES COUNT INVITES A VERDICT AND MUST NOT BE ONE. “You used five of eleven” reads as " +
        "a grade unless the chance figure is in the same breath: rating at random lands on about " +
        "nine distinct values, so eleven is not an achievement and five is not a failure.",
      "A NARROW SPREAD MAY BE THE CORRECT ANSWER. If the clips really are close in quality, " +
        "compressing them is right, and this instrument cannot tell that case from a narrow ear. " +
        "`COMPARISON_BOUNDARY` says so and is appended unconditionally — it is not a footnote.",
      "Nobody is ranked. There is no cohort. The only outside reference is what professional " +
        "critics do with their OWN scales, and that is a reference point, never a target.",
      "THE CRITIC SENTENCES ARE NOT WRITTEN HERE. They are composed from " +
        "`src/content/comparison/scales.ts`, where each is bound to the page it came from and the " +
        "date somebody opened it. Edit the field in that file, never a copy of it.",
      "Refusals name what was missing and print no number — the same rule the other instruments " +
        "keep.",
    ],
  },
  {
    key: "apparatus",
    alongside:
      "`apparatusLines` emits one entry per borrowed standard, then the citation-strength line, " +
      "then the degrees-convergence line where it applies. They sit inside `/method`, beneath the " +
      "page prose that describes the instruments themselves.",
    title: "The borrowed apparatus — WHERE THE RULERS CAME FROM",
    where:
      "Renders on `/method`, as the section explaining which published standards this product's " +
      "measurements are built on.",
    already:
      "The page has already described what each instrument does. This layer says whose rulers it " +
      "borrowed to do it.",
    job:
      "Show that the loudness normalisation, the transparency anchor and the listening-test design " +
      "sit in a tradition with published standards — and say where this product departs from them.",
    rules: [
      "A CITATION MAY DESCRIBE THE MEASURING APPARATUS. It may NEVER describe how well people " +
        "score. This is the rule the whole section runs on: quoting a standard's method is " +
        "allowed, quoting anybody's results about listeners is not.",
      "Every standard named is one somebody opened. The descriptions live in " +
        "`src/content/apparatus/standards.ts` beside the URL and the date; edit them there.",
      "Where this product departs from a standard, the departure is stated rather than glossed.",
      "It is short on purpose. The product already carries a great deal of methodological prose, " +
        "and a reader who wanted a number about their ear is not helped by a survey of standards.",
    ],
  },
  {
    key: "across",
    alongside:
      "`acrossLines` emits the dossier, then the replication, then the coverage roster. Each is " +
      "present only when it has something to say, so any of them may be the only line on screen.",
    title: "Combined view — “ACROSS YOUR SESSIONS”",
    where:
      "Renders on all three result screens, but ONLY when two or more instruments have been run on this " +
      "device AND the result on screen is this device's own (never on somebody else's shared link).",
    already: "Every instrument section above, plus each instrument's own measurement copy.",
    job: "Say the three things that are only true once more than one instrument has run: the dossier, the replication, the coverage.",
    rules: [
      "Never ranks one family against another — no “strength”, “blind spot”, “sharpest”, “best”, “worst”.",
      "No leaderboard, streak, XP, points, rank or badge (the anti-clone clause).",
      "A band that predicted nothing must not earn agreement by staying silent.",
      "The roster lists thresholds in different units side by side — a LIST, never a ranking.",
      "No sentence here may also appear in an instrument section above; a test enforces it.",
    ],
  },
  {
    key: "expert",
    alongside:
      "The panel emits its blurb, then a section per instrument. The Brier sentence renders " +
      "directly beneath the calibration chart it refers to.",
    nonText:
      "An SVG CALIBRATION CHART renders immediately above the Brier sentence: claimed confidence " +
      "on the x axis, delivered accuracy on the y, with a DASHED DIAGONAL for perfect " +
      "calibration. \"The line above\" is that diagonal, and a reader of this deck cannot see it. " +
      "Every result surface also carries tables of numbers this deck does not reproduce.",
    title: "The expert panel — “THE RAW RECORD”",
    where:
      "A collapsed panel under every result that this device stored, open only when the result on screen is the " +
      "one this device recorded — on a link you share with someone else it renders nothing at all.",
    already:
      "Every section above. This panel repeats none of it: it shows the numbers underneath " +
      "— per-family and per-rung tallies, every trial with the answer key, the staircase's rung " +
      "visits and measured limits, the calibration curve, the prestige test's per-clip ratings.",
    job: "Label measurements and state limits. Never judge them — this is the verdict-free surface.",
    rules: [
      "No verdict, ever. `expert.ts` cannot supply one — it carries numbers, ids and enums with " +
        "no sentence in it — and the calibration data deliberately omits the " +
        "overconfident/underconfident label the result screen shows.",
      "Column headers and stat labels are copy too. They live in the deck precisely because " +
        "deciding case by case which strings are ‘important enough to gate’ is how the gap reopens.",
      "The notes state LIMITS, not findings. A limit stated loosely is the shape an unmeasured " +
        "claim takes.",
      "The blurb must warn that this is device-local, or a reader assumes a shared link carries it.",
    ],
  },
];

/** Source templates, matched against every rendering (E18/S15, RT-R5 a). */
const CHAINS = allChains();

const lines = [];
lines.push("# Vocabulary copy deck — for a writing pass");
lines.push("");
lines.push("**Generated, do not edit by hand.** `node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md`");
lines.push("");
lines.push(
  "Every sentence the vocabulary layer can render, enumerated from the same fixtures the voice gate " +
    "uses (`src/content/vocabulary/fixtures.ts`), so this file and the shipped product cannot disagree.",
);
lines.push("");
lines.push("## How to use this");
lines.push("");
lines.push(
  "The engineer who wrote these is the weaker writer of the two on this project; that is the reason " +
    "the file exists. Rewrite freely **within the rules listed under each section** — those are not " +
    "style preferences, they are measurement constraints, and several were bought with defects found " +
    "by reading rendered output. If a rule seems to be what makes a sentence bad, say so and it gets " +
    "re-examined; do not quietly drop it.",
);
lines.push("");
lines.push(
  "Two constraints apply everywhere. **D1:** every sentence is about the performance, never about the " +
    "person. **N3:** no percentile, no cohort, no comparison to other people — there are zero real " +
    "respondents, so any such claim is about people who do not exist.",
);
lines.push("");

let total = 0;
for (const [index, section] of SECTIONS.entries()) {
  const mine = strings.filter((s) => s.surface.startsWith(`vocabulary/${section.key}/`));
  const unique = [...new Set(mine.map((s) => s.text))].sort();
  total += unique.length;

  lines.push("---");
  lines.push("");
  lines.push(`## ${index + 1}. ${section.title}`);
  lines.push("");
  lines.push(`**Where it renders.** ${section.where}`);
  lines.push("");
  lines.push(`**What the screen has already said.** ${section.already}`);
  lines.push("");
  lines.push(`**This layer's job.** ${section.job}`);
  lines.push("");
  /*
   * WHAT ELSE IS ON SCREEN, AND WHAT THE DECK CANNOT SHOW (E18/S18).
   *
   * Cowork's return: three of its twenty-four edits existed only because it had
   * read the assembly functions and found sentences repeating each other in one
   * block. A writer with the deck alone could not have caught any of them, and
   * it called this the highest-value thing to add.
   *
   * IT ALSO SAID I WAS SCOPING IT TOO LARGE, and it was right. This needs no
   * general "renders alongside" system: the assemblers already return the block
   * as an ordered array, so the ORDER is the adjacency and one line per surface
   * carries it.
   *
   * THE NON-TEXT LINE IS A DIFFERENT DEFECT AND NEEDS A DIFFERENT FIX. A deck
   * that enumerates strings will never contain an SVG however good the
   * adjacency data becomes, which is why the expert panel's Brier sentence
   * referred to "the line above" and no reader of the deck could tell what that
   * was. Hand-written, changed rarely, and the only honest way to carry it.
   */
  if (section.alongside) {
    lines.push(`**What renders with it, in order.** ${section.alongside}`);
    lines.push("");
  }
  if (section.nonText) {
    lines.push(`**Not text, and not in this deck.** ${section.nonText}`);
    lines.push("");
  }
  lines.push("**Rules this copy must keep:**");
  lines.push("");
  for (const rule of section.rules) lines.push(`- ${rule}`);
  lines.push("");
  /*
   * GROUPED BY TEMPLATE, NOT LISTED AS STRINGS, and the first draft was listed.
   * It emitted 25 "distinct sentences" for the threshold layer that were really
   * five templates with the measurement swapped — "…gentler than 17.7 cents",
   * "…gentler than 50 ms", "…gentler than 96 kbps". A reviewer rewriting that
   * list makes the same edit five times and, worse, reads past the places where
   * the wording genuinely differs. Numbers are the part this layer must NOT
   * have rewritten anyway; they come from the engine.
   */
  const templates = new Map();
  for (const text of unique) {
    /*
     * THE GROUPING KEY IS THE SOURCE TEMPLATE (E18/S16, from Cowork's batch-1
     * return). It used to be a REGEX OVER THE RENDERED NUMBERS -- brace every
     * digit and call the result a shape -- and that was wrong in both
     * directions. It split one template into several ids whenever a
     * non-numeric slot varied, so VOC-RETEST-ARC-01 and -02 were the same
     * string differing only by ${way}; and the braces it produced were not the
     * product's slots at all, so the deck printed {n}.5x for ${floor} and
     * printed a family name, a whole alternating clause and a multiple as
     * literals a writer was invited to rewrite. Following the brief exactly
     * would have shipped "pitch drift" into a template that renders for three
     * families.
     */
    const hits = matchesFor(text, CHAINS);
    const key = hits.length === 1 ? hits[0].display : text;
    if (!templates.has(key)) templates.set(key, []);
    templates.get(key).push(text);
  }

  /*
   * SHORT LABELS ARE LISTED, NOT BLOCKED OUT. The expert panel contributes
   * sixty strings, most of them single-word column headers — "Family",
   * "Caught", "Shown". Rendering each as its own quoted block buries the four
   * sentences that actually need a writer among fifty things that do not, which
   * is the same failure as the template duplication fixed above.
   */
  const LABEL_MAX = 26;
  const labels = [...templates.keys()].filter((t) => t.length <= LABEL_MAX);
  const prose = [...templates.entries()].filter(([t]) => t.length > LABEL_MAX);

  lines.push(
    `**${prose.length} template${prose.length === 1 ? "" : "s"} to review**` +
      (labels.length ? `, plus ${labels.length} short labels` : "") +
      ` — they render ${unique.length} distinct sentences across ${mine.length} reachable ` +
      `renderings. Each block below is the TEMPLATE, read from the source file, with \`$\{…}\` ` +
      `marking its real slots; the italic lines under it are examples of how it renders. Rewrite ` +
      `the template. Leave every slot exactly as it is — a slot is a value the engine computes, ` +
      `and resolving one freezes a number or a name that is supposed to move.`,
  );
  lines.push("");
  if (labels.length) {
    lines.push(`*Labels:* ${labels.map((l) => `\`${l}\``).join(" · ")}`);
    lines.push("");
  }
  for (const [shape, examples] of prose) {
    lines.push(`> ${shape}`);
    lines.push("");
    if (examples[0] !== shape) {
      const shown = examples.slice(0, 2).map((e) => `“${e}”`).join("  ·  ");
      lines.push(`  *As rendered:* ${shown}${examples.length > 2 ? `  · …and ${examples.length - 2} more` : ""}`);
      lines.push("");
    }
  }
}

lines.push("---");
lines.push("");
lines.push(`**${total} concrete sentences across ${SECTIONS.length} surfaces.**`);
lines.push("");
lines.push(
  "Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named " +
    "hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured " +
    "audibility claims. A green run there does **not** mean the prose is good; it means no named " +
    "hazard is present. Judging whether it is good is the point of this document.",
);
lines.push("");

process.stdout.write(lines.join("\n"));
