import test from 'node:test';
import assert from 'node:assert/strict';
import { contentDiagramRoute } from './content-diagram-route.mjs';
test('diagram provenance uses real translated project and manual routes', () => {
 assert.equal(contentDiagramRoute('documents','en/tool/start',{series:'tool-guide',language:'en',translationOf:'tool/start'}),'/en/series/tool-guide/docs/tool/start/');
 assert.equal(contentDiagramRoute('project-translations','en/tool',{language:'en',translationOf:'tool'}),'/en/projects/tool/');
 assert.equal(contentDiagramRoute('articles','en/example',{language:'en'}),'/en/articles/example/');
 assert.equal(contentDiagramRoute('projects','tool',{}),'/projects/tool/');
});
