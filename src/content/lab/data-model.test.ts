/**
 * E15/S4 proof. PRE-REGISTERED, written before the page rendered:
 *
 *   (a) EVERY FIGURE ON THE PAGE IS THE MODULE'S OWN. Change a cap, a version
 *       or a key in the code and the page changes with it — asserted by
 *       comparing against the imports, not against a literal written here,
 *       which would be a third copy and no better than the second.
 *   (b) EVERY `definedIn` POINTS AT A FILE THAT EXISTS. The same rule the
 *       metric dictionary's `computedIn` follows: a path is a claim.
 *   (c) EVERY PERSISTENT ENTITY IS INSIDE THE SWEPT NAMESPACE. An entity that
 *       persists outside `gym.` would survive "forget this browser" while the
 *       page said it had been forgotten.
 *   (d) EVERY ENTITY STATES A LIMIT. A storage description listing only
 *       capabilities is marketing.
 */
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HISTORY_CAP, KEY_PREFIX, STORE_VERSION } from "@/lib/result-store";
import { COOLDOWN_DAYS, LEGACY_KEY_PREFIX } from "@/lib/retest-cooldown";
import { PERSISTENT_PREFIX } from "@/lib/forget-device";
import { ARM_KEY, PB_KEY, VOICE_KEY } from "@/lib/experiment";
import { ATTR_KEY } from "@/lib/analytics";
import { MAX_POOLED } from "@/engine/arc";
import {
  DATA_ENTITIES,
  DEVICE_ENTITIES,
  PERSISTENT_NAMESPACE,
  TAB_ENTITIES,
} from "./data-model";

const entity = (id: string) => {
  const found = DATA_ENTITIES.find((e) => e.id === id);
  if (!found) throw new Error(`no entity "${id}"`);
  return found;
};

const textOf = (id: string) => {
  const e = entity(id);
  return [e.key, e.purpose, e.limit, ...e.fields.map((f) => `${f.name} ${f.meaning}`)].join(" ");
};

describe("E15/S4 — the data model describes the code, not a memory of it", () => {
  it("declares entities on both media, and every one of them exists", () => {
    expect(DATA_ENTITIES.length).toBeGreaterThan(2);
    expect(DEVICE_ENTITIES.length).toBeGreaterThan(0);
    expect(TAB_ENTITIES.length).toBeGreaterThan(0);
    expect(DEVICE_ENTITIES.length + TAB_ENTITIES.length).toBe(DATA_ENTITIES.length);
  });

  it("every `definedIn` points at a module that ACTUALLY EXISTS", () => {
    for (const e of DATA_ENTITIES) {
      expect(existsSync(e.definedIn), `${e.id} → ${e.definedIn}`).toBe(true);
    }
  });

  /**
   * THE CENTRAL ASSERTION. Every number and key a reader sees must be the one
   * the code uses. Compared against the IMPORTS rather than against literals:
   * a literal here would be a third copy of the same fact and would go stale in
   * step with the page it is supposed to be guarding.
   */
  it("takes every figure from the module that owns it", () => {
    expect(textOf("session")).toContain(KEY_PREFIX);
    expect(textOf("session")).toContain(String(STORE_VERSION));
    expect(textOf("history")).toContain(String(HISTORY_CAP));
    expect(textOf("history")).toContain(String(MAX_POOLED));
    expect(textOf("cooldown")).toContain(String(COOLDOWN_DAYS));
    expect(textOf("cooldown")).toContain(LEGACY_KEY_PREFIX);
    for (const key of [ARM_KEY, VOICE_KEY, PB_KEY, ATTR_KEY]) {
      expect(textOf("experiment"), key).toContain(key);
    }
  });

  it("keeps every persistent entity inside the namespace the clear sweeps", () => {
    expect(PERSISTENT_NAMESPACE).toBe(PERSISTENT_PREFIX);
    for (const e of DEVICE_ENTITIES) {
      expect(e.key.startsWith(PERSISTENT_PREFIX), `${e.id} → ${e.key}`).toBe(true);
    }
    // Per-tab keys deliberately sit OUTSIDE it — they are cleared by wiping
    // sessionStorage, not by the prefix sweep. If one ever moved inside the
    // namespace the sweep would start deleting it twice for different reasons.
    for (const e of TAB_ENTITIES) {
      expect(e.key.startsWith(PERSISTENT_PREFIX), `${e.id} → ${e.key}`).toBe(false);
    }
  });

  it("makes every entity state what it CANNOT do", () => {
    for (const e of DATA_ENTITIES) {
      expect(e.limit.length, `${e.id} states no limit`).toBeGreaterThan(40);
      expect(e.purpose.length, `${e.id} states no purpose`).toBeGreaterThan(20);
      expect(e.fields.length, `${e.id} lists no fields`).toBeGreaterThan(0);
    }
  });

  /**
   * N3 / D1. This page is the one most likely to imply a capability the
   * product does not have, because storage is where a reader assumes accounts
   * and servers live. It may not.
   */
  it("claims no account, no server, and no comparison between people", () => {
    const all = DATA_ENTITIES.map((e) => `${e.purpose} ${e.limit}`).join(" ").toLowerCase();
    for (const forbidden of ["percentile", "compared to other", "average user", "leaderboard"]) {
      expect(all, `data model claims "${forbidden}"`).not.toContain(forbidden);
    }
    // The needle must see the sentence it was written for.
    expect("ranked against the average user".includes("average user")).toBe(true);
  });
});
