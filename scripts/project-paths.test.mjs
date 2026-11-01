import test from 'node:test';
import assert from 'node:assert/strict';
import { documentIdFromPath, projectDocumentSlug } from '../src/lib/project-paths.mjs';
test('project folder storage retains chapter and translation identities', () => {
 assert.equal(documentIdFromPath('projects/tool/docs/how-to/setup.md'),'tool/how-to/setup');
 assert.equal(documentIdFromPath('projects/tool/docs/en/how-to/setup.md'),'en/tool/how-to/setup');
 assert.equal(projectDocumentSlug({id:'tool/how-to/setup',data:{project:'tool'}}),'how-to/setup');
 assert.equal(projectDocumentSlug({id:'en/tool/how-to/setup',data:{project:'tool',translationOf:'tool/how-to/setup'}}),'how-to/setup');
 assert.equal(projectDocumentSlug({id:'en/tool/only-english',data:{project:'tool'}}),'only-english');
 assert.throws(()=>projectDocumentSlug({id:'other/setup',data:{project:'tool'}}));
});
