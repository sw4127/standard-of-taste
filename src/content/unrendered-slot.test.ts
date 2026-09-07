/**
 * A SLOT INSIDE A PLAIN STRING RENDERS AS SOURCE CODE (E19/S18).
 *
 * WHAT SHIPPED. E19/S15 replaced a hand-written arc floor in the reading-room
 * FAQ with `${PITCH_FLOOR_TIMES}` — into a double-quoted string. TypeScript
 * does not interpolate those, so the page rendered, to real readers, the words
 * "differ by roughly ${PITCH_FLOOR_TIMES} times". It was pushed.
 *
 * AND THE GUARD THAT SHOULD HAVE CAUGHT IT PASSED, which is the part worth
 * keeping. `stated-quantities.test.ts` checks that a hand-written number is
 * GONE from the prose. It was gone. Nothing checked that what replaced it was a
 * working slot rather than the text of one — an absence test cannot tell a fix
 * from a different defect.
 *
 * Nothing else could catch it either: tsc is happy, lint only muttered about an
 * unused constant, and the copy deck showed the braces to a reader who was not
 * looking for them. The one signal was the variable nobody used.
 *
 * NO REGEX. A scanner, because the transport eats one level of escaping and
 * this session has shipped two guards that quietly matched nothing that way.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const BACKSLASH = String.fromCharCode(92);
const BACKTICK = String.fromCharCode(96);
const DQ = String.fromCharCode(34);
const SQ = String.fromCharCode(39);

function sourcesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path));
    else if ((name.endsWith(".ts") || name.endsWith(".tsx")) && !name.endsWith(".test.ts") && !name.endsWith(".test.tsx")) {
      out.push(path);
    }
  }
  return out;
}

/**
 * Every `${` that sits inside a quote which will NOT interpolate it. Walks the
 * file tracking which delimiter it is inside, so a template literal's slots and
 * a comment's prose are both left alone.
 */
function deadSlots(source: string): string[] {
  const found: string[] = [];
  let quote: string | null = null;
  let i = 0;
  let line = 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === NL) line += 1;
    if (quote === null) {
      // Skip comments wholesale: prose about a slot is not a slot.
      if (ch === "/" && source[i + 1] === "*") {
        const end = source.indexOf("*/", i + 2);
        const skipped = source.slice(i, end === -1 ? source.length : end + 2);
        line += skipped.split(NL).length - 1;
        i = end === -1 ? source.length : end + 2;
        continue;
      }
      if (ch === "/" && source[i + 1] === "/") {
        const end = source.indexOf(NL, i);
        i = end === -1 ? source.length : end;
        continue;
      }
      if (ch === DQ || ch === SQ || ch === BACKTICK) quote = ch;
      i += 1;
      continue;
    }
    if (ch === BACKSLASH) {
      i += 2;
      continue;
    }
    if (ch === quote) {
      quote = null;
      i += 1;
      continue;
    }
    if (quote !== BACKTICK && ch === "$" && source[i + 1] === "{") {
      const end = source.indexOf("}", i);
      found.push(`line ${line}: ${source.slice(i, end === -1 ? i + 30 : end + 1)}`);
    }
    i += 1;
  }
  return found;
}

describe("slots that would render as their own source", () => {
  const FILES = [...sourcesUnder("src/content"), ...sourcesUnder("src/app"), ...sourcesUnder("src/components")];

  it("found sources to scan, so this is not vacuous", () => {
    expect(FILES.length).toBeGreaterThan(40);
    // The scanner must actually recognise a dead slot when it sees one.
    expect(deadSlots(DQ + "roughly ${X} times" + DQ).length).toBe(1);
    // ...and must NOT flag a real template literal.
    expect(deadSlots(BACKTICK + "roughly ${X} times" + BACKTICK).length).toBe(0);
  });

  it("finds none in anything a reader sees", () => {
    const dead: string[] = [];
    for (const file of FILES) {
      for (const hit of deadSlots(readFileSync(file, "utf8"))) dead.push(`${file} ${hit}`);
    }
    expect(
      dead,
      "these are interpolations inside a NON-template string. TypeScript will not evaluate them, " +
        "so the page prints the braces and the variable name to a real reader:" + NL + dead.join(NL),
    ).toEqual([]);
  });
});
