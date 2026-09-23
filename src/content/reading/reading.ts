/**
 * A LISTENER'S READING, END TO END: habits -> plays -> facts -> lines.
 *
 * Deterministic. The same listener always yields the same plays and the same
 * lines, which is what lets a reviewer check a receipt and a test recompute it.
 */
import { generatePlays } from "@/engine/reading/generate";
import { allFacts, pickFacts, type Fact } from "@/engine/reading/patterns";
import { readingLine, type ReadingLine } from "./lines";
import type { Listener, Play } from "./types";

export interface Reading {
  listener: Listener;
  plays: Play[];
  facts: Fact[];
  lines: ReadingLine[];
}

export function readingFor(l: Listener): Reading {
  const plays = generatePlays(l);
  const facts = pickFacts(allFacts(plays, l));
  return { listener: l, plays, facts, lines: facts.map((f) => readingLine(f, l)) };
}
