/**
 * NO NETWORK, ENFORCED AT RUN TIME (2026-09-28, AI tooling brief Part 4).
 *
 * Preloaded with `node --import` wherever the record server runs (`.mcp.json`,
 * the end-to-end test). The first guard was a regex over the server's imports,
 * and the red-team subagent listed four ways past it: a bare `https` specifier,
 * `node:http2`, `undici`, and `globalThis["fet" + "ch"]`, none of which it saw,
 * and none in the modules the server imports from `src/`. A claim that the server
 * cannot reach a network is only true if reaching one fails, so every way out
 * throws here, before any server code runs.
 *
 * stdio still works: the transport reads and writes file descriptors that are
 * already open, and never calls connect.
 */
import dgram from "node:dgram";
import dns from "node:dns";
import http from "node:http";
import http2 from "node:http2";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import tls from "node:tls";

const refuse = (what) =>
  function refused() {
    throw new Error(`record-mcp: network refused (${what}). This server is read-only and has no network access.`);
  };

net.Socket.prototype.connect = refuse("net.Socket.connect");
net.connect = net.createConnection = refuse("net.connect");
tls.connect = refuse("tls.connect");
dgram.createSocket = refuse("dgram.createSocket");
http2.connect = refuse("http2.connect");
for (const mod of [http, https]) {
  mod.request = refuse(`${mod === http ? "http" : "https"}.request`);
  mod.get = refuse(`${mod === http ? "http" : "https"}.get`);
}
dns.lookup = refuse("dns.lookup");
dns.resolve = refuse("dns.resolve");
globalThis.fetch = refuse("fetch");
globalThis.WebSocket = refuse("WebSocket");

// An ESM named import (`import { request } from "node:https"`) is a binding, not a
// property read, and would keep the original without this.
syncBuiltinESMExports();
