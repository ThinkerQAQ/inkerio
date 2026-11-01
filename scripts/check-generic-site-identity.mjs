// Guard the reusable runtime against accidentally reintroducing a specific
// blog owner's brand or domain. Documentation and public sample repositories
// may legitimately cite the author as an external example.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const errors = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (name === path.join(root, "content")) continue;
      visit(name);
    } else if (entry.isFile() && /\.(?:astro|ts|js|mjs)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      const content = readFileSync(name, "utf8");
      if (/thinkerqaq/i.test(content)) errors.push(path.relative(process.cwd(), name));
    }
  }
}
visit(root);
if (errors.length) {
  console.error(`Owner-specific identity leaked into reusable runtime: ${errors.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("OK: reusable runtime contains no owner-specific brand or domain");
}
