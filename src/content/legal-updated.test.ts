/**
 * THE TERMS CANNOT CHANGE WITHOUT THEIR DATE CHANGING (E19/S13).
 *
 * `/legal` tells a reader when the terms were last updated. Cowork's batch-2
 * return flagged the date as hand-written: correct the day it shipped and wrong
 * every day after the next edit. Moving it into a constant does nothing about
 * that — the failure is not that the date is hard to change, it is that
 * changing the page does not change the date.
 *
 * SO THIS HASHES THE TERMS. Edit a word and the fingerprint moves; if the date
 * has not moved with it, the page is making a false claim on the one surface
 * where a reader has gone looking for the truth, and the build says so.
 *
 * IT HASHES THE PROSE, NOT THE FILE. Class names, imports and comments change
 * for reasons that have nothing to do with what a reader agreed to, and a
 * tripwire that fires on a reformat is a tripwire somebody disables. Only the
 * text between tags counts.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { LEGAL_COPY_FINGERPRINT, LEGAL_LAST_UPDATED } from "./legal-updated";

const NL = String.fromCharCode(10);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);

/**
 * The words a reader sees, in order. Written as a scanner rather than a pattern
 * for the reason this session has now paid for twice: the transport eats one
 * level of escaping, and a regex that quietly matches nothing reports success.
 */
function proseOf(source: string): string {
  let out = "";
  let depth = 0;
  for (const ch of source) {
    if (ch === LT) depth += 1;
    else if (ch === GT) depth = Math.max(0, depth - 1);
    else if (depth === 0) out += ch;
  }
  return out.split(NL).map((line) => line.trim()).filter((line) => line.length > 0).join(" ");
}

const prose = () => proseOf(readFileSync("src/app/legal/page.tsx", "utf8"));
const fingerprint = () => createHash("sha256").update(prose()).digest("hex").slice(0, 16);

describe("the last-updated date on /legal", () => {
  it("reads real prose, so the hash below is not hashing nothing", () => {
    const text = prose();
    expect(text.length, "the prose scan found almost nothing").toBeGreaterThan(600);
    expect(text, "the scan lost the terms themselves").toContain("local storage");
  });

  it("is a date the page actually shows", () => {
    expect(readFileSync("src/app/legal/page.tsx", "utf8")).toContain("LEGAL_LAST_UPDATED");
    expect(LEGAL_LAST_UPDATED.length).toBeGreaterThan(4);
  });

  /**
   * THE TRIPWIRE. When this fails, the terms changed: decide whether the change
   * was substantive. If it was, move `LEGAL_LAST_UPDATED` to the month it
   * changed. Either way, paste the printed fingerprint into
   * `LEGAL_COPY_FINGERPRINT` — that is the record of what the date refers to.
   */
  it("still refers to the terms as they are now", () => {
    const now = fingerprint();
    expect(
      now,
      `The terms on /legal have changed since they were last dated "${LEGAL_LAST_UPDATED}".` + NL +
        `If the change was substantive, move LEGAL_LAST_UPDATED. Then set` + NL +
        `LEGAL_COPY_FINGERPRINT to: ${now}`,
    ).toBe(LEGAL_COPY_FINGERPRINT);
  });
});
