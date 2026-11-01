import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareReadme } from './sync-project-content.mjs';
const source = { repository: 'sample/tool', revision: 'a'.repeat(40), file: 'README.md', routes: { 'README_ZH.md': '/projects/tool/' } };
test('preserves code and content while resolving links, translations and images', () => {
 const result = prepareReadme('# Tool\n\n[中文](README_ZH.md) [guide](docs/start.md#go) ![demo](images/demo.png)\n\n```md\n[x](relative.md)\n```\n\n[local](#install) [site](https://example.org)\n', source);
 assert.ok(!result.startsWith('# Tool'));
 assert.ok(result.includes('[中文](/projects/tool/)'));
 assert.ok(result.includes(`/blob/${source.revision}/docs/start.md#go`));
 assert.ok(result.includes(`https://raw.githubusercontent.com/sample/tool/${source.revision}/images/demo.png`));
 assert.ok(result.includes('[x](relative.md)'));
 assert.ok(result.includes('[local](#install)'));
});
test('resolves references and HTML image assets relative to their original file', () => {
 const result = prepareReadme('![demo][pic]\n\n[pic]: ../assets/a.png\n\n<img src="../assets/b.png">\n<a href="../README_ZH.md">中文</a>\n', {...source, file:'docs/guide.md'});
 assert.ok(result.includes(`/sample/tool/${source.revision}/assets/a.png`));
 assert.ok(result.includes(`/sample/tool/${source.revision}/assets/b.png`));
 assert.ok(result.includes('href="/projects/tool/"'));
});

import { documentIdentity, describeDocument } from './sync-project-content.mjs';
test('pairs bilingual repository documentation while retaining its directory hierarchy', () => {
 assert.deepEqual(documentIdentity('docs/zh-CN/how-to/setup.md'), { locale:'zh', slug:'how-to/setup' });
 assert.deepEqual(documentIdentity('docs/how-to/setup.md'), { locale:'en', slug:'how-to/setup' });
 assert.deepEqual(documentIdentity('docs/SETUP.zh-CN.md'), { locale:'zh', slug:'SETUP' });
 assert.deepEqual(documentIdentity('docs/cn/reference/cli.md'), { locale:'zh', slug:'reference/cli' });
 assert.deepEqual(documentIdentity('docs/README_ZH.md'), { locale:'zh', slug:'README' });
 assert.equal(describeDocument('# Setup\n\nConfigure **your** project.\n','setup.md').title,'Setup');
});
