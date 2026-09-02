/**
 * WHAT THIS PRODUCT KEEPS, AND WHERE (E15/S4, Track J1).
 *
 * WHY THIS PAGE CAN EXIST AT ALL. Most of the Lab is gated on data nobody has
 * yet. The data model is not: it is a fact about the code, describable today,
 * completely, with nothing simulated and nothing waiting on a cohort. It is
 * also the panel a reader assessing this work looks for first, because it is
 * the one that shows whether the storage was designed or accumulated.
 *
 * EVERY FIGURE IS IMPORTED FROM THE MODULE THAT OWNS IT. Not one key, cap or
 * version number is typed here. This is the same rule the metric dictionary
 * follows for formulas and the instrument-limits page follows for measured
 * limits, and it exists because this repo has repeatedly shipped a page that
 * described the code correctly on the day it was written and incorrectly a
 * month later. E15/S1 removed the last three instances of that on public pages.
 *
 * THE HONEST SHAPE OF THIS PRODUCT'S STORAGE, stated because it is unusual and
 * a reader will assume otherwise: there is no database, no account, and no
 * server-side record of any person. Everything below lives in the reader's own
 * browser. RT-G(b) ruled that deliberately — a database with no traffic in it
 * is all cost and no asset — and the limits that follow are stated on the page
 * rather than in a footnote.
 *
 * IT STORES ANSWERS, NEVER RESULTS, and that is the design rather than an
 * implementation detail, so the page says it: a stored session is the same
 * bytes a share link carries, re-scored through the same engine on every read.
 * Caching computed numbers would make this a second source of truth for every
 * figure the product prints.
 */

import { HISTORY_CAP, KEY_PREFIX, STORE_VERSION } from "@/lib/result-store";
import { COOLDOWN_DAYS, LEGACY_KEY_PREFIX } from "@/lib/retest-cooldown";
import { PERSISTENT_PREFIX } from "@/lib/forget-device";
import { ARM_KEY, PB_KEY, VOICE_KEY } from "@/lib/experiment";
import { ATTR_KEY } from "@/lib/analytics";
import { MAX_POOLED } from "@/engine/arc";

/** Where a record lives, which is the fact that decides everything else. */
export type StoreMedium =
  /** `localStorage` — survives closing the browser; lost with site data. */
  | "device"
  /** `sessionStorage` — one tab, gone when it closes. */
  | "tab";

export interface DataField {
  name: string;
  /** What it holds, in a reader's terms — never a type signature. */
  meaning: string;
}

export interface DataEntity {
  id: string;
  title: string;
  medium: StoreMedium;
  /** The literal key or key pattern, imported from the owning module. */
  key: string;
  /** Repo-relative path of the module that owns it. Existence is asserted. */
  definedIn: string;
  /** What it is for. */
  purpose: string;
  fields: DataField[];
  /**
   * WHAT IT CANNOT DO. Required on every entity — a storage description that
   * lists only capabilities is marketing. These are the limits that decide
   * whether a reader should trust anything built on top.
   */
  limit: string;
}

