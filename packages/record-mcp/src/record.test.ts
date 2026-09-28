/**
 * THE RECORD SERVER RETURNS THE FILES' OWN TEXT, AND NOTHING OUTSIDE THE REPOSITORY
 * (2026-09-28, AI tooling brief Part 4).
 *
 * The server exists so sessions quote the record instead of recalling it, which
 * is only worth anything if what it returns IS the record. So:
 *
 *   - every blueprint statement comes back exactly as its line in the file, and a
 *     mutated file changes the answer (the server reads, it does not remember);
 *   - every ruling record is a verbatim run of its file's lines, and an ID query is
 *     exact (RT-1 is not RT-10);
 *   - the falsified tool returns the registry's own entries;
 *   - suite_status returns a line that is really in the commit log;
 *   - a path outside the root is refused: absolute, `..`, or a link that points out;
 *   - with the preload `.mcp.json` gives it, no route to a network works;
 *   - end to end, a real MCP client over stdio lists the four tools and gets the
 *     blueprint's text back.
 *
 * Serves BA-12 · the Blueprint of record (one text, quoted) · N3.
 */
import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { FALSIFIED } from "../../../src/content/lab/falsified";
import { parseBlueprint } from "../../../src/content/blueprint";
import { REPO_ROOT, answers, blueprint, falsified, inside, readRecord, records, rulings, suiteStatus } from "./record";

const root = REPO_ROOT;
const PRELOAD = join(root, "packages/record-mcp/src/no-network.mjs");
const MCP_ARGS: string[] = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers["project-record"].args;
const temps: string[] = [];
const temp = () => {
  const d = mkdtempSync(join(tmpdir(), "record-mcp-"));
  temps.push(d);
  return d;
};
afterAll(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe("blueprint(id)", () => {
  const source = readFileSync(join(root, "docs/blueprint.md"), "utf8");
  const ids = parseBlueprint(source).statements.map((s) => s.id);

  it("returns every statement exactly as its line in docs/blueprint.md", () => {
    expect(ids.length).toBeGreaterThanOrEqual(23);
    const lines = source.split(/\r?\n/);
    for (const id of ids) {
      expect(lines, `${id}'s line`).toContain(`**${id}** · ${blueprint(root, id).text}`);
    }
  });

  it("reads the file on every call: rewriting the SAME root's blueprint changes the answer", () => {
    // One root, as the server has for its whole life. Comparing two roots could not
    // catch a cache keyed by root (red-team subagent).
    const fake = temp();
    mkdirSync(join(fake, "docs"));
    writeFileSync(join(fake, "docs/blueprint.md"), source);
    expect(blueprint(fake, "BP-BRIDGE").text).toContain("which words");
    writeFileSync(
      join(fake, "docs/blueprint.md"),
      source.replace("decides which words in your prompt", "decides which colours in your prompt"),
    );
    expect(blueprint(fake, "BP-BRIDGE").text).toContain("which colours");
  });

  it("fails loudly on an unknown ID and names the ones that exist", () => {
    expect(() => blueprint(root, "BP-NOPE")).toThrow(/BP-NOPE is not in docs\/blueprint\.md\. IDs: BP-GOAL/);
  });
});

describe("rulings(query)", () => {
  it("returns each record verbatim from its file, with its file and line", () => {
    const hits = rulings(root, "BA-10", 50);
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      const lines = readRecord(root, h.file).split(/\r?\n/);
      expect(lines.slice(h.line - 1, h.line - 1 + h.text.split("\n").length).join("\n")).toBe(h.text);
    }
  });

  it("matches an ID exactly: RT-1 does not return a record that only names RT-10", () => {
    const hits = rulings(root, "RT-1", 50);
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.ids.some((i) => answers(i, "RT-1")), `${h.file}:${h.line} names ${h.ids.join(", ")}`).toBe(true);
    }
    expect(hits.some((h) => h.ids.includes("RT-10") && !h.ids.some((i) => answers(i, "RT-1")))).toBe(false);
  });

  it("finds a ruling's lettered forms from its number: RT-59 finds RT-59a in CLAUDE.md", () => {
    const hits = rulings(root, "RT-59", 50);
    expect(hits.some((h) => h.file === "CLAUDE.md" && h.ids.includes("RT-59a"))).toBe(true);
    expect(answers("RT-59a", "RT-59")).toBe(true);
    expect(answers("RT-590", "RT-59")).toBe(false);
    expect(answers("RT-59b", "RT-59a")).toBe(false);
  });

  it("finds the audit's own ruling table, dated", () => {
    const [ba7] = rulings(root, "BA-7").filter((h) => h.file === "docs/rt-answers-2026-09-23-audit.md");
    expect(ba7.text).toMatch(/^\| \*\*BA-7\*\* \|/);
    expect(ba7.date).toBe("2026-09-23");
  });

  it("searches words case-insensitively across CLAUDE.md too", () => {
    expect(rulings(root, "offer, do not assert", 50).some((h) => h.file === "CLAUDE.md")).toBe(true);
  });

  it("splits a table into rows and a paragraph into one record", () => {
    expect(records("| **A** | x |\n| **B** | y |\n\nline one\nline two\n- bullet")).toEqual([
      { text: "| **A** | x |", line: 1 },
      { text: "| **B** | y |", line: 2 },
      { text: "line one\nline two", line: 4 },
      { text: "- bullet", line: 6 },
    ]);
  });
});

