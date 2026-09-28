// THE READING-LINES EVAL, RUN BY HAND (2026-09-28, AI tooling brief Part 5).
//
//   node scripts/eval-reading-lines/run.mjs brief   writes briefs/<listener>[-v2].md, the
//                                                   exact prompt each drafter is given
//   node scripts/eval-reading-lines/run.mjs score   scores drafts/*.json and writes
//                                                   docs/analytics/eval-reading-lines.md
//
// NO MODEL IS CALLED FROM HERE, and no API key is read. The owner ruled on
// 2026-09-28 that a paid API call is not affordable and that work inside the
// Claude plan is: the drafts are written by Claude Code subagents in a session,
// saved to drafts/ as returned, and this script only scores them. That keeps the
// harness honest about its limits too: a draft is a file anyone can read, and the
// report names who wrote it.
//
// EVERY SENTENCE OF THE REPORT'S READING IS BUILT FROM THE NUMBERS. The first
// version typed its conclusion ("the one failure is a false positive", "no fact got
// the same words twice") and would have printed it whatever the drafts said
// (red-team subagent). Each claim below is now a branch on a computed value.
//
// The harness is TypeScript behind the "@/" alias, so it runs through vitest,
// the same way the copy-deck exporters do.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HERE = "scripts/eval-reading-lines";
const mode = process.argv[2];
if (mode !== "brief" && mode !== "score") {
  console.error("usage: node scripts/eval-reading-lines/run.mjs brief|score");
  process.exit(1);
}

const drafts =
  mode === "score"
    ? readdirSync(join(HERE, "drafts"))
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => ({ name: f.replace(/\.json$/, ""), draft: JSON.parse(readFileSync(join(HERE, "drafts", f), "utf8")) }))
    : [];
const VERSIONS = ["v1", "v2"];
for (const d of drafts) if (!VERSIONS.includes(d.draft.brief)) throw new Error(`${d.name}: no brief version`);
const of = (v) => drafts.filter((d) => d.draft.brief === v);

const script = `
import { LISTENERS } from "@/content/reading/listeners";
import { briefFor, tally, CHECKS } from "./harness";
import { it } from "vitest";
it("runs", () => {
  const out = ${mode === "brief"}
    ? LISTENERS.flatMap((l) => [{ id: l.id, brief: briefFor(l, "v1") }, { id: l.id + "-v2", brief: briefFor(l, "v2") }])
    : { v1: tally(${JSON.stringify(of("v1"))}), v2: tally(${JSON.stringify(of("v2"))}), all: tally(${JSON.stringify(drafts)}) };
  console.log("EVAL_START" + JSON.stringify({ out, checks: CHECKS }) + "EVAL_END");
});
`;
const tmp = join(HERE, "__run.test.ts");
writeFileSync(tmp, script, "utf8");
let raw = "";
try {
  raw = execSync(`npx vitest run ${tmp.replace(/\\/g, "/")} --reporter=verbose`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} finally {
  unlinkSync(tmp);
}
const m = /EVAL_START([\s\S]*?)EVAL_END/.exec(raw);
if (!m) throw new Error("run.mjs: the harness printed nothing\n" + raw.slice(-3000));
const { out, checks } = JSON.parse(m[1]);

if (mode === "brief") {
  mkdirSync(join(HERE, "briefs"), { recursive: true });
  for (const { id, brief } of out) writeFileSync(join(HERE, "briefs", `${id}.md`), brief + "\n", "utf8");
  console.log(`wrote ${out.length} briefs to ${HERE}/briefs/`);
  process.exit(0);
}

/** Wilson 95% interval for k of n, as whole percentages. */
function wilson(k, n) {
  if (!n) return [0, 100];
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.round(100 * Math.max(0, c - h)), Math.round(100 * Math.min(1, c + h))];
}
const pct = (k, n) => (n ? `${Math.round((100 * k) / n)}%` : "n/a");
const band = (k, n) => {
  const [lo, hi] = wilson(k, n);
  return `${lo}–${hi}%`;
};

