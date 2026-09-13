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
import { allChains, contentFiles, matchesFor } from "./template-match.mjs";

const CHAINS = allChains(contentFiles());
const QUOTE_OPEN = String.fromCharCode(8220);
const QUOTE_CLOSE = String.fromCharCode(8221);

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
import {
  METHOD_CLOSING_LINKS,
  METHOD_HEADLINE,
  METHOD_KICKER,
  METHOD_LEDE,
  methodClosing,
} from "@/content/method/prose";
import { describe, it } from "vitest";

describe("export", () => {
  it("emits the deck", () => {
    const out = {
      claims: METHOD_CLAIMS,
      refusals: METHOD_REFUSALS,
      findings: METHOD_FINDINGS,
      sections: METHOD_SECTIONS,
      asOf: METHOD_AS_OF,
      prose: {
        kicker: METHOD_KICKER,
        headline: METHOD_HEADLINE,
        lede: METHOD_LEDE,
        closing: methodClosing(METHOD_AS_OF),
        emphasis: METHOD_LEDE.filter((p) => p.emphasis).map((p) => p.emphasis),
        linkLabels: METHOD_CLOSING_LINKS.map((l) => l.label),
      },
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
const { claims, refusals, findings, sections, asOf, prose } = JSON.parse(match[1]);

const L = [];
const w = (s = "") => L.push(s);

/**
 * PRINT THE SOURCE STRING, OR REFUSE (E20/S1, ported from the instrument deck).
 *
 * The same contract, for the same reason: a block this file types itself is a
 * block that can outlive the page, and it already had. Slots stay slots.
 */
function template(renderings, lead) {
  const shown = renderings.filter((r) => typeof r === "string" && r.length > 0);
  if (shown.length === 0) throw new Error("export-method-deck: template() got nothing to show");
  const hits = matchesFor(shown[0], CHAINS);
  if (hits.length !== 1) {
    throw new Error(
      "export-method-deck: " + hits.length + " source templates match, so this block would be " +
        "hand-typed. Give the string a home in a content module: " + shown[0].slice(0, 90),
    );
  }
  if (lead) {
    w(lead);
    w();
  }
  w("> " + hits[0].display);
  w();
  const examples = [...new Set(shown)].filter((r) => r !== hits[0].display);
  if (examples.length > 0) {
    w("  *As rendered:* " + examples.map((e) => QUOTE_OPEN + e + QUOTE_CLOSE).join("  ·  "));
    w();
  }
}

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

/**
 * TWO FIELDS, TWO IDS (E20/S2).
 *
 * WHAT WENT WRONG. A refusal is `refusal` + `price`; a finding is `finding` +
 * `consequence`. This file printed each pair joined by a space inside one
 * fence, so seven blocks carried two source strings under one id. A writer
 * returning a rewrite gives back one line for two strings, and applying it
 * means deciding where the cut goes -- a decision the writer was never told
 * they were making, and the wrong guess silently rewrites the wrong field.
 *
 * WHY IT MATTERS MORE HERE THAN ANYWHERE ELSE. These are PART-LOCKED blocks:
 * the quoted passage a test verifies lives in one of the two fields, so a
 * mis-applied cut can move verified words into free prose or the reverse. The
 * page would still build and would be putting words in the record's mouth.
 *
 * The parts are listed separately, and the joined form is shown as a rendering
 * because the two DO read as one paragraph on screen and a writer needs the
 * seam to be visible rather than hidden.
 */
function pairBlock(n, label, entry, parts, notes) {
  block(n, label, entry, parts.map(([, text]) => text).join(" "), notes, parts);
}

function block(n, label, entry, text, notes, parts) {
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
  if (parts === undefined) {
    w("```");
    w(text.replace(/\s+/g, " ").trim());
    w("```");
    w();
    return;
  }
  for (const [field, value] of parts) {
    /*
     * THE LOCKED PASSAGE IS NAMED PER FIELD, NOT PER BLOCK (E20/S2).
     *
     * The block-level LOAD-BEARING list was written when a block was one
     * string. Now it is two, and "these exact words are verified" above two
     * editable strings does not say WHICH of them carries them -- on a page
     * where the whole distinction is between the record speaking and the
     * engineer speaking. A writer who guesses wrong rewrites a quotation.
     */
    const flat = value.replace(/\s+/g, " ").trim();
    const mine = locked(entry, flat);
    template([flat], `*The \`${field}\` field` + (mine.length > 0
      ? ", which carries the verified words " + mine.map((a) => QUOTE_OPEN + a + QUOTE_CLOSE).join(" and ") + ":*"
      : ", free prose with no verified passage in it:*"));
  }
  w("*The two together, which is how the page reads:*");
  w();
  w("```renders");
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
w(
  "**What renders that this deck cannot show you.** The second paragraph italicises one word, and " +
    "the closing line carries two links. Both are found by searching the sentence for the word or " +
    "the label, so they are part of the string rather than markup around it: the emphasised word " +
    `is “${prose.emphasis.join("”, “")}” and the link labels are ` +
    `“${prose.linkLabels.join("” and “")}”. Rewriting a sentence without them ` +
    "renders a paragraph with no italic and a closing line with no links, and no test can tell that " +
    "from an intended change.",
);
w();
/*
 * READ FROM THE MODULE, NOT TYPED HERE (E20/S1).
 *
 * These five strings were a second copy, and the copy had already drifted: the
 * closing line was printed with the date resolved, so the census reported it as
 * a sentence in no source file at all -- a writer would have been rewriting the
 * exporter rather than the page. They now live in `content/method/prose.ts`,
 * which the page renders and the voice gate reads, and `template()` refuses to
 * print anything that is not one of its strings.
 */
template([prose.kicker], "**Kicker, top of page:**");
template([prose.headline], "**Headline:**");
w("**Two opening paragraphs:**");
w();
for (const paragraph of prose.lede) template([paragraph.text]);
template(
  [prose.closing],
  "**Closing line.** The date is a slot -- it is a standing fact with its own constant, and " +
    "resolving it here is what made this line untraceable to source:",
);
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
  pairBlock(n, `\`${r.id}\``, r, [["refusal", r.refusal], ["price", r.price]], [
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
  pairBlock(n, `\`${f.id}\``, f, [["finding", f.finding], ["consequence", f.consequence]], [
    ["Date line on screen (free prose)", `${f.date} · broke ${f.rule}`],
    ["Second paragraph opens", "“Since then. …”"],
  ]);
}

w("---");
w();
w(`**${n} numbered blocks.** Regenerate with \`node scripts/export-method-deck.mjs > docs/copy-deck-method.md\` after any ledger change.`);

process.stdout.write(L.join("\n") + "\n");
