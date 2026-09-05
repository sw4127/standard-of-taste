/**
 * EXPORT THE FOUR BATCHES OF SHIPPED INSTRUMENT COPY (E9/S9, RT-Z(a)).
 *
 * WHY THIS EXISTS AT ALL. These four have been recorded as "awaiting a writing
 * pass" since 2026-08-26 and nothing acted on it, because a bullet in a handoff
 * is not a queue — each new handoff copies the line forward and the strings stay
 * as first drafted. The one batch in this project that ever completed a pass
 * (the delicacy readout, RT-107a) is the one somebody wrote a file for. This is
 * that file, for the remaining four.
 *
 * GENERATED, for the same reason as the other two decks: a hand-typed list is my
 * selection of what I thought was worth reviewing, and it starts rotting the
 * moment a string moves.
 *
 * THE BLURBS ARE NOT ORDINARY COPY, and the deck says so loudly. A blurb is the
 * prestige cue whose effect the Prestige Test MEASURES. It is the independent
 * variable, not decoration — and editing one is a POOL CHANGE that requires
 * bumping BIAS_POOL_VERSION, because every share URL and stored response is
 * keyed to the pool that produced it.
 *
 *   node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

const script = `
import { BIAS_CLIPS, BIAS_POOL_VERSION } from "@/content/bias/items";
import { resultTitleFragment } from "@/content/bias/copy";
import { FLAW_LINE_PREFIX, flawLineText, flawTimesLabel } from "@/content/delicacy/copy";
import { flawFamilies, FLAWS_INTRO, FLAWS_LIMITS, FLAWS_INVITE } from "@/content/flaw-families";
import { landingLead, landingHint, SECONDARY_DOORS } from "@/content/landing";
import { MACHINES } from "@/components/OtherMachines";
import { learnPage } from "@/content/learn";
import { describe, it } from "vitest";

describe("export", () => {
  it("emits the deck", () => {
    const out = {
      poolVersion: BIAS_POOL_VERSION,
      clips: BIAS_CLIPS.map((c) => ({
        id: c.id,
        shownArtist: c.shownArtist,
        shownBlurb: c.shownBlurb,
        labelDirection: c.labelDirection,
        labelIsTrue: c.labelIsTrue,
        isControl: Boolean(c.isControl),
      })),
      titleFragments: [-31, -1, 0, 1, 31].map((p) => [p, resultTitleFragment(p)]),
      flawPrefix: FLAW_LINE_PREFIX,
      flawLines: [[1, 1], [3, 5], [5, 8], [0, 4]].map(([a, b]) => [a, b, flawLineText(a, b)]),
      flawLabels: [[1, flawTimesLabel(1)], [2, flawTimesLabel(2)]],
      families: flawFamilies().map((f) => ({
        label: f.label,
        unit: f.unit,
        symptom: f.symptom,
        mechanism: f.mechanism,
      })),
      flawsIntro: FLAWS_INTRO,
      flawsLimits: FLAWS_LIMITS,
      flawsInvite: FLAWS_INVITE,
      flawsFaq: learnPage("flaws").faq,
      delicacyFaq: learnPage("delicacy").faq,
      delicacyTeaser: learnPage("delicacy").teaser,
      // COUNTED, NOT PINNED (E17/S5). This read landingLead(3) and rendered
      // "Three machines" into the deck the day a fourth shipped — the deck
      // the writing pass reads, describing a product that no longer exists.
      landingLead: landingLead(MACHINES.filter((m) => m.live).length),
      landingHint: landingHint(),
      doors: SECONDARY_DOORS,
    };
    console.log("DECK_START" + JSON.stringify(out) + "DECK_END");
  });
});
`;

const tmp = "src/content/bias/__export.test.ts";
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

const m = /DECK_START([\s\S]*?)DECK_END/.exec(raw);
if (!m) {
  console.error(raw.slice(-4000));
  throw new Error("export-instrument-deck: produced no deck");
}
const d = JSON.parse(m[1]);

/**
 * The six blurbs the standing note names, established from git history rather
 * than assumed: pb9–pb14 entered on 2026-08-25 in the commit that grew the
 * scored pool from 8 to 14 (RT-103a). The earlier eight are printed too, marked,
 * because a blurb's job is to sound like the rest of the pool and that cannot be
 * judged from six of fourteen.
 */
