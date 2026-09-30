/**
 * /zh/lab KEEPS WHAT MAKES /lab WORTH READING (bilingual Part 2).
 *
 * The Lab's claims are numbers derived from the code (the metric count, the
 * sessions a step needs, the demonstration's arrivals and replications) and
 * marks a reader decodes with a legend. The Chinese page could state a count
 * the code no longer produces, or change a mark without changing its legend,
 * and every dictionary-level check would stay green. This renders the Chinese
 * page and checks what a reader gets. Serves D6, N3, BA-12.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LabIndex from "./page";
import LAB_ZH from "@/content/zh/copy/lab";
import { METRICS } from "@/content/lab/metrics";
import { sessionsForPrecision } from "@/content/lab/funnel-spec";
import { DEMO_ARRIVALS, DEMO_REPLICATIONS } from "@/content/lab/funnel-demo";

const html = renderToStaticMarkup(LabIndex({ locale: "zh" }));
const text = html.replace(/<[^>]*>/g, "");
const count = (hay: string, needle: string) => hay.split(needle).length - 1;
const LEGEND = LAB_ZH["▸ HAS AN ACCEPTANCE TARGET · — NO DEFENSIBLE TARGET YET"];
const OPEN = String.fromCharCode(0xff08);

describe("the Chinese /lab", () => {
  it("marks each metric in the index with a mark its legend explains", () => {
    const noTarget = METRICS.filter((m) => !m.target).length;
    const [hasMark, noMark] = LEGEND.split(" · ").map((s) => s.trim()[0]);
    expect(noTarget).toBeGreaterThan(0);
    expect(html.match(new RegExp(`>${noMark}</span>`, "g"))?.length).toBe(noTarget);
    expect(html.match(new RegExp(`>${hasMark}</span>`, "g"))?.length).toBe(METRICS.length - noTarget);
  });

  it("states the counts the code computes, as digits", () => {
    expect(text).toContain(`${METRICS.length} 项指标`);
    expect(text).toContain(`${sessionsForPrecision(5)} 次到达这一步的测试`);
    expect(text).toContain(`${sessionsForPrecision(10)} 次`);
    expect(text).toContain(`${DEMO_ARRIVALS.toLocaleString("en-US")} 个合成访客`);
    expect(text).toContain(`重复 ${DEMO_REPLICATIONS} 次`);
  });

  it("defines each badge in the legend with its English word, and uses the bare word after", () => {
    for (const w of ["SIMULATED", "REAL", "MIXED", "MEASURED"]) expect(count(text, `${OPEN}${w}`), w).toBe(1);
  });

  it("renders every metric's definition in Chinese", () => {
    for (const m of METRICS) expect(LAB_ZH[m.definition], m.id).toBeDefined();
    for (const m of METRICS) expect(text, m.id).toContain(LAB_ZH[m.definition]);
  });
  /*
   * GROUND TRUTH IS NOT THE REAL BADGE (red-team, bilingual Part 2). "True rate" was
   * rendered with the badge's word for REAL, so on the one page whose job is SIMULATED
   * against REAL, the answer key of a simulation read as data from real people. The
   * badge's word may appear only where it means real people or the badge itself.
   */
  it("uses the REAL badge's word only for the badge and for real people", () => {
    const REAL = LAB_ZH["no real cohort exists"].match(/真实/)![0];
    const allowed = [
      `${REAL}${OPEN}REAL`,
      `>${REAL}</span>`,
      `${REAL}作答`,
      `${REAL}的样本人群`,
      `${REAL}访客`,
      `${REAL}标记`,
      `${REAL}听者`,
      `从${REAL}作答者`,
    ];
    let rest = html;
    for (const a of allowed) rest = rest.split(a).join("");
    expect(rest.match(new RegExp(`.{0,12}${REAL}.{0,12}`, "g")) ?? []).toEqual([]);
  });
});