export const DATA_ENTITIES: DataEntity[] = [
  {
    id: "session",
    title: "A finished session",
    medium: "device",
    key: `${KEY_PREFIX}<instrument>`,
    definedIn: "src/lib/result-store.ts",
    purpose:
      "The raw answers from one completed sitting — the only thing this product records about a " +
      "person. Threshold sessions are kept per ladder, so measuring pitch and then compression " +
      "keeps both.",
    fields: [
      { name: "payload", meaning: "the answers themselves, in exactly the form a share link carries" },
      { name: "poolVersion", meaning: "which version of the item pool those answers were given against" },
      { name: "savedAt", meaning: "when the sitting finished" },
      { name: "v", meaning: `the envelope format, currently ${STORE_VERSION}` },
    ],
    limit:
      "No result is stored — only answers. Every number is recomputed on read, so a stored " +
      "session and a shared link cannot disagree, and editing the store by hand can only change " +
      "which answers you claim to have given. Answers recorded against an older pool are dropped " +
      "rather than scored against a pool that has since been reordered.",
  },
  {
    id: "history",
    title: "The history behind an arc",
    medium: "device",
    key: `${KEY_PREFIX}threshold.<ladder>`,
    definedIn: "src/lib/result-store.ts",
    purpose:
      "Sittings in time order, so a later session can be compared against the same person's " +
      "earlier ones. This is what makes the retest arc possible.",
    fields: [
      { name: "sessions[]", meaning: `up to ${HISTORY_CAP} sittings, oldest evicted first` },
      {
        name: "(read order)",
        meaning: `an arc pools at most ${MAX_POOLED} sittings a side, weighted toward the newest`,
      },
    ],
    limit:
      "It cannot be ranked. There is no way to ask this store for a best, a maximum or a " +
      "personal record — a history invites 'your best result', which is selection on the answer " +
      "and the exact bias the Prestige Test exists to measure. Beyond the cap the oldest " +
      "sittings are dropped, and nothing on screen says they existed.",
  },
  {
    id: "cooldown",
    title: "The retest gate",
    medium: "device",
    /**
     * THE KEY IT READS, NOT THE KEY IT USED TO OWN (found by reading the built
     * page, E15/S4). The first draft put `gym.lastCompleted.<family>` in the
     * prominent code block while the fields underneath said the gate owns no
     * key any more — the most emphasised thing on the entity was the one part
     * of it that is retired. It reads the session store first and falls back to
     * the old key only for browsers that predate the store, so the store is
     * what belongs here and the retired key is named below.
     */
    key: `${KEY_PREFIX}threshold.<ladder>`,
    definedIn: "src/lib/retest-cooldown.ts",
    purpose:
      `Whether ${COOLDOWN_DAYS} days have passed since this family was last measured. A retest ` +
      "taken too soon measures memory rather than hearing, so the gate is about validity, not " +
      "about withholding anything.",
    fields: [
      {
        name: "(nothing of its own)",
        meaning:
          "the gate owns no key — it asks the session history above when this family was last " +
          "measured, so finishing a session cannot write two records that disagree",
      },
      {
        name: LEGACY_KEY_PREFIX + "<family>",
        meaning:
          "retired. Read only when the session store has nothing, which means a browser that " +
          "finished a session before the store existed. Nothing writes it, so it drains on its own",
      },
    ],
    limit:
      "Device-local, and anyone who wants to can clear it. That is fine: it catches the person " +
      "who forgot, not the person who insists, and the screen explains before any retest why an " +
      "early number is worse.",
  },
  {
    id: "experiment",
    title: "Which variant this tab is seeing",
    medium: "tab",
    key: [ARM_KEY, VOICE_KEY, PB_KEY, ATTR_KEY].join(" · "),
    definedIn: "src/lib/experiment.ts",
    purpose:
      "A coin flip held still for the length of one visit, plus where the visit came from, so a " +
      "reload cannot re-randomise a person and double-count them.",
    fields: [
      { name: ARM_KEY, meaning: "which onboarding variant this tab was assigned" },
      { name: VOICE_KEY, meaning: "which voice variant the reading is written in" },
      { name: PB_KEY, meaning: "what the visitor said they believed before measuring" },
      { name: ATTR_KEY, meaning: "the referral parameters the visit arrived with" },
    ],
    limit:
      "One tab only, and gone when it closes. Nothing here is a profile and none of it is joined " +
      "to a session record.",
  },
];

/**
 * EVERYTHING PERSISTENT SHARES ONE NAMESPACE, which is what makes "forget this
 * browser" a sweep rather than a list of keys somebody has to remember to
 * update. Imported, so the page cannot claim a prefix the code does not use.
 */
export const PERSISTENT_NAMESPACE = PERSISTENT_PREFIX;

/** Every declared entity, validated at module load — see the docblock. */
for (const entity of DATA_ENTITIES) {
  if (entity.medium === "device" && !entity.key.startsWith(PERSISTENT_NAMESPACE)) {
    throw new Error(
      `data-model: "${entity.id}" claims to persist under "${entity.key}", outside the ` +
        `"${PERSISTENT_NAMESPACE}" namespace that "forget this browser" sweeps`,
    );
  }
  if (!entity.limit.trim()) {
    throw new Error(`data-model: "${entity.id}" describes storage without stating its limit`);
  }
}

export const DEVICE_ENTITIES = DATA_ENTITIES.filter((e) => e.medium === "device");
export const TAB_ENTITIES = DATA_ENTITIES.filter((e) => e.medium === "tab");
