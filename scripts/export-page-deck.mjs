/**
 * THE PAGE COPY, WHICH NO DECK HAS EVER CARRIED (E18/S10, PM rulings RT-P9 a /
 * RT-Q1 a).
 *
 * WHAT WAS MISSING. Three decks enumerate the reading layer, four instrument
 * batches and the /method page. Eleven other surfaces -- the whole reading
 * room, /legal, and the Ranking Test's frame and hero captions -- keep their
 * prose inline in the component, so roughly two and a half thousand words of
 * what a reader actually sees had never appeared in any document for review.
 * This repo already ruled on that pattern in its own code: "a fragment in a
 * component is a fragment nothing reads. The hazard gate reads DECKS."
 *
 * IT READS SOURCE, AND THAT IS THE COMPROMISE, RULED (RT-Q1 a). The structural
 * answer is to move this prose into content modules so the pages render from a
 * deck and the voice gate screens it. That is eleven slices, each editing a
 * live page, and it would stand between the PM and a writing pass that is ruled
 * FIRST. So this extracts instead: it touches no component, cannot break a
 * page, and delivers the reading document now. Its weakness is stated on the
 * deck itself -- a source scan can drift from what renders, and the check
 * against a rendered page is a proof done once, not a standing guard.
 *
 * NO REGEX, AND THAT IS NOT STYLE. This file is written through a transport
 * that eats one level of backslash escaping; it has produced a real newline
 * inside a string literal three times in one session. A character scanner needs
 * no escapes. `segments()` in the slice latch is the same decision.
 *
 * SURFACES ARE FOUND ON DISK, NEVER TYPED. A hand-written roster cannot see a
 * new page, which is exactly how the Ranking Test's thirteen sentences stayed
 * out of the vocabulary deck for a week.
 *
 *   node scripts/export-page-deck.mjs > docs/copy-deck-pages.md
 */
import { readdirSync, readFileSync } from "node:fs";

const NL = String.fromCharCode(10);
/**
 * THESE FILES ARE CRLF, AND THE FIRST VERSION ONLY STRIPPED THE LF.
 *
 * The stray carriage returns survived into the deck, where they read back as
 * line breaks -- so a paragraph arrived split across four lines with the
 * blockquote marker on only the first, which looks like a broken extractor
 * rather than a whitespace bug. Found by reading the generated file and then
 * dumping the bytes, not by looking at the code.
 */
const CR = String.fromCharCode(13);
const TAB = String.fromCharCode(9);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const SQ = String.fromCharCode(39);
const DQ = String.fromCharCode(34);

/** Blocks whose text a reader sees as one run of prose. */
const BLOCKS = ["p", "h1", "h2", "h3", "li", "summary", "figcaption"];

/** Attributes that carry copy rather than configuration. */
const COPY_ATTRS = ["caption", "kicker", "label", "blurb", "placeholder"];

const ENTITIES = [
  ["&apos;", SQ],
  ["&quot;", DQ],
  ["&amp;", "&"],
  ["&nbsp;", " "],
  ["&mdash;", "—"],
  ["&hellip;", "…"],
  // The curly quotes, which the first version left raw on /learn/flaws.
  ["&ldquo;", "“"],
  ["&rdquo;", "”"],
  ["&lsquo;", "‘"],
  ["&rsquo;", "’"],
];

/**
 * Strip JSX tags and expressions from a block, leaving what renders.
 *
 * AN EXPRESSION BECOMES A VISIBLE SLOT rather than vanishing. A reader has to
 * know a number or a name is filled in there; a silently dropped slot makes a
 * sentence read as though it were shorter and more certain than it is. The
 * `{" "}` idiom is the JSX line-break space and becomes a space.
 */
function flatten(source) {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === LT) {
      // Skip the tag. Attribute strings can contain GT, so quotes are tracked.
      let quote = "";
      i += 1;
      while (i < source.length) {
        const c = source[i];
        if (quote) {
          if (c === quote) quote = "";
        } else if (c === SQ || c === DQ) {
          quote = c;
        } else if (c === GT) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (ch === "{") {
      let depth = 0;
      const start = i;
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
      const inner = source.slice(start + 1, i - 1).trim();
      if (inner === DQ + " " + DQ || inner === SQ + " " + SQ) out += " ";
      else if (inner.startsWith(DQ) || inner.startsWith(SQ)) out += inner.slice(1, -1);
      else out += "{" + inner.split(NL).join(" ") + "}";
      continue;
    }
    out += ch;
    i += 1;
  }
  for (const pair of ENTITIES) out = out.split(pair[0]).join(pair[1]);
  out = out.split(CR).join(" ").split(NL).join(" ").split(TAB).join(" ");
  while (out.indexOf("  ") !== -1) out = out.split("  ").join(" ");
  return out.trim();
}

