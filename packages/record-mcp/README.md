# record-mcp — the project record, as an MCP server

A small, read-only [Model Context Protocol](https://modelcontextprotocol.io) server over this
repository's own record. It runs over stdio, re-reads the files on every call, refuses to read any
path outside the repository, and cannot reach a network: `src/no-network.mjs`, preloaded wherever
it runs, makes every network call throw.

**The job it replaces.** Sessions used to read the record's files and quote from memory, which is
how the blueprint's copies drifted until two of them made different claims. A tool that returns
the file's own text cannot paraphrase it.

| Tool | Returns | Read from |
|---|---|---|
| `blueprint(id)` | One statement, verbatim, by its BP-ID | `docs/blueprint.md`, through the parser the site renders from |
| `rulings(query)` | Matching ruling records, verbatim, with IDs, date, file and line. An ID query is exact apart from the option letter (`RT-59` finds `RT-59a`; `RT-1` never finds `RT-10`) | `docs/rt-answers-*.md`, `CLAUDE.md` |
| `falsified(id?)` | Entries of the registry of falsified hypotheses, each as the file writes it, with its line | `src/content/lab/falsified.ts` |
| `suite_status()` | The last `Suite: <n> green` line recorded in a commit message, its commit and date, and the commands to refresh it | `git log` (read only) |

## Running it

It needs Node 24 or later (which runs TypeScript directly) and the repository's `npm install`.

**Claude Code** picks it up from the repository's `.mcp.json` and asks once before enabling it.

**The Claude desktop app** (so Cowork sessions query it instead of reading files): add this entry to
`mcpServers` in `claude_desktop_config.json`, with the absolute path to your clone, then restart
the app:

```json
"project-record": { "command": "node", "args": ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--import", "file:///absolute/path/to/clone/packages/record-mcp/src/no-network.mjs", "/absolute/path/to/clone/packages/record-mcp/src/server.ts"] }
```

## Tests

`src/record.test.ts`, in the root suite (`npm test`): every tool returns exactly the file's text;
rewriting `docs/blueprint.md` or the falsified registry under the same root changes the next answer;
paths outside the repository are refused (absolute, `..`, and a link that points out); with the
preload, every route to a network throws; and a real MCP client, started with `.mcp.json`'s own
arguments, lists the four tools and calls each one.
