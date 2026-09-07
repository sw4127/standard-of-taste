/**
 * WHICH TEMPLATE PRODUCED THIS SENTENCE (E18/S15, PM ruling RT-R5 a).
 *
 * WHY IT EXISTS. The copy deck presents each rendered string as an independently
 * editable sentence. It is not: `VOC-THRESHOLD-RESULT-01`, `-02` and `-03` are
 * one template differing only by a unit, and applying a rewrite to each in turn
 * would have the last one silently overwrite the other two. Cowork caught that
 * in the batch-1 return and shipped a mapping table by hand. This computes it.
 *
 * IT PARSES TEMPLATES RATHER THAN DIFFING RENDERINGS, and that was decided by a
 * measurement rather than a preference. The obvious cheap version -- brace
 * whatever differs between fixture renderings -- fails on the case Cowork used
 * to report the bug: all eight arc renderings in the deck say "pitch drift",
 * because `arcClaims()` only ever exercises one flaw family. `${label}` varies
 * in the CODE and not in the FIXTURES, so a diff cannot see it. A slot with one
 * fixture value is indistinguishable from a literal, exactly as reported.
 *
 * WHAT A "TEMPLATE" IS HERE. Not one backtick literal: a sentence in these
 * modules is a CHAIN of adjacent string and template literals joined with `+`,
 * sometimes with a bare identifier spliced in (`RECOGNITION_DISCLOSURE` is one).
 * The chain is the unit a writer edits, so the chain is what this extracts.
 *
 * SLOTS ARE `${...}` SPANS AND SPLICED IDENTIFIERS. Both become wildcards when
 * matching, and both are the positions a writer must not resolve to a value.
 *
 * IT REFUSES RATHER THAN GUESSING. A rendering that matches no chain, or more
 * than one, is reported as such. That refusal is the point: a deck built on an
 * uncertain mapping would be a worse artefact than the one it replaces.
 *
 * NO REGEX IN THE SCANNER. The transport these scripts are written through eats
 * one level of backslash escaping. Regexes appear only where they are built
 * from escaped literal text at run time.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";

const BACKTICK = String.fromCharCode(96);
const BACKSLASH = String.fromCharCode(92);
const NL = String.fromCharCode(10);
const SLOT = String.fromCharCode(1); // a marker no source text contains

const DIR = "src/content/vocabulary";

/**
 * Files whose exported strings the vocabulary deck renders.
 *
 * TWO DATA MODULES ARE IN THE LIST, and they are not an afterthought. The
 * critic-scale descriptions and the borrowed-standard descriptions are PROSE a
 * reader meets on screen, assembled by the vocabulary layer out of fields
 * defined elsewhere. Scanning only `vocabulary/` reported five renderings as
 * having no template, which was true and useless: the template exists, in a
 * file that happens to hold data as well as words.
 */
const EXTRA = ["src/content/comparison/scales.ts", "src/content/apparatus/standards.ts"];

export function moduleFiles() {
  const local = readdirSync(DIR)
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "fixtures.ts")
    .map((name) => DIR + "/" + name);
  return [...local, ...EXTRA];
}

/**
 * Strip comments so a docblock quoting a sentence is not mistaken for the
 * sentence. Block comments always; line comments only on lines that are wholly
 * a comment, because a `//` inside a string literal is not one.
 */