const { v1, v2, all } = out;
const label = { register: "Offer register (BA-3)", carveOut: "Carve-out (RT-Z10 a)", comparison: "No comparison (N3)", arithmetic: "Receipt arithmetic" };
const drafters = [...new Set(drafts.map((d) => d.draft.drafter))];

// Whether a second run gives the same words: distinct patterns among the drafts for each listener and fact.
const groups = new Map();
for (const d of drafts) for (const line of d.draft.lines) {
  const k = `${d.draft.listener}/${line.fact}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(line.pattern);
}
const repeated = [...groups.values()].filter((ps) => new Set(ps).size < ps.length).length;

const L = [];
L.push("# Eval: can a model write the reading's lines under its own rules?");
L.push("");
L.push("**Generated, do not edit by hand.** `node scripts/eval-reading-lines/run.mjs score`");
L.push("");
L.push(
  `**Drafter:** ${drafters.join("; ")}. **Date:** ${process.env.EVAL_DATE ?? new Date().toISOString().slice(0, 10)}. ` +
    `**N:** ${all.lines} lines in ${drafts.length} drafts: ${v1.lines} from brief v1, ${v2.lines} from brief v2, across the three illustrative listeners.`,
);
L.push("");
L.push(
  "**How it was run.** Each drafter got one listener's brief (`scripts/eval-reading-lines/briefs/`): the facts with their true counts, and the reading's rules in prose. It never saw the templates or the checks, and used no tools (checked in each subagent's transcript). Its reply is saved unedited in `drafts/`. Brief v2 is v1 plus one rule, the voice the product's own lines use: address the reader as “you”, never by name, no pronouns. The drafts were written by Claude Code subagents inside the owner's plan, not by a pinned API call: a re-run will not reproduce them word for word, and no temperature or model snapshot was fixed. Nothing here is rendered on the site (BA-10).",
);
L.push("");
L.push(
  "**What the checks cannot see.** They are the product's own pattern lists, applied sentence by sentence as `src/content/reading/lines.test.ts` applies them to the templates. A line that asserts a feeling, or makes a clinical claim, in words those lists do not name passes. Quantities written as words (“half”, “one in five”) are not checked. A pass means none of the listed shapes appeared, not that the line is good.",
);
L.push("");
L.push("| Check | Brief v1 | Brief v2 | All |");
L.push("|---|---|---|---|");
for (const c of checks) L.push(`| ${label[c]} | ${v1.pass[c]} of ${v1.lines} | ${v2.pass[c]} of ${v2.lines} | ${all.pass[c]} of ${all.lines} (${pct(all.pass[c], all.lines)}) |`);
L.push(`| **All four** | **${v1.allFour} of ${v1.lines}** | **${v2.allFour} of ${v2.lines}** | **${all.allFour} of ${all.lines} (${pct(all.allFour, all.lines)}; 95% interval ${band(all.allFour, all.lines)})** |`);
L.push("");
L.push("The control: the product's own template lines pass all four checks (`harness.test.ts`), so the scorer is not stricter than the product.");
L.push("");
const byCheck = Object.fromEntries(checks.map((c) => [c, all.failures.filter((f) => f.check === c)]));
for (const c of checks) {
  L.push(`## ${label[c]}: ${byCheck[c].length} failing line${byCheck[c].length === 1 ? "" : "s"}`);
  L.push("");
  if (!byCheck[c].length) {
    L.push("None.");
    L.push("");
    continue;
  }
  for (const f of byCheck[c]) {
    L.push(`- **${f.draft}**, fact \`${f.line.fact}\`: ${f.why.join("; ")}`);
    L.push(`  - pattern: “${f.line.pattern}”`);
    L.push(`  - receipt: “${f.line.receipt}”`);
    for (const o of f.line.offers) L.push(`  - offer: “${o}”`);
  }
  L.push("");
}

