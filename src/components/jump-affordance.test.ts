import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * E7/S22 — IF IT MOVES YOU, IT LOOKS LIKE IT MOVES YOU.
 *
 * The PM's complaint was that jumping around the product is unclear: at rest
 * you cannot tell what is clickable, because a link is body text with an
 * underline and underlines also mean emphasis. The answer (RT-154 a) is a
 * second typeface — mono reads as *interface* — carried by one component so
 * the rule is real rather than a habit.
 *
 * WHAT THIS DOES NOT POLICE, deliberately. Prose links inside /learn articles
 * carry the accent colour instead of an underline, by a PM ruling from
 * 2026-07-17, and `learn/layout.tsx` records that bare underline-and-arrow
 * links "read cheap" there. Those are decisions, not oversights, and a guard
 * that overruled them would be me relitigating a ruling with a regex. Prose is
 * exempt; standalone navigation is not.
 *
 * Pill buttons are also exempt — an accent-filled pill is a different
 * affordance with its own rules (see `readableOn` and gym-ink.test.ts).
 */
const NL = String.fromCharCode(10);

/** The instrument surfaces. Not /learn — see the note above. */
const GYM = ["src/app/bias", "src/app/delicacy", "src/app/threshold", "src/app/lab"];

function gymFiles(): string[] {
  return execSync(`git ls-files ${GYM.map((d) => `"${d}"`).join(" ")}`, { encoding: "utf8" })
    .trim()
    .split(NL)
    .filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f));
}

describe("E7/S22 — navigational text is recognisable at rest", () => {
  it("no gym surface hand-rolls an underlined text link", () => {
    const offenders: string[] = [];
    for (const file of gymFiles()) {
      readFileSync(file, "utf8")
        .split(NL)
        .forEach((line, i) => {
          if (!/className="[^"]*\bunderline\b/.test(line)) return;
          // A pill is a button, not a text jump.
          if (/rounded-full/.test(line)) return;
          // group-hover underlines belong to card-wrapping links, which are a
          // whole tappable surface rather than a word in a sentence.
          if (/group-hover:underline/.test(line)) return;
          offenders.push(`${file}:${i + 1}  ${line.trim().slice(0, 70)}`);
        });
    }
    expect(
      offenders,
      "These are text links styled by hand instead of using <Jump>, so they do not read " +
        "as clickable at rest and will drift from the ones that do:" + NL + offenders.join(NL),
    ).toEqual([]);
  });

  it("the component actually sets the mono face", () => {
    // The whole affordance is one class. If it is ever dropped, every jump in
    // the product silently becomes body text again and nothing else notices.
    const src = readFileSync("src/components/Jump.tsx", "utf8");
    expect(src, "Jump no longer sets font-mono").toMatch(/font-mono/);
    expect(src, "Jump no longer offers a visible focus state").toMatch(/focus-visible/);
    expect(src, "Jump no longer guarantees a 44px tap target").toMatch(/min-h-\[44px\]/);
  });

  it("the gym actually uses it, so this is not vacuous", () => {
    const users = gymFiles().filter((f) => /<Jump\b/.test(readFileSync(f, "utf8")));
    expect(users.length, "nothing uses <Jump> — the check above passes by having no subject").toBeGreaterThan(2);
  });
});
