import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { assembleContent } from "./assemble-content.mjs";

test("assemble copies content, media and manifest without modifying the source", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "inkerio-assemble-"));
  const engine = path.join(dir, "engine");
  const content = path.join(dir, "content");
  await mkdir(path.join(content, "src/content/articles"), { recursive: true });
  await mkdir(path.join(content, "src/data"), { recursive: true });
  await mkdir(path.join(content, "public/media"), { recursive: true });
  await writeFile(path.join(content, "src/content/articles/example.md"), "# example");
  await writeFile(path.join(content, "src/data/content-manifest.json"), "{}");
  await writeFile(path.join(content, "public/media/sample.txt"), "sample");
  const result = await assembleContent(engine, content);
  assert.equal(result.mediaCopied, true);
  assert.equal(result.manifestCopied, true);
  assert.equal(await readFile(path.join(engine, "src/content/articles/example.md"), "utf8"), "# example");
  assert.equal(await readFile(path.join(engine, "public/media/sample.txt"), "utf8"), "sample");
  assert.equal(await readFile(path.join(content, "src/content/articles/example.md"), "utf8"), "# example");
});

test("invalid content leaves the previously assembled tree intact", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "inkerio-safety-"));
  const engine = path.join(dir, "engine");
  const content = path.join(dir, "content");
  await mkdir(path.join(engine, "src/content"), { recursive: true });
  await mkdir(path.join(content, "src/content"), { recursive: true });
  await writeFile(path.join(engine, "src/content/keep.md"), "keep");
  await symlink("/etc/passwd", path.join(content, "src/content/invalid.md"));
  await assert.rejects(assembleContent(engine, content), /non-regular/);
  assert.equal(await readFile(path.join(engine, "src/content/keep.md"), "utf8"), "keep");
});

test("missing source directory fails closed", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "inkerio-missing-"));
  await assert.rejects(assembleContent(path.join(dir, "engine"), path.join(dir, "missing")), /Missing content/);
});
