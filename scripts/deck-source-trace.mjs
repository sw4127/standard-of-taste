/**
 * CAN A WRITER'S EDIT LAND? (E20/S1)
 *
 * WHY THIS EXISTS. The copy deck hands a writer a string and an id and asks for
 * a rewrite. That transaction only works if the string in the deck is the
 * string in the source. Three ways it stops being true, and this file names all
 * three per id:
 *
 *   RESOLVED  the deck printed a RENDERING of a template, so its slots are
 *             filled in. A writer rewriting it freezes a value that is supposed
 *             to move -- `${FAMILY_LIST}` becomes "pitch drift, timing smear
 *             and compression damage" and the fourth family, if there is ever
 *             one, silently never appears.
 *   TYPED     the deck's line exists in NO source file. Somebody typed it into
 *             the exporter. It cannot be edited by editing the product, and it
 *             does not have to change when the product does.
 *   DEAD      a special case of TYPED that is worse: the copy WAS live, the
 *             surface was deleted, and the hand-typed deck entry outlived it.
 *
 * MEASURED, NOT ASSUMED. Batch 2's return logged nine moments the writer
 * reached for source; seven were slot questions and the return said plainly
 * that what the remaining parts need is what Part 1 got. This counts how much
 * of that there is before anything is rewritten.
 *
 * NO BACKSLASH ESCAPES IN THIS FILE. The transport these scripts are written
 * through eats one level, which has produced a broken literal three times.
 * Characters that would need one come from String.fromCharCode.
 *
 *   node scripts/deck-source-trace.mjs [PART]     PART defaults to 2
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { allChains, contentFiles, matchesFor, SLOT_MARKER } from "./template-match.mjs";

const NL = String.fromCharCode(10);
const TICK = String.fromCharCode(96);
const DECK = "docs/copy-deck.md";

const part = Number(process.argv[2] || "2");

/**
 * THE PART'S OWN SLICE OF THE ASSEMBLED DOCUMENT. Cut on the part heading
 * rather than on the id prefix, because a part's dead entries are exactly the
 * ones whose prefix nobody would think to look for.
 */
function partBody(text, n) {
  const lines = text.split(NL);
  const from = lines.findIndex((l) => l.startsWith("# Part " + n + " "));
  if (from === -1) throw new Error("deck-source-trace: no Part " + n + " in " + DECK);
  let to = lines.length;
  for (let i = from + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("# Part ")) {
      to = i;
      break;
    }
  }
  return lines.slice(from, to);
}

/**
 * Every line the deck hands an editable id to. Same rule the assembler used to
 * mint them: the id line, then the next line long enough to be copy.
 */
function owned(lines) {
  const out = [];
  let pending = null;
  const marked = new RegExp("^" + TICK + "([A-Z]+-[A-Z0-9-]+)" + TICK + " . (.+)$");
  for (const raw of lines) {
    const line = raw.trim();
    const hit = marked.exec(line);
    if (hit) {
      pending = hit[2].startsWith("another rendering") ? null : { id: hit[1], state: hit[2] };
      continue;
    }
    if (pending !== null && line.length >= 40) {
      out.push({ ...pending, text: line.replace(/^> /, "") });
      pending = null;
    }
  }
  return out;
}

/**
 * THE DECK LABELS ITS OWN BLOCKS and the label is not product copy: "symptom:",
 * "lead:", "share at 13/15:". Matching is tried with and without one, exactly
 * as the assembler does, because a wrong strip costs nothing.
 */
function withoutLabel(line) {
  /*
   * TRIMMED, AND THE FIRST VERSION WAS NOT. The deck pads its labels to a
   * column -- "symptom:   It sounds sour" -- so slicing past ": " leaves two
   * spaces on the front, the anchored matcher fails, and six ids were reported
   * TYPED that are verbatim source strings. A census that invents defects is
   * worse than no census, and this one nearly shipped six.
   */
  for (const sep of [" " + String.fromCharCode(8594) + " ", ":"]) {
    const at = line.indexOf(sep);
    /*
     * A LONGER CAP THAN THE ASSEMBLER'S 34, and one extra condition. The
     * readout's block is labelled "provisional footnote (the whole assembled
     * paragraph)" -- 51 characters -- and at 34 it was not stripped, so a
     * paragraph assembled from three source constants was reported as being in
     * no source file. A label never contains a sentence end; prose that starts
     * with 50 characters and a colon usually does.
     */
    if (at > 0 && at < 60 && line.slice(0, at).indexOf(". ") === -1) {
      return line.slice(at + sep.length).trim();
    }
  }
  return null;
}

/** Every source file a hand-typed string could plausibly have come from. */
function sourceFiles(dir = "src") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

const CHAINS = allChains(contentFiles());
const SOURCES = sourceFiles().map((path) => ({ path, text: readFileSync(path, "utf8") }));

/** A chain that produced this line, if exactly one did. */
function chainFor(line) {
  for (const candidate of [line, withoutLabel(line)]) {
    if (candidate === null) continue;
    const hits = matchesFor(candidate, CHAINS);
    if (hits.length === 1) return { chain: hits[0], text: candidate };
  }
  return null;
}