describe("falsified(id?)", () => {
  const file = readFileSync(join(root, "src/content/lab/falsified.ts"), "utf8").replace(/\r\n/g, "\n");

  it("returns every entry the module holds, each as the file's own text", () => {
    const all = falsified(root);
    expect(all.map((e) => e.id)).toEqual(FALSIFIED.map((e) => e.id));
    for (const e of all) expect(file, `${e.id} is not verbatim in the file`).toContain(e.text);
    expect(falsified(root, FALSIFIED[0].id)).toEqual([all[0]]);
    expect(() => falsified(root, "no-such-belief")).toThrow(/not in src\/content\/lab\/falsified\.ts/);
  });

  it("reads the file on every call: an edited registry changes the answer", () => {
    const fake = temp();
    mkdirSync(join(fake, "src/content/lab"), { recursive: true });
    const target = join(fake, "src/content/lab/falsified.ts");
    writeFileSync(target, file);
    const first = falsified(fake, FALSIFIED[0].id)[0].text;
    writeFileSync(target, file.replace(first, first.replace("killedBy:", "killedBy: /* edited */")));
    expect(falsified(fake, FALSIFIED[0].id)[0].text).toContain("/* edited */");
  });
});

describe("suite_status()", () => {
  it("returns a Suite: line that is really in the commit log, with its commit", () => {
    const s = suiteStatus(root);
    const body = execFileSync("git", ["log", "-1", "--format=%B", s.commit], { cwd: root, encoding: "utf8" });
    expect(body.split(/\r?\n/)).toContain(s.line);
    expect(s.tests).toBeGreaterThan(1000);
    expect(s.refresh).toBe("npm test");
  });
});

