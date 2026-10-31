import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { validateContent, runScript, requireWritePermission, engineStatus } from '../.inkerio-tools/engine.js';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'inkerio-cli-test-'));
  await mkdir(path.join(root, 'src/content/articles'), { recursive: true });
  await writeFile(path.join(root, 'src/content/articles/post.md'), '---\ntitle: Post\n---\n# Post\n');
  return root;
}

test('validate generic content and report invalid frontmatter', async () => {
  const root = await fixture();
  let result = await validateContent(root);
  assert.deepEqual({valid: result.valid, markdown: result.markdown, invalid: result.invalidFrontmatter}, {valid: true, markdown: 1, invalid: 0});
  await writeFile(path.join(root, 'src/content/articles/invalid.md'), 'No metadata');
  result = await validateContent(root);
  assert.equal(result.valid, false);
  assert.equal(result.invalidFrontmatter, 1);
});

test('reject arbitrary npm command and default writes disabled', async () => {
  await assert.rejects(runScript('publish-secrets'), /not allowlisted/);
  const old = process.env.INKERIO_MCP_ALLOW_MUTATIONS;
  delete process.env.INKERIO_MCP_ALLOW_MUTATIONS;
  try { assert.throws(requireWritePermission, /disabled/); }
  finally { if (old === undefined) delete process.env.INKERIO_MCP_ALLOW_MUTATIONS; else process.env.INKERIO_MCP_ALLOW_MUTATIONS = old; }
});

test('stdio MCP tools work and reject writes by default', async () => {
  const contentRoot = await fixture();
  const transport = new StdioClientTransport({ command: process.execPath, args: ['.inkerio-tools/mcp.js'], cwd: process.cwd(), env: { ...process.env, INKERIO_CONTENT_ROOT: contentRoot, INKERIO_MCP_ALLOW_MUTATIONS: '0' } });
  const client = new Client({ name: 'inkerio-smoke', version: '1.0.0' });
  try {
    await client.connect(transport);
    const tools = (await client.listTools()).tools.map((t) => t.name);
    for (const name of ['site_status', 'validate_content', 'inspect_routes', 'assemble_content', 'build_site', 'render_diagrams', 'preview_site']) assert.ok(tools.includes(name), name);
    const status = await client.callTool({ name: 'site_status', arguments: {} });
    assert.equal(status.isError, undefined);
    assert.equal(JSON.parse(status.content[0].text).name, 'Inkerio');
    const validate = await client.callTool({ name: 'validate_content', arguments: {} });
    assert.equal(JSON.parse(validate.content[0].text).markdown, 1);
    const build = await client.callTool({ name: 'build_site', arguments: {} });
    assert.equal(build.isError, true);
    assert.match(build.content[0].text, /disabled/);
    const assemble = await client.callTool({ name: 'assemble_content', arguments: {} });
    assert.equal(assemble.isError, true);
  } finally { await client.close(); }
});
