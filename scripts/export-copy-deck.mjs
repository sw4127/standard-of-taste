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
    title: "1. Threshold result — “WHAT THIS MEANS IN A RENDER”",
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
    title: "2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”",
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
    title: "3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”",
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
    key: "across",
    title: "4. Combined view — “ACROSS YOUR SESSIONS”",
    where:
      "Renders on all three result screens, but ONLY when two or more instruments have been run on this " +
      "device AND the result on screen is this device's own (never on somebody else's shared link).",
    already: "Everything in sections 1–3, plus each instrument's own measurement copy.",
    job: "Say the three things that are only true once more than one instrument has run: the dossier, the replication, the coverage.",
    rules: [
      "Never ranks one family against another — no “strength”, “blind spot”, “sharpest”, “best”, “worst”.",
      "No leaderboard, streak, XP, points, rank or badge (the anti-clone clause).",
      "A band that predicted nothing must not earn agreement by staying silent.",
      "The roster lists thresholds in different units side by side — a LIST, never a ranking.",
      "No sentence here may also appear in sections 1–3; a test enforces it.",
    ],
  },
];

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
for (const section of SECTIONS) {
  const mine = strings.filter((s) => s.surface.startsWith(`vocabulary/${section.key}/`));
  const unique = [...new Set(mine.map((s) => s.text))].sort();
  total += unique.length;

  lines.push("---");
  lines.push("");
  lines.push(`## ${section.title}`);
  lines.push("");
  lines.push(`**Where it renders.** ${section.where}`);
  lines.push("");
  lines.push(`**What the screen has already said.** ${section.already}`);
  lines.push("");
  lines.push(`**This layer's job.** ${section.job}`);
  lines.push("");
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
    const shape = text.replace(/\d+(?:\.\d+)?\s*(cents|ms|kbps|pairs|clips|times)/g, "{$1}").replace(/\b\d+\b/g, "{n}");
    if (!templates.has(shape)) templates.set(shape, []);
    templates.get(shape).push(text);
  }

  lines.push(
    `**${templates.size} sentence${templates.size === 1 ? "" : "s"} to review** ` +
      `— ${unique.length} concrete variants, ${mine.length} reachable renderings. ` +
      `Braces mark values the engine fills in; leave them as slots.`,
  );
  lines.push("");
  for (const [shape, examples] of templates) {
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
lines.push(`**${total} concrete sentences across four surfaces.**`);
lines.push("");
lines.push(
  "Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named " +
    "hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured " +
    "audibility claims. A green run there does **not** mean the prose is good; it means no named " +
    "hazard is present. Judging whether it is good is the point of this document.",
);
lines.push("");

process.stdout.write(lines.join("\n"));
