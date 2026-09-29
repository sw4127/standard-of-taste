/**
 * THE LOOKUP FROM AN ENGLISH SENTENCE TO ITS CHINESE (bilingual Part 2, 2026-09-29).
 *
 * The Chinese is AUTHORED, not generated: every sentence lives in a dictionary
 * under `src/content/zh/copy/`, written before the build and held there by
 * `zh-style.test.ts` to the owner's rules. Nothing here translates. BA-10 (no
 * model writes any sentence a visitor reads) governs text made at run time, and
 * there is none: the brief's words, "No runtime machine translation, of any
 * kind", are the reason this file is a table lookup and nothing more.
 *
 * THE KEY IS THE ENGLISH ITSELF. A dictionary maps the exact English sentence a
 * page renders to its Chinese, so the day the English changes, its Chinese stops
 * being found, and `site-zh.test.tsx` fails on the miss rather than the Chinese
 * page quietly saying something the English no longer says. That is the drift
 * this repository keeps paying for, stopped at the key.
 *
 * SLOTS, NOT TYPED NUMBERS. A sentence with a number takes it as `{name}` in
 * both languages (`{plays} plays` and its Chinese both carry `{plays}`), so the Chinese can never
 * state a count the English does not; `site-zh.test.tsx` checks that every
 * Chinese value has the same slots as its key and no digit its key lacks.
 *
 * A MISS FALLS BACK TO THE ENGLISH, so a page never breaks for a reader, and is
 * recorded in `globalThis.__ZH_MISSES` when a test has set it, so it never ships.
 */
import { Fragment, createElement, type ReactNode } from "react";
import type { Locale } from "./locale";

export type { Locale };
export type Dict = Readonly<Record<string, string>>;
export type Slots = Readonly<Record<string, string | number>>;

declare global {
  var __ZH_MISSES: Set<string> | undefined;
}

/** Replace each `{name}` with its slot. An unfilled slot is left visible, never blanked. */
export function fill(template: string, slots?: Slots): string {
  if (!slots) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in slots ? String(slots[k]) : m));
}

/** The sentence in `locale`: the English itself, or its Chinese from `dict`. */
export function tr(locale: Locale, dict: Dict, en: string, slots?: Slots): string {
  if (locale === "en") return fill(en, slots);
  const zh = dict[en];
  if (zh === undefined) {
    globalThis.__ZH_MISSES?.add(en);
    return fill(en, slots);
  }
  return fill(zh, slots);
}

export type T = (en: string, slots?: Slots) => string;

/** A translator bound to one locale and one dictionary. */
export function tFor(locale: Locale, dict: Dict): T {
  return (en, slots) => tr(locale, dict, en, slots);
}

/**
 * A sentence with elements inside it: `{name}` slots are filled with nodes, in
 * whatever order the language puts them: the translated template, then a map
 * from each slot name to the element that fills it.
 */
export function rich(text: string, parts: Readonly<Record<string, ReactNode>>): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\{(\w+)\}/g)) {
    if (!(m[1] in parts)) continue;
    out.push(text.slice(last, m.index), createElement(Fragment, { key: `${m[1]}-${m.index}` }, parts[m[1]]));
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}
