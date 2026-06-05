import assert from 'node:assert/strict';
import { createDocument, entityNode, actionNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, emitJavaScriptWithSourceMap } from '../dist/index.js';

for (let index = 0; index < 100; index += 1) {
  const document = createDocument({ id: `doc_${index}`, name: `Doc${index}`, nodes: [
    entityNode({ id: `ent_${index}`, name: 'Todo', fields: [{ id: `field_title_${index}`, name: 'title', type: 'Text' }] }),
    actionNode({ id: `action_${index}`, name: 'updateTodo', input: 'Todo', returns: 'Patch' })
  ] });
  const output = emitJavaScript(document);
  const mapped = emitJavaScriptWithSourceMap(document, { targetPath: `doc_${index}.js` });
  const todoMapping = mapped.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === `ent_${index}`);
  assert.match(output, /export const TodoSchema/);
  assert.match(output, /export function updateTodo/);
  assert.equal(mapped.code, output);
  assert.equal(mapped.sourceMap.target.language, 'javascript');
  assert.equal(todoMapping.generatedSpan.targetPath, `doc_${index}.js`);
}
