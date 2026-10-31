import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { buildSitemapInventory } from "./build-sitemap-inventory.mjs";

test("sitemap inventory preserves old BlogCTL public manifest format", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "inkerio-inventory-"));
  const host = "https://example.com";
  await mkdir(path.join(root, "articles", "a"), { recursive: true });
  await writeFile(path.join(root, "index.html"), "<html>home</html>");
  await writeFile(path.join(root, "articles/a/index.html"), "<html>article</html>");
  await writeFile(path.join(root, "sitemap-index.xml"), '<sitemapindex><sitemap><loc>' + host + '/sitemap-0.xml</loc></sitemap></sitemapindex>');
  await writeFile(path.join(root, "sitemap-0.xml"), '<urlset><url><loc>' + host + '/articles/a/</loc></url><url><loc>' + host + '/</loc></url></urlset>');
  const result = await buildSitemapInventory(root, host);
  assert.equal(result.total, 2);
  assert.equal(await readFile(path.join(root, "sitemap-all.txt"), "utf8"), host + "/\n" + host + "/articles/a/\n");
  const manifest = JSON.parse(await readFile(path.join(root, "sitemap-inventory.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.origin, host);
  assert.equal(manifest.fingerprints[host + "/"], createHash("sha256").update("<html>home</html>").digest("hex"));
  assert.equal(Object.keys(manifest.fingerprints).length, 2);
});

test("rejects sitemap entries that reference other domains", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "inkerio-inventory-"));
  await writeFile(path.join(root, "sitemap-index.xml"), '<sitemapindex><sitemap><loc>https://evil.example/sitemap-0.xml</loc></sitemap></sitemapindex>');
  await assert.rejects(buildSitemapInventory(root, "https://example.com"), /unexpected origin/);
});

test("fails when a listed page does not exist", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "inkerio-inventory-"));
  const host = "https://example.com";
  await writeFile(path.join(root, "sitemap-index.xml"), '<sitemapindex><sitemap><loc>' + host + '/sitemap-0.xml</loc></sitemap></sitemapindex>');
  await writeFile(path.join(root, "sitemap-0.xml"), '<urlset><url><loc>' + host + '/no-page/</loc></url></urlset>');
  await assert.rejects(buildSitemapInventory(root, host), /Missing built page/);
});
