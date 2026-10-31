#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { ENGINE_ROOT, engineStatus, validateContent, configuredContentRoot, inspectRoutes, assemble, runScript, requireWritePermission } from "./engine.js";

const empty = z.object({});
let working = false;

function result(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] };
}
function errorResult(error: unknown) {
  return { isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }] };
}
async function checked<T>(action: () => Promise<T>) {
  try { return result(await action()); } catch (error) { return errorResult(error); }
}
async function exclusive<T>(action: () => Promise<T>) {
  if (working) throw new Error("A build or assembly is already running");
  working = true;
  try { return await action(); } finally { working = false; }
}
function commandSummary(label: string, command: { exitCode: number; output: string }) {
  if (command.exitCode !== 0) throw new Error(`${label} failed (${command.exitCode}): ${command.output.slice(-2500)}`);
  return { operation: label, status: "passed", message: command.output.slice(-1500) };
}

export function createInkerioServer() {
  const server = new McpServer({ name: "inkerio", version: "2.0.0" }, { capabilities: { tools: {} } });
  server.registerTool("site_status", { description: "Read local Inkerio version, configuration and build readiness. No mutations.", inputSchema: empty },
    async () => checked(engineStatus));
  server.registerTool("validate_content", { description: "Validate Markdown frontmatter in the pinned INKERIO_CONTENT_ROOT. Returns aggregate counts, not private article contents.", inputSchema: empty },
    async () => checked(async () => validateContent(configuredContentRoot())));
  server.registerTool("inspect_routes", { description: "Inspect URLs from the generated static sitemap; requires a completed build.", inputSchema: z.object({ limit: z.number().int().min(1).max(20).default(5) }) },
    async ({ limit }) => checked(async () => inspectRoutes(limit)));
  server.registerTool("assemble_content", { description: "Copy owner-configured external content into ignored build inputs. Requires INKERIO_MCP_ALLOW_MUTATIONS=1. Does not modify content source.", inputSchema: empty },
    async () => checked(async () => exclusive(async () => { requireWritePermission(); return commandSummary("assemble_content", await assemble(configuredContentRoot())); })));
  server.registerTool("build_site", { description: "Build local static site using existing Astro pipeline. Never deploys online. Requires INKERIO_MCP_ALLOW_MUTATIONS=1.", inputSchema: empty },
    async () => checked(async () => exclusive(async () => { requireWritePermission(); return commandSummary("build_site", await runScript("build")); })));
  server.registerTool("render_diagrams", { description: "Run the existing diagram renderer, optionally by type. Requires INKERIO_MCP_ALLOW_MUTATIONS=1.", inputSchema: z.object({ type: z.enum(["all", "plantuml", "mermaid", "drawio"]).default("all") }) },
    async ({ type }) => checked(async () => exclusive(async () => { requireWritePermission(); return commandSummary("render_diagrams", await runScript(type === "all" ? "diagrams" : `diagrams:${type}`)); })));
  server.registerTool("preview_site", { description: "Start or inspect a localhost-only preview of previously built pages; never deploys online. Starting requires INKERIO_MCP_ALLOW_MUTATIONS=1.", inputSchema: z.object({ port: z.number().int().min(1024).max(65535).default(4321), start: z.boolean().default(false) }) },
    async ({ port, start }) => checked(async () => {
      const url = `http://127.0.0.1:${port}/`;
      const isReady = async () => { try { const res = await fetch(url, { signal: AbortSignal.timeout(1500) }); return res.ok; } catch { return false; } };
      if (await isReady()) return { url, running: true, launched: false };
      if (!start) return { url, running: false, launchCommand: "node .inkerio-tools/cli.js preview --port " + port };
      requireWritePermission();
      if (!existsSync(path.join(ENGINE_ROOT, "dist/index.html"))) throw new Error("Build Inkerio before preview");
      const cli = path.join(ENGINE_ROOT, ".inkerio-tools/cli.js");
      const child = spawn(process.execPath, [cli, "preview", "--port", String(port)], { cwd: ENGINE_ROOT, detached: true, stdio: "ignore" });
      child.unref();
      for (let i = 0; i < 30; i++) {
        if (await isReady()) return { url, running: true, launched: true };
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error("Preview did not become reachable on localhost");
    }));
  return server;
}

// Stdout is exclusively reserved for MCP JSON-RPC frames.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  serveStdio(() => createInkerioServer(), { onerror: (error) => { console.error("Inkerio MCP:", error.message); } });
}
