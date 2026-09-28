#!/usr/bin/env node
/**
 * THE PROJECT-RECORD MCP SERVER (2026-09-28, AI tooling brief Part 4).
 *
 * A stdio server, read-only, with no network. Four tools, each a function in
 * `record.ts`: `blueprint`, `rulings`, `falsified`, `suite_status`. Run it with
 * Node 24 or later, which strips TypeScript types itself:
 *
 *   node --import ./packages/record-mcp/src/no-network.mjs packages/record-mcp/src/server.ts
 *
 * The preload refuses every network call at run time (see that file); `.mcp.json`
 * and the end-to-end test both start the server with it.
 *
 * Registered for Claude Code in `.mcp.json`; the README gives the line for the
 * Claude desktop app. Nothing is written to stdout except protocol messages, so
 * diagnostics go to stderr.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as record from "./record.ts";

const root = record.REPO_ROOT;

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
const failure = (err: unknown) => ({
  content: [{ type: "text" as const, text: err instanceof Error ? err.message : String(err) }],
  isError: true,
});
function guarded<A>(fn: (args: A) => unknown) {
  return async (args: A) => {
    try {
      return text(fn(args));
    } catch (err) {
      return failure(err);
    }
  };
}

const server = new McpServer({ name: "project-record", version: "0.1.0" });

server.registerTool(
  "blueprint",
  {
    title: "Blueprint statement",
    description:
      "Returns one statement from docs/blueprint.md, verbatim, by its BP-ID (for example BP-GOAL, BP-INSIGHT, BP-BRIDGE). Quote this text; do not paraphrase it.",
    inputSchema: { id: z.string().describe("A blueprint ID, e.g. BP-GOAL") },
  },
  guarded(({ id }: { id: string }) => record.blueprint(root, id).text),
);

server.registerTool(
  "rulings",
  {
    title: "Search rulings",
    description:
      "Searches docs/rt-answers-*.md and CLAUDE.md. Give a ruling ID (RT-4, BA-10, RT-Z10) for an exact match, or words for a text search. Returns each matching record verbatim with its IDs, date, file and line, newest file first.",
    inputSchema: {
      query: z.string().describe("A ruling ID or search words"),
      limit: z.number().int().min(1).max(50).optional().describe("Most records to return (default 12)"),
    },
  },
  guarded(({ query, limit }: { query: string; limit?: number }) => record.rulings(root, query, limit)),
);

server.registerTool(
  "falsified",
  {
    title: "Falsified hypotheses",
    description:
      "Returns entries from the registry of falsified hypotheses (src/content/lab/falsified.ts): every belief this project tested and abandoned, with what killed it and its sources. Give an id for one entry, or none for all.",
    inputSchema: { id: z.string().optional().describe("An entry id, e.g. timing-multiplier") },
  },
  guarded(({ id }: { id?: string }) => record.falsified(root, id)),
);

server.registerTool(
  "suite_status",
  {
    title: "Suite status",
    description:
      "The last test-suite count recorded in a commit message (the slice loop's 'Suite:' line), with the commit and date it came from, and the commands to refresh it.",
    inputSchema: {},
  },
  guarded(() => record.suiteStatus(root)),
);

await server.connect(new StdioServerTransport());
process.stderr.write("project-record MCP server: ready on stdio\n");
