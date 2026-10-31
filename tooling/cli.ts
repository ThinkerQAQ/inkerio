#!/usr/bin/env node
import path from "node:path";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { ENGINE_ROOT, engineStatus, validateContent, inspectRoutes, assemble, runScript } from "./engine.js";

function fail(message: string): never { console.error(message); process.exit(1); }

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  if (command === "help" || command === "--help") {
    console.log("inkerio <status|validate|assemble|check|build|diagrams|routes|preview> [options]");
    console.log("Options: validate/assemble --content-root <absolute-path>; diagrams [mermaid|plantuml|drawio]; routes --limit <1-20>; preview --port <1024-65535>");
    return;
  }
  if (command === "status") { console.log(JSON.stringify(await engineStatus(), null, 2)); return; }
  if (command === "routes") {
    const limit = args.length === 0 ? 10 : args.length === 2 && args[0] === "--limit" ? Number(args[1]) : NaN;
    console.log(JSON.stringify(await inspectRoutes(limit), null, 2)); return;
  }
  if (command === "validate" || command === "assemble") {
    if (args.length !== 2 || args[0] !== "--content-root" || !args[1] || !path.isAbsolute(args[1])) fail("Absolute --content-root is required");
    if (command === "validate") {
      const result = await validateContent(args[1]);
      console.log(JSON.stringify(result, null, 2));
      if (!result.valid) process.exitCode = 1;
    } else {
      const result = await assemble(args[1]);
      console.log(result.output);
      if (result.exitCode) process.exitCode = result.exitCode;
    }
    return;
  }
  if (command === "preview") {
    const port = args.length === 0 ? 4321 : args.length === 2 && args[0] === "--port" ? Number(args[1]) : NaN;
    if (!Number.isInteger(port) || port < 1024 || port > 65535) fail("preview port must be between 1024 and 65535");
    const astro = path.join(ENGINE_ROOT, "node_modules/astro/bin/astro.mjs");
    if (!existsSync(astro)) fail("Astro is not installed; run npm ci first");
    const child = spawn(process.execPath, [astro, "preview", "--host", "127.0.0.1", "--port", String(port)], { cwd: ENGINE_ROOT, stdio: "inherit" });
    child.on("exit", (code) => { process.exitCode = code ?? 1; });
    return;
  }
  const script = command === "diagrams" ? args.length === 0 ? "diagrams" : args.length === 1 && ["mermaid", "plantuml", "drawio"].includes(args[0]!) ? "diagrams:" + args[0] : "" : command;
  if (args.length && command !== "diagrams") fail("Unexpected arguments");
  if (!["build", "check", "diagrams", "diagrams:mermaid", "diagrams:plantuml", "diagrams:drawio"].includes(script)) fail("Unknown command");
  const result = await runScript(script);
  console.log(result.output);
  if (result.exitCode) process.exitCode = result.exitCode;
}
main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
