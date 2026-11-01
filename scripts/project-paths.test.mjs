import test from 'node:test';
import assert from 'node:assert/strict';
import { documentIdFromPath, seriesIdFromPath } from '../src/lib/project-paths.mjs';
test('project folder storage retains chapter and translation identities', () => {
 assert.equal(documentIdFromPath('projects/tool/docs/how-to/setup.md'),'tool/how-to/setup');
 assert.equal(documentIdFromPath('projects/tool/docs/en/how-to/setup.md'),'en/tool/how-to/setup');
 assert.equal(seriesIdFromPath('projects/tool/series.md'),'tool-docs');
 assert.equal(documentIdFromPath('documents/tool/setup.md'),'tool/setup');
 assert.equal(seriesIdFromPath('series/existing-series.md'),'existing-series');
 assert.throws(()=>seriesIdFromPath('projects/tool/README.md'));
});