const NEW_SINCE = ["pb9", "pb10", "pb11", "pb12", "pb13", "pb14"];

const L = [];
const w = (s = "") => L.push(s);

w("# Shipped instrument copy — deck for a writing pass");
w();
w("**Generated, do not edit by hand.** `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md`");
w();
w(
  "The four batches recorded as awaiting a writing pass since 2026-08-26, plus a fifth added in " +
    "E11 (2026-08-28). They had no brief and no " +
    "deck, which is why nothing happened to them: a bullet in a handoff is not a queue. Every string " +
    "below is live in the product today.",
);
w();
w("## How to use this");
w();
w(
  "The engineer who wrote these is the weaker writer of the two on this project. Rewrite freely " +
    "**within the rules listed under each batch** — those are not style preferences. Several are " +
    "measurement constraints, and one of them makes an edit cost more than an edit usually costs.",
);
w();
w(
  "If a rule is what makes a string bad, say so and it gets re-examined. Do not quietly drop one.",
);
w();
w("---");
w();

/* ------------------------------------------------------------------ 1 */
w("## 1. The clip blurbs — the Prestige Test's independent variable");
w();
w("**Where they render.** Under each clip in the LABELLED pass of `/bias`, beside the artist name.");
w();
w(
  "**What they are.** Not description. A blurb is the prestige cue whose effect the instrument " +
    "measures — the whole test is how far a rating moves when this sentence appears. A blurb that " +
    "reads like marketing, or like a lie, weakens the measurement it is supposed to create.",
);
w();
w("**Rules this copy must keep:**");
w();
w(
  "- **One sentence.** It is read between two ratings, under a clip the person has already heard blind.",
);
w(
  "- **Direction is fixed per item.** `up` must read as genuine acclaim; `down` as genuine dismissal. " +
    "Reversing one changes what the instrument measures for that item.",
);
w(
  "- **Two of the fourteen are deliberately FALSE** (`swapped` below) — the sanctioned deception. " +
    "Those blurbs travel with the FICTIONAL artist shown, never the true one, and every swap is " +
    "confessed on the mandatory debrief. The fictional names are separately flagged as engineer " +
    "drafts pending your C.1 pass.",
);
w(
  "- **Nothing a reader can falsify in ten seconds.** A caught lie ends the measurement for that " +
    "session — they stop rating the sound and start rating the test.",
);
w(
  "- **No claim about the listener** (D1) and no comparison to other people (N3). These are about the work.",
);
w();
w(
  `**EDITING A BLURB IS A POOL CHANGE.** \`BIAS_POOL_VERSION\` is ${d.poolVersion} today, and it must ` +
    "be bumped for any relabelling. It rides in every share URL and every stored response, so old " +
    "links stay interpretable against the exact pool that produced them. Rewrites are welcome; they " +
    "are just not free, and they should arrive together rather than one at a time.",
);
w();
w("**The two control clips carry no label and no blurb at all** — they are shown unlabelled in both passes to measure plain re-listening drift. They are listed here only so the count makes sense.");
w();

let n = 0;
for (const c of d.clips) {
  n += 1;
  if (c.isControl) {
    w(`### ${n}. \`${c.id}\` — CONTROL, no label shown`);
    w();
    w("Deliberately empty. Nothing to review.");
    w();
    continue;
  }
  const flags = [
    c.labelDirection === "up" ? "direction: UP (acclaim)" : "direction: DOWN (dismissal)",
    c.labelIsTrue ? "label is TRUE" : "label is SWAPPED — fictional artist, deception disclosed at debrief",
    NEW_SINCE.includes(c.id) ? "**one of the six named in the standing note** (added 2026-08-25)" : "earlier pool — shown for voice consistency",
  ];
  w(`### ${n}. \`${c.id}\` — shown as “${c.shownArtist}”`);
  w();
  w(flags.map((f) => `- ${f}`).join("\n"));
  w();
  w("```");
  w(c.shownBlurb);
  w("```");
  w();
}
w("---");
w();

