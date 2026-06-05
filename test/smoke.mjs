import assert from 'node:assert/strict';
import { createDocument, entityNode, latticeNode, actionNode, capabilityNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, emitJavaScriptWithSourceMap, renderJavaScriptAst, renderJavaScriptAstWithSourceMap, toJavaScriptAst } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  latticeNode({ id: 'lat_tags', name: 'TagSet', carrier: 'Set<Text>', laws: ['semilattice', 'commutative'], frontierCrdt: { packageName: '@shapeshift-labs/frontier-crdt', exportName: 'createCrdtOrSetLattice' } }),
  capabilityNode({ id: 'cap_http', name: 'HttpRequest', capability: 'http.request', category: 'network', adapters: [
    { target: { language: 'javascript', platform: 'browser' }, symbol: 'fetch', kind: 'host' }
  ] }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [{ id: 'title', name: 'title', type: 'Text' }] }),
  actionNode({ id: 'action_add', name: 'addTodo', input: 'Todo', returns: 'Patch' })
] });
const out = emitJavaScript(document);
const ast = toJavaScriptAst(document);
const rendered = renderJavaScriptAstWithSourceMap(ast, {
  sourceMapId: 'map_doc_js',
  sourcePath: 'doc.frontier',
  targetPath: 'doc.js',
  semanticIndexId: 'semantic_doc',
  sourceSpansBySemanticNodeId: {
    entity_todo: { path: 'doc.frontier', startLine: 8, startColumn: 1, endLine: 10, endColumn: 2 }
  },
  semanticSymbolIdsBySemanticNodeId: {
    entity_todo: 'symbol_todo'
  },
  semanticOccurrenceIdsBySemanticNodeId: {
    entity_todo: 'occurrence_todo'
  },
  lossIdsBySemanticNodeId: {
    entity_todo: ['loss_schema_runtime']
  },
  evidence: [{ id: 'evidence_projection', kind: 'projection', summary: 'smoke projection evidence' }]
});
const emitted = emitJavaScriptWithSourceMap(document, { targetPath: 'doc.js' });
assert.equal(ast.kind, 'javascript.module');
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoSchema'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'HttpRequestCapability'));
assert.equal(ast.declarations.find((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoSchema').sourceRef.semanticNodeId, 'entity_todo');
assert.equal(renderJavaScriptAst(ast), out);
assert.equal(rendered.code, out);
assert.equal(emitted.code, out);
assert.equal(emitted.ast.kind, 'javascript.module');
assert.equal(rendered.sourceMap.kind, 'frontier.lang.sourceMap');
assert.equal(rendered.sourceMap.id, 'map_doc_js');
assert.equal(rendered.sourceMap.target.language, 'javascript');
assert.equal(rendered.sourceMap.targetPath, 'doc.js');
assert.equal(rendered.sourceMap.semanticIndexId, 'semantic_doc');
assert.equal(rendered.sourceMap.metadata.precision, 'declaration');
assert.equal(rendered.sourceMap.evidence[0].id, 'evidence_projection');
const todoMapping = rendered.sourceMap.mappings.find((mapping) => mapping.semanticNodeId === 'entity_todo');
assert.equal(todoMapping.generatedName, 'TodoSchema');
assert.equal(todoMapping.generatedSpan.targetPath, 'doc.js');
assert.equal(todoMapping.generatedSpan.startLine > 0, true);
assert.equal(todoMapping.sourceSpan.path, 'doc.frontier');
assert.equal(todoMapping.semanticSymbolId, 'symbol_todo');
assert.equal(todoMapping.semanticOccurrenceId, 'occurrence_todo');
assert.deepEqual(todoMapping.lossIds, ['loss_schema_runtime']);
assert.deepEqual(todoMapping.evidenceIds, ['evidence_projection']);
assert.deepEqual(todoMapping.metadata.regionIds, ['title']);
assert.match(out, /export const TagSetLattice/);
assert.match(out, /export const HttpRequestCapability/);
assert.match(out, /http\.request/);
assert.match(out, /createCrdtOrSetLattice/);
assert.match(out, /export const TodoSchema/);
assert.match(out, /export function addTodo/);