/**
 * Where a hand-typed line still appears in source, if anywhere. A TYPED line
 * found only in a .test.ts is worth seeing separately: that is a voice fixture
 * for copy nothing renders.
 */
function appearsIn(line) {
  const needle = line.slice(0, 60);
  return SOURCES.filter((f) => f.text.indexOf(needle) !== -1).map((f) => f.path);
}

/**
 * SOURCE STRINGS THE EXPORTER GLUED TOGETHER (E20/S1).
 *
 * The deck prints a door as "Something sounds wrong. Three kinds of damage,
 * what each one is called..." -- an accented `label` and a plain `line`, two
 * fields, one editable id. A returned rewrite cannot be applied without
 * deciding where to cut it, and the writer was never told there was a cut.
 *
 * SEPARATED FROM `TYPED` BECAUSE THE FIX IS DIFFERENT. A typed line has to be
 * deleted or replaced by its source; an assembled one has to be split into the
 * ids it already deserves. Reporting them as one bucket sent me hunting a
 * phantom source file for four of seven.
 *
 * RECURSIVE, AND THE TWO-PART VERSION WAS WRONG TWICE. `PROVISIONAL_FOOTNOTE`
 * joins THREE constants and the front door's third card joins a six-character
 * label, which is under the chain extractor's literal floor. Both came back
 * TYPED -- "in no source file" -- for a line every word of which is in a source
 * file. A census that misreports the defect class is how a slice fixes the
 * wrong thing.
 */
function isPiece(text) {
  if (chainFor(text) !== null) return true;
  // Below the chain extractor's literal floor a real string cannot be a chain,
  // so fall back to finding it verbatim -- `label: "Snack."` is source.
  return text.length <= 12 && appearsIn(text).length > 0;
}

function assembled(line, depth = 0) {
  if (depth > 4) return false;
  const seps = [": ", ". ", " " + String.fromCharCode(8212) + " "];
  for (const sep of seps) {
    let at = line.indexOf(sep);
    while (at > 0) {
      // A sentence separator keeps its full stop with the sentence it ends.
      const head = line.slice(0, at + (sep === ". " ? 1 : 0)).trim();
      const tail = line.slice(at + sep.length).trim();
      if (head.length >= 4 && tail.length >= 12 && isPiece(head)) {
        if (isPiece(tail) || assembled(tail, depth + 1)) return true;
      }
      at = line.indexOf(sep, at + 1);
    }
  }
  return false;
}

const rows = [];
for (const row of owned(partBody(readFileSync(DECK, "utf8"), part))) {
  const found = chainFor(row.text);
  if (found === null) {
    const bare = withoutLabel(row.text);
    if (assembled(row.text) || (bare !== null && assembled(bare))) {
      rows.push({
        ...row,
        verdict: "ASSEMBLED",
        note: "two source strings joined by the exporter",
      });
      continue;
    }
    const where = appearsIn(row.text);
    const live = where.filter((p) => p.indexOf(".test.") === -1);
    rows.push({
      ...row,
      verdict: where.length === 0 ? "TYPED" : live.length === 0 ? "DEAD" : "UNMATCHED",
      note: where.length === 0 ? "in no source file" : where.join(", "),
    });
    continue;
  }
  const slots = found.chain.text.split(SLOT_MARKER).length - 1;
  const verbatim = found.chain.display === found.text;
  rows.push({
    ...row,
    verdict: verbatim ? "TEMPLATE" : slots > 0 ? "RESOLVED" : "TEMPLATE",
    note: (slots > 0 ? slots + " slot" + (slots === 1 ? "" : "s") + " in " : "") + found.chain.file,
  });
}

const order = ["DEAD", "TYPED", "ASSEMBLED", "UNMATCHED", "RESOLVED", "TEMPLATE"];
const tally = new Map(order.map((k) => [k, 0]));
for (const r of rows) tally.set(r.verdict, (tally.get(r.verdict) || 0) + 1);

const out = [];
out.push("PART " + part + " -- can a writer's edit land? " + rows.length + " ids with copy.");
out.push("");
/*
 * THE CENSUS KNOWS ONE KIND OF SOURCE. Chains are parsed from the content
 * modules, so a part whose copy lives inline in JSX cannot be matched and
 * reports UNMATCHED or TYPED for reasons that are about this tool rather than
 * about the deck. Part 3 is that part. Saying so here rather than letting a
 * reader count 31 dead strings that are not dead.
 */
out.push("Chains are parsed from src/content modules only. Copy written inline in JSX cannot be");
out.push("matched, so UNMATCHED and TYPED are unreliable for a part whose sentences live in .tsx.");
out.push("");
for (const key of order) {
  if (!tally.get(key)) continue;
  out.push(key + ": " + tally.get(key));
}
out.push("");
for (const key of order) {
  const mine = rows.filter((r) => r.verdict === key);
  if (mine.length === 0) continue;
  out.push("== " + key + " ==");
  for (const r of mine) {
    out.push("  " + r.id + "  [" + r.state + "]  " + r.note);
    if (key !== "TEMPLATE") out.push("      " + r.text.slice(0, 96));
  }
  out.push("");
}
process.stdout.write(out.join(NL) + NL);