/* ------------------------------------------------------------------ 2 */
w("## 2. `resultTitleFragment` — the Prestige result's name for your number");
w();
w(
  "**Where it renders.** The browser tab title on `/bias/result` (as “… — The Prestige Test”), and " +
    "the alt text of the share card image. It is the sentence that shows up in a bookmark, a shared " +
    "link preview, and a screen reader.",
);
w();
w("**What the screen has already said.** Nothing — this is the title. The verdict copy and the number sit below it.");
w();
w("**Rules this copy must keep:**");
w();
w("- The sign matters and must survive: a negative number means ratings moved AWAY from the labels, which is a different result, not a worse one.");
w("- Zero is a real outcome and must not read as a failure or an error.");
w("- No claim about the person (D1); no percentile or cohort (N3).");
w("- It has to make sense with no context at all, because a tab title arrives with none.");
w();
w("**Every reachable shape:**");
w();
w("```");
for (const [p, s] of d.titleFragments) w(`pct = ${String(p).padStart(3)} → ${s}`);
w("```");
w();
w("---");
w();

/* ------------------------------------------------------------------ 3 */
w("## 3. The flaw line — the Delicacy result's second number");
w();
w(
  "**Where it renders.** On `/delicacy/result` and in the flow's reveal, directly under the detection " +
    "band, with the count styled as a figure inside the sentence.",
);
w();
w(
  "**What the screen has already said.** The score against chance and the detection band — how many " +
    "damaged clips were caught, and how much of that a coin would have managed.",
);
w();
w(
  "**Its job.** Report the SECOND thing measured: of the pairs where the damage was caught, how often " +
    "the flaw was also named correctly. Catching and naming are different skills and the screen is " +
    "reporting the harder one.",
);
w();
w("**Rules this copy must keep:**");
w();
w("- Singular and plural must both read (it once said “1 of 1 times”, found only by composing every reachable score and reading them).");
w("- The denominator is the pairs CAUGHT, not all pairs — the sentence must not imply otherwise.");
w("- Zero must read as a fact, not a rebuke.");
w("- The number keeps its own styling in the flow, so the prefix and the suffix are separate strings and must work with a figure set between them.");
w();
w(`**Prefix (styled number follows it):** \`${d.flawPrefix}\``);
w();
w(`**Suffix:** ${d.flawLabels.map(([k, v]) => `${k} → “${v}”`).join(" · ")}`);
w();
w("**Assembled, at every interesting count:**");
w();
w("```");
for (const [a, b, s] of d.flawLines) w(`${a} of ${b} → ${s}`);
w("```");
w();
w("---");
w();

/* ------------------------------------------------------------------ 4 */
w("## 4. `NotBuiltYet` — the product admitting a door is not there");
w();
w(
  "**Where it renders.** A dashed-border panel at the foot of two reading-room articles — " +
    "`/learn/comparison` and `/learn/practice` — whose criteria have no instrument behind them.",
);
w();
w(
  "**What the screen has already said.** A full article explaining the criterion, which is exactly " +
    "why the panel is needed: a reader who arrived searching for that criterion would otherwise leave " +
    "believing they had missed a door.",
);
w();
w("**Rules this copy must keep:**");
w();
w("- **Planned, never promised.** Neither instrument has been started and no date has been decided, so “coming soon” is a claim nobody has earned.");
w("- It must read as a fact, not an apology or an excuse.");
w("- The blocker clause differs per criterion and is passed in — it must stay true of that criterion.");
w("- It is the one place the product tells a reader something is missing; it should not be the one place the writing goes limp.");
w();
w("**The template, with both blockers filled in:**");
w();
w("```");
w("NOT BUILT YET");
w();
for (const [criterion, blocker] of [
  ["comparison", "it needs no new audio, so what it waits on is a decision rather than a build"],
  ["practice", "it needs the product to remember you between sessions, and today it does not"],
]) {
  w(
    `There is no instrument for ${criterion} in the gym today. It is in the plan and not in the ` +
      `product — ${blocker}. When it exists it will be measured the same way as the rest, and until ` +
      `then this page is an explanation rather than a door.`,
  );
  w();
}
w("The criteria that do have machines →");
w("```");
w();
w("---");
w();
w("## 5. The creator vocabulary — added in E11 (Track B), never written by a writer");