function stripComments(source) {
  let out = "";
  let i = 0;
  while (i < source.length) {
    if (source[i] === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    out += source[i];
    i += 1;
  }
  return out
    .split(NL)
    .filter((line) => !line.trim().startsWith("//"))
    .join(NL);
}

/** One string or template literal, with its `${...}` spans marked. */
function readLiteral(source, at) {
  const quote = source[at];
  let i = at + 1;
  let text = "";
  let display = "";
  while (i < source.length) {
    const ch = source[i];
    if (ch === BACKSLASH) {
      // An escape contributes one character; which one does not matter here,
      // because the escaped quote is what must not end the literal.
      const decoded = source[i + 1] === "n" ? " " : source[i + 1];
      text += decoded;
      display += decoded;
      i += 2;
      continue;
    }
    if (ch === quote) return { text, display, end: i + 1 };
    if (quote === BACKTICK && ch === "$" && source[i + 1] === "{") {
      const from = i;
      let depth = 0;
      while (i < source.length) {
        if (source[i] === "{") depth += 1;
        if (source[i] === "}") {
          depth -= 1;
          if (depth === 0) {
            i += 1;
            break;
          }
        }
        i += 1;
      }
      text += SLOT;
      // THE EXPRESSION IS KEPT, not just its position. Matching needs only the
      // position; a writer needs to see WHICH value fills the slot, and the
      // whole point of this rework is that `${floor}` is one slot spanning
      // "3.5x" rather than a stray `{n}` in front of a `.5` that never moves.
      display += source.slice(from, i).split(NL).join(" ");
      continue;
    }
    text += ch;
    display += ch;
    i += 1;
  }
  return null;
}

/**
 * Every concatenation chain in a file: runs of literals joined by `+`, with a
 * spliced identifier counting as a slot.
 */
export function chainsIn(source) {
  const clean = stripComments(source);
  const chains = [];
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (ch !== '"' && ch !== "'" && ch !== BACKTICK) {
      i += 1;
      continue;
    }
    const first = readLiteral(clean, i);
    if (!first) {
      i += 1;
      continue;
    }
    let text = first.text;
    let display = first.display;
    let at = first.end;
    // Keep consuming ` + <literal|identifier>` while the chain continues.
    for (;;) {
      let j = at;
      while (j < clean.length && (clean[j] === " " || clean[j] === NL || clean[j] === "\t" || clean[j] === "\r")) j += 1;
      if (clean[j] !== "+") break;
      j += 1;
      while (j < clean.length && (clean[j] === " " || clean[j] === NL || clean[j] === "\t" || clean[j] === "\r")) j += 1;
      const nextCh = clean[j];
      if (nextCh === '"' || nextCh === "'" || nextCh === BACKTICK) {
        const next = readLiteral(clean, j);
        if (!next) break;
        text += next.text;
        display += next.display;
        at = next.end;
        continue;
      }
      // A spliced identifier — `RECOGNITION_DISCLOSURE` and friends.
      let k = j;
      while (k < clean.length && /[A-Za-z0-9_.$()]/.test(clean[k])) k += 1;
      if (k === j) break;
      text += SLOT;
      // A spliced constant is a slot too, and shown as one.
      display += "${" + clean.slice(j, k) + "}";
      at = k;
    }
    /*
     * THE FLOOR IS ON THE LITERAL TEXT, NOT THE WHOLE CHAIN, and it is low.
     * At 25 characters of chain the roster line was discarded --
     * `${label}: caught at ${…}${…}` carries twelve characters of fixed text --
     * and reported as a rendering no template produced, which was a refusal
     * this file invented rather than found. Specificity ranking in
     * `matchesFor` is what keeps short chains from swallowing everything, so
     * the floor only has to exclude fragments too small to identify anything.
     */
    const literal = text.split(SLOT).join("").trim();
    if (literal.length > 8) chains.push({ text, display });
    i = at;
  }
  return chains;
}

/** Every chain across every vocabulary module, with the file it came from. */
export function allChains(files = moduleFiles()) {
  const out = [];
  for (const file of files) {
    for (const chain of chainsIn(readFileSync(file, "utf8"))) out.push({ file, ...chain });
  }
  return out;
}

/**
 * EVERY COPY MODULE, NOT JUST THE VOCABULARY LAYER (E19/S9).
 *
 * `moduleFiles()` is deliberately narrow: it is the roster the vocabulary deck
 * and the unrendered-template census work from, and widening it would change
 * what those two report. The INSTRUMENT deck draws on a different set — the
 * delicacy, bias, landing and learn modules — and its sentences could not be
 * matched to a template until this existed.
 *
 * DERIVED BY WALKING THE DIRECTORY, never typed. A copy module added tomorrow
 * is scanned tomorrow; that is the whole reason the census caught two modules
 * nobody had listed.
 */
export function contentFiles(dir = "src/content") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...contentFiles(path));
    else if (name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "fixtures.ts") out.push(path);
  }
  return out;
}

function escapeForRegex(text) {
  let out = "";
  for (const ch of text) {
    if ("\\^$.*+?()[]{}|/".indexOf(ch) !== -1) out += BACKSLASH + ch;
    else out += ch;
  }
  return out;
}

/** A chain becomes a full-match pattern, its slots becoming wildcards. */
export function matcherFor(chain) {
  const parts = chain.split(SLOT).map(escapeForRegex);
  return new RegExp("^" + parts.join("[" + BACKSLASH + "s" + BACKSLASH + "S]*?") + "$");
}

/**
 * Match one rendered sentence to the chains that could have produced it.
 *
 * WHEN SEVERAL MATCH, THE MOST SPECIFIC WINS -- most literal text outside its
 * slots. A chain that is almost all slot matches nearly anything and is never
 * the answer; a chain with 200 characters of fixed text that matches is the
 * template, not a coincidence. Ties are reported as ambiguous rather than
 * broken arbitrarily.
 */
export function matchesFor(rendering, chains) {
  const hits = chains.filter((chain) => matcherFor(chain.text).test(rendering));
  if (hits.length < 2) return hits;
  const weight = (chain) => chain.text.split(SLOT).join("").length;
  const best = Math.max(...hits.map(weight));
  return hits.filter((chain) => weight(chain) === best);
}

export const SLOT_MARKER = SLOT;
