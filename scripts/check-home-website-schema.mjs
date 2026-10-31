import siteConfig from "../site.config.json" with { type: "json" };
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function websiteSchemaFor(homePath) {
  const html = readFileSync(new URL(`../dist/${homePath}index.html`, import.meta.url), "utf8");
  const websiteSchemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => /\btype=["']application\/ld\+json["']/i.test(match[1]))
    .map((match) => JSON.parse(match[2]))
    .filter((schema) => schema["@type"] === "WebSite");
  assert.equal(websiteSchemas.length, 1, `${homePath || "/"} must declare exactly one WebSite`);
  return websiteSchemas[0];
}

const zh = websiteSchemaFor("");
const en = websiteSchemaFor("en/");
const englishHome = readFileSync(new URL("../dist/en/index.html", import.meta.url), "utf8");
const titleMatch = englishHome.match(/<title>([^<]*)<\/title>/i);
const decodedTitle = titleMatch?.[1]
  .replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"').replaceAll("&#39;", "'");
assert.equal(decodedTitle, siteConfig.homeTitleEn, "English homepage must use the English site title");
assert.deepEqual(en, zh, "Localized home pages should describe the same WebSite entity");
assert.equal(zh["@id"], siteConfig.url.replace(/\/$/, "") + "/#website");
assert.equal(zh.url, siteConfig.url.replace(/\/$/, "") + "/");
console.log("Website JSON-LD valid and identical on / and /en/");