/** Every block of prose in one component file, in the order it appears. */
function blocksIn(source) {
  const found = [];
  for (const tag of BLOCKS) {
    const open = LT + tag;
    const close = LT + "/" + tag + GT;
    let at = source.indexOf(open);
    while (at !== -1) {
      // `<p` must not match `<path`: the next character has to end the name.
      const after = source[at + open.length];
      if (after === GT || after === " " || after === NL) {
        const end = source.indexOf(close, at);
        if (end !== -1) {
          const text = flatten(source.slice(at, end));
          if (text.length > 3) found.push({ at, tag, text });
        }
      }
      at = source.indexOf(open, at + 1);
    }
  }
  // Copy that travels as an attribute: caption="…", kicker="…".
  for (const attr of COPY_ATTRS) {
    const needle = attr + "=" + DQ;
    let at = source.indexOf(needle);
    while (at !== -1) {
      const end = source.indexOf(DQ, at + needle.length);
      if (end !== -1) {
        const text = source.slice(at + needle.length, end).trim();
        if (text.length > 3 && text.indexOf("{") === -1) found.push({ at, tag: attr, text });
      }
      at = source.indexOf(needle, at + 1);
    }
  }
  return found.sort((a, b) => a.at - b.at);
}

/**
 * DOES THIS BLOCK CONTAIN WORDS, OR ONLY SLOTS?
 *
 * `/learn/flaws` is almost entirely `{FLAWS_INTRO}`, `{f.symptom}`,
 * `{f.mechanism}` -- its words live in `src/content/flaw-families.ts`, which the
 * instrument deck already enumerates. Printing those slots as though they were
 * copy gives the reader a section that looks broken and duplicates nothing
 * useful; dropping them silently would make the page look emptier than it is.
 * They are counted and named instead.
 */
function wordsOutsideSlots(text) {
  let out = "";
  let depth = 0;
  for (const ch of text) {
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (depth === 0) out += ch;
  }
  return out.split(" ").filter((w) => w.length > 1).length;
}

/** Every surface, found on disk rather than listed. */
export function surfaces() {
  const learn = readdirSync("src/app/learn", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      file: "src/app/learn/" + entry.name + "/page.tsx",
      route: "/learn/" + entry.name,
    }));
  const extra = [
    { file: "src/app/legal/page.tsx", route: "/legal" },
    { file: "src/app/spread/SpreadFlow.tsx", route: "/spread (the frame and the hero captions)" },
  ];
  return [...learn, ...extra].filter((surface) => {
    try {
      readFileSync(surface.file);
      return true;
    } catch {
      return false;
    }
  });
}

const lines = [];
lines.push("# Page copy deck - for a writing pass");
lines.push("");
lines.push(
  "**Generated, do not edit by hand.** `node scripts/export-page-deck.mjs > docs/copy-deck-pages.md`",
);
lines.push("");
lines.push(
  "Every paragraph, heading and caption a reader meets on these pages, pulled from the components " +
    "that render them. Surfaces are found on disk, so a new page appears here the day it ships.",
);
lines.push("");
lines.push("## How to use this");
lines.push("");
lines.push(
  "**This deck is a READING surface, not an editing one, and the other three are both.** They " +
    "enumerate strings that live in content modules, so an edit lands in one place. This copy sits " +
    "inline in the page components, so an edit has to be made in the `.tsx` file named under each " +
    "section. Moving it into modules is real work and was deliberately not done first, because it " +
    "would have stood between you and this document.",
);
lines.push("");
lines.push(
  "**It is a source scan, so it can drift from what renders.** Braces mark a value the page " +
    "computes rather than words on screen. Where a page imports its numbers from the modules that " +
    "compute them, that is deliberate and the slots must stay slots: typing the value in is how a " +
    "page drifts away from the instrument it describes.",
);
lines.push("");
lines.push(
  "**One rule is not negotiable, and it is on `/legal`.** It may not promise a paid tier and may " +
    "not describe the product as a personality reading. Both were live false claims until " +
    "2026-09-05, on the page a reader opens to find out what they are agreeing to.",
);
lines.push("");

const all = surfaces();
let words = 0;
let blocks = 0;
for (const surface of all) {
  const found = blocksIn(readFileSync(surface.file, "utf8"));
  if (found.length === 0) continue;
  lines.push("---");
  lines.push("");
  lines.push("## `" + surface.route + "`");
  lines.push("");
  lines.push("**Edits land in** `" + surface.file + "`.");
  lines.push("");
  let fromModules = 0;
  for (const block of found) {
    if (wordsOutsideSlots(block.text) < 3) {
      fromModules += 1;
      continue;
    }
    blocks += 1;
    words += block.text.split(" ").length;
    lines.push(block.tag === "h1" ? "> **" + block.text + "**" : "> " + block.text);
    lines.push("");
  }
  if (fromModules > 0) {
    lines.push(
      "*" + fromModules + " further block" + (fromModules === 1 ? "" : "s") + " on this page " +
        (fromModules === 1 ? "is" : "are") + " filled entirely from content modules, so the words " +
        "are reviewed in the earlier parts rather than here.*",
    );
    lines.push("");
  }
}

lines.push("---");
lines.push("");
lines.push(
  "**" + blocks + " blocks, roughly " + words + " words, across " + all.length + " surfaces.**",
);
lines.push("");
process.stdout.write(lines.join(NL));
