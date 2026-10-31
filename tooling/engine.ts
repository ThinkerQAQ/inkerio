import { spawn } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ENGINE_ROOT = fileURLToPath(new URL("../", import.meta.url));
const MAX_OUTPUT = 12_000;
const ALLOWED_SCRIPTS = new Set(["build", "check", "diagrams", "diagrams:mermaid", "diagrams:plantuml", "diagrams:drawio"]);

export async function engineStatus() {
  const pkg = JSON.parse(await readFile(path.join(ENGINE_ROOT, "package.json"), "utf8"));
  const config = JSON.parse(await readFile(path.join(ENGINE_ROOT, "site.config.json"), "utf8"));
  const generatedContent = existsSync(path.join(ENGINE_ROOT, "src/content"));
  const built = existsSync(path.join(ENGINE_ROOT, "dist/index.html"));
  return { name: "Inkerio", version: pkg.version as string, site: config.title as string,
    contentAssembled: generatedContent, built, node: process.version, engineRoot: ENGINE_ROOT };
}

async function countFiles(folder: string, accumulator: { markdown: number; nonMarkdown: number; invalidFrontmatter: number }): Promise<void> {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) { await countFiles(full, accumulator); continue; }
    if (!entry.isFile()) throw new Error("Content tree contains a symlink or special file: " + entry.name);
    if (!/\.mdx?$/i.test(entry.name)) { accumulator.nonMarkdown++; continue; }
    accumulator.markdown++;
    const source = await readFile(full, "utf8");
    const first = source.charCodeAt(0) === 0xFEFF ? source.slice(1) : source;
    if (!/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(first)) accumulator.invalidFrontmatter++;
  }
}

export async function validateContent(contentRoot: string) {
  const base = path.resolve(contentRoot);
  const info = await stat(base);
  if (!info.isDirectory()) throw new Error("Content checkout is not a directory");
  const folder = path.join(base, "src", "content");
  if (!(await stat(folder)).isDirectory()) throw new Error("src/content directory is required");
  const counts = { markdown: 0, nonMarkdown: 0, invalidFrontmatter: 0 };
  await countFiles(folder, counts);
  if (!counts.markdown) throw new Error("No Markdown documents were found");
  return { valid: counts.invalidFrontmatter === 0, ...counts };
}

export async function inspectRoutes(limit = 10) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("limit must be 1-20");
  const file = path.join(ENGINE_ROOT, "dist/sitemap-all.txt");
  const lines = (await readFile(file, "utf8")).trimEnd().split("\n").filter(Boolean);
  const config = JSON.parse(await readFile(path.join(ENGINE_ROOT, "site.config.json"), "utf8"));
  const origin = new URL(config.url as string).origin;
  for (const line of lines) {
    if (new URL(line).origin !== origin) throw new Error("Sitemap contains an unexpected origin");
  }
  return { origin, total: lines.length, sample: lines.slice(0, limit) };
}

export async function runCommand(file: string, args: string[], timeoutMs = 600_000): Promise<{ exitCode: number; output: string }> {
  const child = spawn(file, args, { cwd: ENGINE_ROOT, shell: process.platform === "win32" && file.endsWith(".cmd"),
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  const append = (chunk: Buffer) => { output += chunk.toString("utf8"); if (output.length > MAX_OUTPUT) output = output.slice(-MAX_OUTPUT); };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  const timer = setTimeout(() => child.kill(), timeoutMs);
  try {
    return await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code) => resolve({ exitCode: code ?? 1, output }));
    });
  } finally { clearTimeout(timer); }
}

export async function runScript(name: string) {
  if (!ALLOWED_SCRIPTS.has(name)) throw new Error("Script not allowlisted");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  return runCommand(npm, ["run", name]);
}

export async function assemble(contentRoot: string) {
  return runCommand(process.execPath, [path.join(ENGINE_ROOT, "scripts/assemble-content.mjs"), "--content-root", path.resolve(contentRoot)], 120_000);
}

export function configuredContentRoot(): string {
  const configured = process.env.INKERIO_CONTENT_ROOT;
  if (!configured || !path.isAbsolute(configured)) throw new Error("INKERIO_CONTENT_ROOT must be an absolute path configured by the owner");
  return path.resolve(configured);
}

export function requireWritePermission(): void {
  if (process.env.INKERIO_MCP_ALLOW_MUTATIONS !== "1") throw new Error("MCP write actions disabled; set INKERIO_MCP_ALLOW_MUTATIONS=1 explicitly");
}
