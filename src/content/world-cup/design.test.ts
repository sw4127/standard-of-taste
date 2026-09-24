import { describe, it, expect } from "vitest";
import { buildCardDesign, NATIONS } from "./design";

describe("buildCardDesign", () => {
  it("uses the nationality accent on a neutral base (no clash)", () => {
    const d = buildCardDesign({ position: "striker", nation: "NOR" });
    expect(d.palette.accent).toBe(NATIONS.NOR.accent);
    // Base is neutral chrome, not nationality-tinted, so colours never fight.
    expect(d.palette.from).toBe("#0c0d12");
    expect(d.palette.to).toBe("#070709");
  });

  it("falls back gracefully for an unknown nation", () => {
    const d = buildCardDesign({ position: "striker", nation: "ZZZ" });
    expect(d.palette.accent).toBeTruthy();
    expect(d.caption).toBe("Central Striker");
  });

  it("builds a factual position · nation caption", () => {
    expect(buildCardDesign({ position: "defender", nation: "NED" }).caption).toBe(
      "Defender · Netherlands",
    );
  });

  it("is deterministic", () => {
    const a = buildCardDesign({ position: "winger", nation: "BRA" });
    const b = buildCardDesign({ position: "winger", nation: "BRA" });
    expect(a).toEqual(b);
  });
});