w();
w(
  "**Where it renders.** `/learn/flaws` (a new reading-room page), the front door's lead paragraph " +
    "and its three secondary doors, the delicacy explainer's state sentences, and a link on the " +
    "Delicacy and Threshold result screens.",
);
w();
w(
  "**What it is.** The half of the product that turns a measurement into a word. The blueprint's " +
    "premise is that somebody can hear a render is wrong and cannot name why; these are the " +
    "sentences that name it. They were written by the engineer in one session and have had no pass.",
);
w();
w("**Rules this copy must keep:**");
w();
w("- **No claim about the reader** (D1) and **no comparison to other people** (N3).");
w("- **No causal promise** that training here improves anybody's own output — it is unmeasured. A guard refuses five phrasings of it; it cannot refuse a sixth.");
w("- **Nothing may count.** Several of these strings are shown after sessions that measured different numbers of families, and one of them sits under a machine list that has changed length twice. Arity in a reused sentence is how “pick either” survived under three cards.");
w("- **Three families, and the limits sentence is load-bearing.** Three named flaws read as “the flaws” without it.");
w("- The unit names (`cents of peak detune`, `ms of drift IQR`) are the pipeline's own labels. They are the weakest lines here and the engineer flagged them; they are also the honest name of the measured quantity, so a friendlier synonym would add a second vocabulary rather than replace one.");
w();
w("### 5.1 The flaw families — symptom and mechanism (`/learn/flaws`)");
w();
w("The symptom is deliberately the complaint a person makes BEFORE they have the word; the mechanism is what is physically true. The gap between them is the vocabulary.");
w();
for (const f of d.families) {
  w(`**${f.label}** — measured in ${f.unit}`);
  w();
  w("```");
  w(`symptom:   ${f.symptom}`);
  w(`mechanism: ${f.mechanism}`);
  w("```");
  w();
}
w("### 5.2 The page's two claim-bearing sentences");
w();
w("```");
w(`intro:  ${d.flawsIntro}`);
w();
w(`limits: ${d.flawsLimits}`);
w("```");
w();
w("### 5.3 The page's questions");
w();
for (const f of d.flawsFaq) {
  w("```");
  w(`Q: ${f.q}`);
  w(`A: ${f.a}`);
  w("```");
  w();
}
w("### 5.4 The front door");
w();
w("The lead is shown with the machine count interpolated; three is what ships. The hint sits under the cards, and the three doors are the quiet rows beneath it.");
w();
w("```");
w(`lead:  ${d.landingLead}`);
w();
w(`hint:  ${d.landingHint}`);
w("```");
w();
for (const door of d.doors) {
  w("```");
  w(`${door.href}`);
  w(`${door.label} ${door.line}`);
  w("```");
  w();
}
w("### 5.5 The route from a result to the reference");
w();
w("One string, shown on both the Delicacy and Threshold results. It must stay true after a session that measured one family and after a session that measured three.");
w();
w("```");
w(d.flawsInvite);
w("```");
w();
w("### 5.6 The delicacy explainer, now that the machine is open");
w();
w("These read the live flag and have a second form for the locked state, which is not shown here because it is not what ships.");
w();
w("```");
w(`index card: ${d.delicacyTeaser}`);
w("```");
w();
for (const f of d.delicacyFaq) {
  w("```");
  w(`Q: ${f.q}`);
  w(`A: ${f.a}`);
  w("```");
  w();
}
w("---");
w();
w(
  `**${n} clips listed, of which ${NEW_SINCE.length} are the ones the standing note names.** ` +
    "Regenerate with `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md` after any change.",
);

process.stdout.write(L.join("\n") + "\n");
