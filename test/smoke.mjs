import assert from 'node:assert/strict';
import { createDocument, entityNode, latticeNode, actionNode, capabilityNode, effectNode, externNode, migrationNode, nativeSourceNode, stateNode, targetNode, viewNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, emitJavaScriptWithSourceMap, renderJavaScriptAst, renderJavaScriptAstWithSourceMap, toJavaScriptAst } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  latticeNode({ id: 'lat_tags', name: 'TagSet', carrier: 'Set<Text>', laws: ['semilattice', 'commutative'], frontierCrdt: { packageName: '@shapeshift-labs/frontier-crdt', exportName: 'createCrdtOrSetLattice' } }),
  capabilityNode({ id: 'cap_http', name: 'HttpRequest', capability: 'http.request', category: 'network', adapters: [
    { target: { language: 'javascript', platform: 'browser' }, symbol: 'fetch', kind: 'host' }
  ] }),
  effectNode({ id: 'effect_persist', name: 'PersistTodo', capability: 'storage.write', input: 'Todo', returns: 'Json', resources: ['TodoDb.todos'] }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [{ id: 'title', name: 'title', type: 'Text' }] }),
  stateNode({ id: 'state_todo', name: 'TodoDb', collections: [{ id: 'todos', name: 'todos', type: { kind: 'map', key: 'Text', value: 'Todo' } }] }),
  viewNode({ id: 'view_todo_list', name: 'TodoList', reads: ['TodoDb.todos'], dispatches: ['action_add'], props: [{ id: 'view_prop_disabled', name: 'disabled', type: 'Boolean' }], events: [{ id: 'view_event_save', name: 'save', action: 'action_add' }], renders: [{ id: 'render_save_button', kind: 'element', tagName: 'Button', identityKey: 'save', text: 'Save', props: [{ name: 'disabled', expression: 'disabled' }], events: [{ name: 'press', action: 'save' }] }] }),
  migrationNode({ id: 'migration_todo_v1_v2', name: 'TodoV1ToV2', fromVersion: '1', toVersion: '2', changes: [{ id: 'change_add_title', kind: 'addField', target: 'Todo.title' }], invariants: ['title_present'] }),
  targetNode({ id: 'target_js', name: 'javascript', target: { language: 'javascript', emitPath: 'doc.js', moduleFormat: 'esm' } }),
  nativeSourceNode({ id: 'native_todo_js', name: 'TodoJs', language: 'javascript', parser: 'typescript-estree', sourcePath: 'doc.js', sourceHash: 'sha256:doc', symbol: 'Todo', frontierNodeIds: ['entity_todo', 'action_add'], losses: [{ id: 'loss_runtime_schema', kind: 'runtimeOnly', message: 'schema emitted as descriptor', severity: 'info' }] }),
  externNode({ id: 'extern_persist', name: 'persistTodo', language: 'javascript', symbol: 'persistTodo', signature: { input: 'Todo', returns: 'Patch' }, effects: ['storage'] }),
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
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'PersistTodoEffect'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'addTodoAction'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'persistTodoExtern'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoDbStateDescriptor'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoListView'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'viewRenderFunction' && declaration.name === 'renderTodoListView'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoV1ToV2Migration'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'javascriptTarget'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoJsNativeSource'));
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
assert.match(out, /export const PersistTodoEffect/);
assert.match(out, /export const addTodoAction/);
assert.match(out, /export const persistTodoExtern/);
assert.match(out, /export const TodoDbStateDescriptor/);
assert.match(out, /export const TodoListView/);
assert.match(out, /export function renderTodoListView\(props = \{\}\)/);
assert.match(out, /tagName: "Button"/);
assert.match(out, /key: "save"/);
assert.match(out, /disabled: props\.disabled/);
assert.match(out, /press: \{ action: "save" \}/);
assert.match(out, /export const TodoV1ToV2Migration/);
assert.match(out, /export const javascriptTarget/);
assert.match(out, /export const TodoJsNativeSource/);
assert.match(out, /"tagName":"Button"/);
assert.match(out, /http\.request/);
assert.match(out, /storage\.write/);
assert.match(out, /createCrdtOrSetLattice/);
assert.match(out, /export const TodoSchema/);
assert.match(out, /export function addTodo/);
