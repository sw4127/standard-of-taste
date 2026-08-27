/**
 * EXPORT EVERY SENTENCE ON `/method` FOR A WRITING PASS (E9/S8, RT-Y(a)).
 *
 * WHY A SCRIPT, the same argument as `export-copy-deck.mjs`: the PM rates this
 * engineer the weaker writer and asked for one artefact to hand to a stronger
 * one. A hand-typed deck is a snapshot that starts rotting immediately, and
 * worse, it is MY selection of what I thought was worth reviewing — the wrong
 * hand on the tiller. This regenerates from the ledger the page renders, so the
 * document and the page cannot disagree, and a sentence I would rather not have
 * reviewed cannot hide from the review.
 *
 * WHAT MAKES THIS DECK DIFFERENT FROM THE VOCABULARY ONE. Those sentences were
 * free to be rewritten. Many of these are NOT: a quoted claim contains a passage
 * that a test opens the source document to verify, and rewording it breaks the
 * build. So every block states which words are load-bearing and which are the
 * engineer's own connective prose — because a reviewer told "rewrite freely"
 * about a sentence containing a verified quotation has been set up to fail.
 *
 *   node scripts/export-method-deck.mjs > docs/copy-deck-method.md
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

/*
 * The ledger is TypeScript behind a path alias, so it runs through vitest
 * rather than being imported — same reason as `export-copy-deck.mjs`.
 */
const script = `
import {
  METHOD_CLAIMS,
  METHOD_FINDINGS,
  METHOD_REFUSALS,
  METHOD_SECTIONS,
  METHOD_AS_OF,
} from "@/content/method/claims";
import { describe, it } from "vitest";

describe("export", () => {
  it("emits the deck", () => {
    const out = {
      claims: METHOD_CLAIMS,
      refusals: METHOD_REFUSALS,
      findings: METHOD_FINDINGS,
      sections: METHOD_SECTIONS,
      asOf: METHOD_AS_OF,
    };
    console.log("DECK_START" + JSON.stringify(out) + "DECK_END");
  });
});
`;

const tmp = "src/content/method/__export.test.ts";
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
  throw new Error("export-method-deck: the ledger produced no deck");
}
const { claims, refusals, findings, sections, asOf } = JSON.parse(match[1]);

const L = [];
const w = (s = "") => L.push(s);

/**
 * The verified passages inside a piece of prose, so a reviewer can see them.
 *
 * TRAILING PUNCTUATION IS STRIPPED FROM THE ANCHOR, and that was not an
 * optimisation — the first generated deck got this wrong in the worst possible
 * block. The finding about launch avoidance quotes "Resume value cannot be
 * hostage to a launch the owner has no energy to run" and then continues with a
 * comma; the anchor ends in a full stop. So the deck reported the block as
 * carrying no locked passage, which would have told a reviewer that a genuine
 * quotation was mine to rewrite — on the page whose whole subject is the
 * difference between the two.
 *
 * A quotation folded into a sentence legitimately loses its final stop. Nothing
 * else is normalised: every WORD must still match.
 */
function locked(entry, text) {
  const flat = (s) => s.replace(/\s+/g, " ").trim();
  const hay = flat(text).toLowerCase();
  const inside = entry.sources
    .map((s) => flat(s.anchor).replace(/[.,;:]+$/, ""))
    .filter((a) => hay.includes(a.toLowerCase()));
  return [...new Set(inside)];
}

function block(n, label, entry, text, notes) {
  w(`### ${n}. ${label}`);
  w();
  w(`**Kind:** ${entry.kind === "inferred" ? "INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label" : "QUOTED — the page presents this as the record speaking"}`);
  w();
  w(`**Cites:** ${[...new Set(entry.sources.map((s) => s.path))].join(" · ")}`);
  w();
  for (const [k, v] of notes) {
    w(`**${k}:** ${v}`);
    w();
  }
  const lock = locked(entry, text);
  if (lock.length > 0) {
    w("**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**");
    w();
    for (const a of lock) w(`- “${a}”`);
    w();
    w("Everything else in the block is the engineer's own connective prose and is free.");
  } else {
    w("**No locked passage in this block** — all of it is the engineer's own prose and is free.");
  }
  w();
  w("```");
  w(text.replace(/\s+/g, " ").trim());
  w("```");
  w();
}

