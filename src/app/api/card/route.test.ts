import { describe, it, expect } from "vitest";
import * as route from "./route";

/**
 * THE RETIRED CARD ROUTE CANNOT BE MADE TO SAY ANYTHING (2026-09-24).
 *
 * It used to print `archetype`, `player` and `v` onto a PNG under our domain.
 * The guarantee now is structural: the handler takes no request, so nothing in
 * an address can reach it, and it is rendered once at build time. Crafted
 * addresses against a production build are in the commit that made this.
 */
describe("/api/card (retired)", () => {
  it("takes no request, so no part of an address can reach it", () => {
    expect(route.GET.length).toBe(0);
  });

  it("is rendered once at build time, not per request", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("sends everyone to the default preview image and draws nothing itself", async () => {
    const res = route.GET();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("/opengraph-image");
    expect(res.headers.get("content-type") ?? "").not.toMatch(/image/);
    expect(await res.text()).toBe("");
  });
});
