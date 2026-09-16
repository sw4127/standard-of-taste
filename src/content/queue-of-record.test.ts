/**
 * NOTHING PLANNED DROPS OUT BECAUSE A SESSION FORGOT IT (2026-09-13).
 *
 * WHY THIS FILE EXISTS, in the owner's words: a session that was handed several
 * new directions at once might close and lose what was already planned. The
 * risk is real and structural rather than a matter of care —
 * `docs/blueprint-phase-2.md` and `docs/blueprint-phase-3.md` are UNTRACKED, so
 * the queue lives on one machine, in files a fresh clone cannot open. Phase 3's
 * own finding ③ names that as the project's largest instance of its signature
 * defect, and the planning file is the instance.
 *
 * THE RULE THE GUARD ENFORCES: every track letter from every phase appears in
 * `docs/queue-of-record.md`, and each carries a status. A track cannot leave by
 * being forgotten — only by being marked done or killed, which is a visible act
 * in a diff.
 *
 * WHAT IT CANNOT DO, said plainly: it cannot tell whether a status is TRUE. It
 * checks that every track is accounted for and that the accounting uses words
 * that mean something. A wrong "done" passes this and is caught only by a
 * person reading it.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const QUEUE = "docs/queue-of-record.md";

/** Phase 2's tracks, then Phase 3's. Letters are the blueprints' own. */
const PHASE_TWO = ["G", "H", "I", "J", "K", "L", "M"];
const PHASE_THREE = ["N", "O", "P", "Q", "R", "S"];
/*
 * PHASE 4 (2026-09-16) HAS NO BLUEPRINT AT ALL, WHICH IS WHY IT IS HERE.
 *
 * Tracks T and U were opened by an activation prompt — a file on one machine,
 * pasted into one session, which is a weaker carrier than the untracked
 * blueprints this guard already exists to compensate for. A blueprint at least
 * survives on disk. So the two letters go into the roster the moment they are
 * opened rather than when they are finished, and the queue has to account for
 * them or the suite goes red.
 */
const PHASE_FOUR = ["T", "U"];

/** Words that count as a status. Anything else is not an accounting. */
const STATUSES = ["done", "OPEN", "PARTLY DONE", "killed", "moot"];

describe("the queue of record accounts for every planned track", () => {
  const queue = readFileSync(QUEUE, "utf8");

  it("is tracked, unlike the blueprints it carries", () => {
    expect(existsSync(QUEUE)).toBe(true);
    expect(queue.length, "the queue is empty").toBeGreaterThan(2000);
  });

  it("names every track from every phase", () => {
    const missing: string[] = [];
    for (const letter of [...PHASE_TWO, ...PHASE_THREE, ...PHASE_FOUR]) {
      // The table writes them as "**G** — persistence".
      if (queue.indexOf(`**${letter}** —`) === -1) missing.push(letter);
    }
    expect(
      missing,
      "these tracks were opened somewhere and are not in the tracked queue, so they exist only in " +
        "a file a fresh clone cannot open:" + NL + missing.join(", "),
    ).toEqual([]);
  });

  it("gives every track a status that means something", () => {
    const unstated: string[] = [];
    for (const letter of [...PHASE_TWO, ...PHASE_THREE, ...PHASE_FOUR]) {
      const at = queue.indexOf(`**${letter}** —`);
      if (at === -1) continue;
      const row = queue.slice(at, queue.indexOf(NL, at));
      /*
       * CASE-INSENSITIVE, AND IT COST A BLOCKED PUSH TO LEARN. A row written
       * "**DONE, and it did not mean what it sounded like**" failed a check
       * whose list holds "done" — so the guard reported that a track had NO
       * status while looking straight at one, which is the worst kind of
       * failure message: precise, confident and about the wrong thing. Case is
       * formatting. The word is the meaning.
       */
      const flat = row.toLowerCase();
      if (!STATUSES.some((status) => flat.indexOf(status.toLowerCase()) !== -1)) {
        unstated.push(`${letter}: ${row.slice(0, 90)}`);
      }
    }
    expect(
      unstated,
      "these tracks are listed without a status, which is a row that looks like an accounting and " +
        "is not one:" + NL + unstated.join(NL),
    ).toEqual([]);
  });

  it("still carries the owner actions a session cannot discharge", () => {
    for (const item of ["GitHub Support", "backup refs", "engine package"]) {
      expect(
        queue.indexOf(item),
        `the queue has lost "${item}" — an owner action that no session can do and every session ` +
          "has to carry",
      ).toBeGreaterThan(-1);
    }
  });

  /*
   * A TASK BRIEF THAT NOTHING POINTS AT IS THE DEFECT THIS PROJECT ALREADY PAID
   * FOR. Four copy batches sat unactioned for weeks because each handoff copied
   * the line forward and nobody could tell what the line meant; writing a brief
   * fixes half of that, and the other half is the brief being findable from the
   * one file a session is told to read. So every `docs/task-*.md` must be named
   * in the queue.
   */
  it("names every task brief that exists on disk", () => {
    const briefs = readdirSync("docs").filter((n) => n.startsWith("task-") && n.endsWith(".md"));
    expect(briefs.length, "no task briefs found, so this checks nothing").toBeGreaterThan(0);
    const orphaned = briefs.filter((name) => queue.indexOf(name) === -1);
    expect(
      orphaned,
      "these task briefs exist and the queue does not mention them, so the only way to find them is " +
        "to already know they are there:" + NL + orphaned.join(NL),
    ).toEqual([]);
  });

  /*
   * A RULING ONLY ONE MACHINE CAN READ IS ONE A LATER SESSION RE-OPENS.
   *
   * That is not a hypothesis. RT-I was ruled on 2026-09-01 and three successive
   * handoffs carried it as still awaiting an answer, because the ruling lived in
   * an untracked blueprint; this session nearly spent a second ruling on it. The
   * `rt-answers-*.md` series is the fix — tracked on purpose — and this keeps
   * the queue pointing at it, so the one file a session is told to read names
   * where the settled decisions are.
   */
  it("points at the tracked rulings, which the blueprints are not", () => {
    const rulings = readdirSync("docs").filter(
      (name) => name.startsWith("rt-answers-") && name.endsWith(".md"),
    );
    expect(rulings.length, "no rulings-of-record files exist at all").toBeGreaterThan(1);
    const newest = rulings.sort()[rulings.length - 1];
    expect(
      queue.indexOf(newest),
      `the queue does not name ${newest}, the most recent rulings of record. A session reading only ` +
        "the queue would not know where the settled decisions are, which is how a ruling gets made " +
        "twice.",
    ).toBeGreaterThan(-1);
  });
});