describe("the repository boundary", () => {
  it("refuses an absolute path and a .. escape", () => {
    expect(() => inside(root, join(root, "CLAUDE.md"))).toThrow(/absolute/);
    expect(() => inside(root, "../outside.txt")).toThrow(/outside the repository/);
    expect(() => inside(root, "docs/../../outside.txt")).toThrow(/outside the repository/);
    expect(() => readRecord(root, "..")).toThrow(/outside the repository/);
  });

  it("refuses a link inside the tree that resolves outside it", () => {
    const fake = temp();
    const outside = temp();
    writeFileSync(join(outside, "secret.md"), "not the record");
    symlinkSync(outside, join(fake, "docs"), "junction");
    expect(() => readRecord(fake, "docs/secret.md")).toThrow(/resolves outside the repository/);
  });

  it("is registered with the preload, so the server Claude Code starts is the one tested", () => {
    const at = MCP_ARGS.indexOf("--import");
    expect(at, ".mcp.json no longer preloads no-network.mjs").toBeGreaterThanOrEqual(0);
    expect(MCP_ARGS[at + 1]).toBe("./packages/record-mcp/src/no-network.mjs");
    expect(MCP_ARGS.at(-1)).toBe("packages/record-mcp/src/server.ts");
  });

  it("cannot reach a network once the preload runs: every route out throws", () => {
    // Enforced, not scanned. A regex over imports missed a bare `https`, `node:http2`,
    // `undici` and a computed `fetch` (red-team subagent); this runs each route.
    const probe = join(temp(), "probe.mjs");
    writeFileSync(
      probe,
      [
        'import { request } from "node:https";',
        "const routes = {",
        '  fetch: () => fetch("https://example.com"),',
        '  httpsNamedImport: () => request("https://example.com"),',
        '  bareHttps: async () => (await import("https")).get("https://example.com"),',
        '  http: async () => (await import("node:http")).request("http://example.com"),',
        '  http2: async () => (await import("node:http2")).connect("https://example.com"),',
        '  net: async () => (await import("node:net")).connect(443, "example.com"),',
        // A literal address, so the DNS stub cannot refuse it first and hide a missing socket stub.
        '  socket: async () => new (await import("node:net")).Socket().connect(9, "127.0.0.1"),',
        '  tls: async () => (await import("node:tls")).connect(443, "example.com"),',
        '  udp: async () => (await import("node:dgram")).createSocket("udp4"),',
        '  dns: async () => (await import("node:dns")).lookup("example.com", () => {}),',
        "};",
        // Only the preload's own refusal counts. An offline machine rejects a real
        // fetch too, and counting that as refused let a removed stub pass.
        "process.on('uncaughtException', () => {});",
        "const allowed = [];",
        "for (const [k, f] of Object.entries(routes)) {",
        "  try { await f(); allowed.push(k); }",
        "  catch (e) { if (!String(e && e.message).includes('record-mcp: network refused')) allowed.push(k + ': ' + String(e && e.message).slice(0, 60)); }",
        "}",
        "console.log(JSON.stringify(allowed));",
        "process.exit(0);",
      ].join("\n"),
    );
    const out = execFileSync(process.execPath, ["--import", pathToFileURL(PRELOAD).href, probe], {
      encoding: "utf8",
      timeout: 20_000,
    });
    expect(JSON.parse(out.trim())).toEqual([]);
  });
});

describe("end to end over stdio", () => {
  it("a real MCP client lists the four tools and gets the blueprint's text back", async () => {
    const env = Object.fromEntries(
      Object.entries(process.env).filter((e): e is [string, string] => typeof e[1] === "string" && !e[0].startsWith("GIT_")),
    );
    const transport = new StdioClientTransport({
      command: process.execPath,
      // The same arguments .mcp.json gives, run from the root as Claude Code runs them.
      args: MCP_ARGS,
      cwd: root,
      env,
      stderr: "pipe",
    });
    const client = new Client({ name: "record-test", version: "0" });
    await client.connect(transport);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual(["blueprint", "falsified", "rulings", "suite_status"]);
      const got = await client.callTool({ name: "blueprint", arguments: { id: "BP-GOAL" } });
      expect((got.content as { text: string }[])[0].text).toBe(blueprint(root, "BP-GOAL").text);
      const bad = await client.callTool({ name: "blueprint", arguments: { id: "BP-NOPE" } });
      expect(bad.isError).toBe(true);
      // The other three answer too, under the network preload.
      for (const [name, args] of [["rulings", { query: "BA-10" }], ["falsified", {}], ["suite_status", {}]] as const) {
        const r = await client.callTool({ name, arguments: args });
        expect(r.isError, `${name}: ${JSON.stringify(r.content).slice(0, 200)}`).toBeFalsy();
      }
    } finally {
      await client.close();
    }
  }, 30_000);
});
