import { performance } from 'node:perf_hooks';
import { createDocument, entityNode, actionNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, emitJavaScriptWithSourceMap } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  entityNode({ id: 'ent_todo', name: 'Todo', fields: [
    { id: 'field_title', name: 'title', type: 'Text' },
    { id: 'field_done', name: 'done', type: 'Bool' }
  ] }),
  actionNode({ id: 'action_update', name: 'updateTodo', input: 'Todo', returns: 'Patch' })
] });

const start = performance.now();
let bytes = 0;
let mappedBytes = 0;
let mappings = 0;
for (let index = 0; index < 500; index += 1) {
  bytes += emitJavaScript(document).length;
  const mapped = emitJavaScriptWithSourceMap(document, { targetPath: 'doc.js' });
  mappedBytes += mapped.code.length + JSON.stringify(mapped.sourceMap).length;
  mappings += mapped.sourceMap.mappings.length;
}
console.log(JSON.stringify({ emits: 500, bytes, mappedBytes, mappings, durationMs: Number((performance.now() - start).toFixed(2)) }));
