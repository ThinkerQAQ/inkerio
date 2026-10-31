import { randomUUID } from "node:crypto";
import { cp, lstat, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Source content is never modified. Generated content/media are disposable build inputs.
async function isDirectory(directory) {
  try { return (await stat(directory)).isDirectory(); }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

async function ensureRegularTree(root) {
  for (const item of await readdir(root, { withFileTypes: true })) {
    const full = path.join(root, item.name);
    if (item.isDirectory()) await ensureRegularTree(full);
    else if (!item.isFile()) throw new Error("Refusing non-regular content path: " + full);
  }
}

async function swapDirectory(source, destination) {
  const temp = destination + ".new-" + randomUUID();
  const backup = destination + ".old-" + randomUUID();
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, temp, { recursive: true, force: false, errorOnExist: true });
  let movedOld = false;
  try {
    if (await isDirectory(destination)) {
      await rename(destination, backup);
      movedOld = true;
    }
    await rename(temp, destination);
    if (movedOld) await rm(backup, { recursive: true, force: true });
  } catch (error) {
    if (movedOld && !await isDirectory(destination)) await rename(backup, destination);
    throw error;
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

export async function assembleContent(engineRoot, contentRoot) {
  const engine = path.resolve(engineRoot);
  const content = path.resolve(contentRoot);
  if (engine === content) throw new Error("Engine and content roots must be separate");
  const source = path.join(content, "src/content");
  if (!await isDirectory(source)) throw new Error("Missing content directory: " + source);
  await ensureRegularTree(source);
  const sourceMedia = path.join(content, "public/media");
  const haveMedia = await isDirectory(sourceMedia);
  if (haveMedia) await ensureRegularTree(sourceMedia);
  const sourceManifest = path.join(content, "src/data/content-manifest.json");
  let haveManifest = false;
  try {
    const info = await lstat(sourceManifest);
    if (!info.isFile()) throw new Error("Manifest must be a regular file: " + sourceManifest);
    haveManifest = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const targetContent = path.join(engine, "src/content");
  const targetMedia = path.join(engine, "public/media");
  const targetManifest = path.join(engine, "src/data/content-manifest.json");
  await swapDirectory(source, targetContent);
  if (haveMedia) await swapDirectory(sourceMedia, targetMedia);
  else await rm(targetMedia, { recursive: true, force: true });
  await mkdir(path.dirname(targetManifest), { recursive: true });
  if (haveManifest) {
    await cp(sourceManifest, targetManifest, { force: true });
  } else await rm(targetManifest, { force: true });
  return { contentRoot: content, mediaCopied: haveMedia, manifestCopied: haveManifest };
}

const entry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (entry) {
  let contentRoot;
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--content-root" && process.argv[i + 1]) contentRoot = process.argv[++i];
    else throw new Error("Usage: node scripts/assemble-content.mjs --content-root <directory>");
  }
  if (!contentRoot) throw new Error("--content-root is required");
  const engineRoot = fileURLToPath(new URL("../", import.meta.url));
  assembleContent(engineRoot, contentRoot).then(
    (result) => console.log(JSON.stringify({ operation: "assemble-content", status: "passed", ...result })),
    (error) => { console.error("Content assembly failed:", error.message); process.exitCode = 1; },
  );
}