w("# `/method` copy deck — for a writing pass");
w();
w("**Generated, do not edit by hand.** `node scripts/export-method-deck.mjs > docs/copy-deck-method.md`");
w();
w(
  "Every sentence rendered on `/method`, enumerated from the same ledger the page renders, so this " +
    "file and the live page cannot disagree. Read the page itself at `/method` alongside this — the " +
    "deck gives you numbered handles for edits, not a substitute for seeing it.",
);
w();
w("## How to use this");
w();
w(
  "The engineer who wrote these is the weaker writer of the two on this project; that is why the " +
    "file exists. **But this deck is not like the vocabulary one, and the difference matters.** Much " +
    "of this page is quotation: a claim marked QUOTED contains a passage that a test opens the cited " +
    "document to verify, word for word. Change those words and the build fails — correctly, because " +
    "the page would then be putting words in the record's mouth.",
);
w();
w(
  "So every block below separates the two. The **LOAD-BEARING** lines are quotations and are fixed. " +
    "Everything around them is mine and is free — and it is usually the weaker half, because it is the " +
    "half that had to carry a quotation into a sentence without sounding like a citation.",
);
w();
w(
  "If a locked passage is what makes a sentence bad, say so. The fix is either to re-frame the prose " +
    "around it or to drop the claim — never to silently reword the quotation.",
);
w();
w("**Two constraints apply everywhere.**");
w();
w(
  "- **RT-159(a):** wherever the page reconstructs the owner's reasoning rather than quoting a ruling, " +
    "it must say so. Blocks marked INFERRED render under a visible label. Moving prose between a QUOTED " +
    "and an INFERRED block changes what the page claims about its own evidence.",
);
w(
  "- **N3:** no percentile, no cohort, no comparison between people. There are zero real respondents, " +
    "so any such claim is about people who do not exist.",
);
w();
w(`**Standing facts on the page were last checked ${asOf}.**`);
w();
w("---");
w();

w("## 1. The page's own framing prose");
w();
w(
  "**This is the only prose on the page with no ledger entry behind it, and therefore the only part " +
    "with nothing verifying it.** It is framing rather than claim, but that is my judgment and worth " +
    "your eye. It is also entirely free to rewrite.",
);
w();
w("**Kicker + headline, top of page:**");
w();
w("```");
w("THE HOUSE RULES · HOW THIS IS RUN");
w("What this project refused, and what each refusal cost.");
w("```");
w();
w("**Two opening paragraphs:**");
w();
w("```");
w(
  "The instruments on this site are the visible part. The part worth reading about is the operating " +
    "model that produced them — a written constitution, two review protocols, and a decision record " +
    "that has repeatedly deleted finished work for being untrue rather than for being broken.",
);
w();
w(
  "Any project can list what it built. This page lists what it refused, because a refusal is the only " +
    "decision with a verifiable cost attached, and because a page of things that went well is a " +
    "brochure. Each block below names the document it comes from. Those documents are in the " +
    "repository, and a test opens every one of them on every run to check the quoted passage is still " +
    "there — if a source is reworded, this page fails the build instead of quietly becoming false.",
);
w("```");
w();
w("**Closing line:**");
w();
w("```");
w(
  `Standing facts on this page last checked ${asOf}. The instruments themselves are in the reading ` +
    "room; the measurements behind them are in the Lab, including a page listing what the instruments " +
    "cannot do.",
);
w("```");
w();
w("---");
w();

let n = 0;
w("## 2. The operating model, in the ruled reader order");
w();
w(
  "Three sections, in the order the direction document fixes: product manager, business analyst, data " +
    "analyst. Each section's heading and lede are free prose with no ledger entry — same status as §1.",
);
w();
for (const s of sections) {
  w(`### Section: ${s.audience}`);
  w();
  w("**Heading and lede (free prose):**");
  w();
  w("```");
  w(s.heading);
  w(s.lede.replace(/\s+/g, " ").trim());
  w("```");
  w();
  for (const id of s.claims) {
    const c = claims.find((x) => x.id === id);
    n += 1;
    block(n, `\`${c.id}\``, c, c.text, []);
  }
  w("---");
  w();
}

w("## 3. The four refusals");
w();
w(
  "Each renders as a heading, a small-caps rule line, the refusal, and a paragraph opening “What it " +
    "cost.” The heading and the rule line are free; a test requires only that the price is substantial " +
    "and does not say the refusal was free.",
);
w();
for (const r of refusals) {
  n += 1;
  block(n, `\`${r.id}\``, r, `${r.refusal} ${r.price}`, [
    ["Heading on screen (free prose)", r.what],
    ["Rule line on screen (free prose)", `Refused under ${r.rule}`],
    ["Second paragraph opens", "“What it cost. …”"],
  ]);
}
w("---");
w();

w("## 4. The finding against the project itself");
w();
w(
  "Two blocks. The first is the record's own account; the second is my reading of what happened next, " +
    "and renders under the inference label. **The distinction between them is the single most " +
    "consequential thing on this page** — if a rewrite blurs which is which, it breaks the condition " +
    "the page was approved under.",
);
w();
for (const f of findings) {
  n += 1;
  block(n, `\`${f.id}\``, f, `${f.finding} ${f.consequence}`, [
    ["Date line on screen (free prose)", `${f.date} · broke ${f.rule}`],
    ["Second paragraph opens", "“Since then. …”"],
  ]);
}

w("---");
w();
w(`**${n} numbered blocks.** Regenerate with \`node scripts/export-method-deck.mjs > docs/copy-deck-method.md\` after any ledger change.`);

process.stdout.write(L.join("\n") + "\n");