L.push("## What the four checks cannot see, counted");
L.push("");
L.push(
  "Plain pattern counts (`voiceCounts` in `harness.ts`, tested there). The product's own lines address the reader as “you” or impersonally, never by name and never with a pronoun.",
);
L.push("");
L.push("| Count | Brief v1 | Brief v2 |");
L.push("|---|---|---|");
L.push(`| Offers address the reader as “you” | ${v1.voice.second} of ${v1.lines} | ${v2.voice.second} of ${v2.lines} |`);
L.push(`| Offers name the listener in the third person | ${v1.voice.byName} of ${v1.lines} | ${v2.voice.byName} of ${v2.lines} |`);
L.push(`| A gendered pronoun for a listener whose pronouns were never given | ${v1.voice.gendered} of ${v1.lines} | ${v2.voice.gendered} of ${v2.lines} |`);
L.push("");
L.push(`Facts where two drafts wrote the same pattern word for word: **${repeated} of ${groups.size}**.`);
L.push("");

// The reading, each sentence a branch on the numbers above.
L.push("## What this says, and does not say, about BA-10 (the engineer's reading)");
L.push("");
const R = [];
R.push(
  `Scored as the product scores its templates, ${all.allFour} of ${all.lines} drafted lines pass all four checks (95% interval ${band(all.allFour, all.lines)}).` +
    (all.allFour === all.lines ? " No line failed a check." : ` ${all.lines - all.allFour} ${all.lines - all.allFour === 1 ? "failed; it is" : "failed; they are"} listed above.`),
);
const v1voice = v1.voice.byName + v1.voice.gendered;
const v2voice = v2.voice.byName + v2.voice.gendered;
if (v1.lines && v2.lines) {
  R.push(
    `With brief v1, which named the listener and did not say how to address the reader, ${v1.voice.byName} of ${v1.lines} lines named the listener in the third person and ${v1.voice.gendered} used a pronoun nobody gave. ` +
      `With brief v2, which states that one rule, the counts were ${v2.voice.byName} and ${v2.voice.gendered} of ${v2.lines}. ` +
      (v2voice === 0 && v1voice > 0
        ? "Stating the rule removed both, so they measured the brief, not a limit of the model."
        : v2voice < v1voice
          ? "Stating the rule reduced them without removing them."
          : "Stating the rule did not reduce them."),
  );
}
R.push(
  repeated === 0
    ? `No two drafts wrote the same pattern for any of the ${groups.size} facts. A template shows the same words every time; a drafted line is new on each run, so what a person was shown can only be checked afterwards if every shown line is stored.`
    : `For ${repeated} of the ${groups.size} facts, two drafts wrote the same pattern word for word.`,
);
R.push(
  "BA-10 is recorded as a ruling (“Templates only”), not as a measured claim, so this eval can neither confirm nor overturn it. What it cannot measure is meaning, and meaning is what the one recorded incident was about: the retired snack's model-written line “headphones are cheaper than therapy” (`src/content/carve-out.ts`), which no guard of the day could see. The pattern lists catch that phrasing now; they would not catch the next one written in other words.",
);
R.push(
  `With ${all.lines} lines from one model and no pinned settings, the evidence supports this much and no more: under rules stated in prose, this model's lines ${all.allFour === all.lines ? "did not trip" : "mostly did not trip"} the product's own checks. Whether to revisit BA-10 is the owner's call, and would need a fixed model and settings, a stored copy of every line shown, and a way to judge meaning that these checks do not have.`,
);
L.push(R.join(" "));
L.push("");
mkdirSync("docs/analytics", { recursive: true });
writeFileSync("docs/analytics/eval-reading-lines.md", L.join("\n") + "\n", "utf8");
console.log(`scored ${all.lines} lines (v1 ${v1.lines}, v2 ${v2.lines}); all four: ${all.allFour} (${pct(all.allFour, all.lines)}); wrote docs/analytics/eval-reading-lines.md`);
