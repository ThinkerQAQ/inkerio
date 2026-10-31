import { createHash } from "node:crypto";
import { readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import siteConfig from "../site.config.json" with { type: "json" };

const DEFAULT_DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const MAX_URLS = 50_000;

function decodeEntities(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, (entity) => {
    const named = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
    if (Object.hasOwn(named, entity)) return named[entity];
    const hex = entity.startsWith("&#x");
    const code = Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    if (!Number.isSafeInteger(code) || code < 0 || code > 0x10ffff) throw new Error("Invalid XML entity");
    return String.fromCodePoint(code);
  });
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeEntities(match[1].trim()))
    .filter(Boolean);
}

function checkedURL(rawURL, expectedOrigin, label) {
  if (!/^https?:\/\//i.test(rawURL)) throw new Error(label + " must be absolute: " + rawURL);
  const url = new URL(rawURL);
  if (url.origin !== expectedOrigin) throw new Error(label + " has unexpected origin: " + rawURL);
  if (url.username || url.password) throw new Error(label + " must not contain credentials");
  url.hash = "";
  return url.href;
}

async function checkedFile(root, relative) {
  const full = path.resolve(root, relative);
  const part = path.relative(root, full);
  if (!part || part === ".." || part.startsWith(".." + path.sep) || path.isAbsolute(part)) {
    throw new Error("Refusing path outside generated site: " + relative);
  }
  const rootReal = await realpath(root);
  const fileReal = await realpath(full);
  const filePart = path.relative(rootReal, fileReal);
  if (!filePart || filePart === ".." || filePart.startsWith(".." + path.sep) || path.isAbsolute(filePart)) {
    throw new Error("Generated site symlink escapes output directory: " + relative);
  }
  if (!(await stat(fileReal)).isFile()) throw new Error("Not a generated file: " + relative);
  return fileReal;
}

async function pageFile(root, href) {
  const url = new URL(href);
  const decoded = decodeURIComponent(url.pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates = decoded === "/"
    ? ["index.html"]
    : decoded.endsWith("/")
      ? [path.join(relative, "index.html")]
      : [relative + ".html", path.join(relative, "index.html")];
  let lastError;
  for (const candidate of candidates) {
    try { return await checkedFile(root, candidate); } catch (error) { lastError = error; }
  }
  throw new Error("Missing built page for " + href + ": " + lastError?.message);
}

export async function buildSitemapInventory(distRoot = DEFAULT_DIST, expectedSite = siteConfig.url) {
  const root = path.resolve(distRoot);
  const origin = new URL(expectedSite).origin;
  const indexPath = await checkedFile(root, "sitemap-index.xml");
  const children = [...new Set(sitemapLocations(await readFile(indexPath, "utf8")))];
  if (!children.length) throw new Error("Sitemap index does not contain child sitemaps");

  const urls = new Set();
  for (const raw of children) {
    const sitemap = checkedURL(raw, origin, "child sitemap");
    const sitemapPath = decodeURIComponent(new URL(sitemap).pathname).replace(/^\/+/, "");
    const locations = sitemapLocations(await readFile(await checkedFile(root, sitemapPath), "utf8"));
    for (const page of locations) urls.add(checkedURL(page, origin, "sitemap page"));
  }
  const list = [...urls].sort();
  if (!list.length || list.length > MAX_URLS) throw new Error("Sitemap URL count is outside the supported range: " + list.length);

  const fingerprints = {};
  for (const page of list) {
    const data = await readFile(await pageFile(root, page));
    fingerprints[page] = createHash("sha256").update(data).digest("hex");
  }
  await writeFile(path.join(root, "sitemap-all.txt"), list.join("\n") + "\n");
  await writeFile(path.join(root, "sitemap-inventory.json"), JSON.stringify({
    version: 1,
    origin,
    generatedAt: new Date().toISOString(),
    fingerprints,
  }, null, 2) + "\n");
  return { origin, total: list.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildSitemapInventory().then(
    (result) => console.log(JSON.stringify({ operation: "sitemap-inventory", status: "passed", ...result })),
    (error) => { console.error("Sitemap inventory build failed:", error.message); process.exitCode = 1; },
  );
}
