import assert from 'node:assert/strict';
import { createDocument, entityNode, latticeNode, actionNode, capabilityNode, effectNode, externNode, migrationNode, nativeSourceNode, stateNode, targetNode, typeNode, viewNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, emitJavaScriptWithSourceMap, renderJavaScriptAst, renderJavaScriptAstWithSourceMap, toJavaScriptAst } from '../dist/index.js';
const ref = (name, scope, path) => ({ kind: 'ref', name, scope, path });
const literal = (value) => ({ kind: 'literal', value });
const call = (callee, args, callType) => ({ kind: 'call', callee, args, callType });

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  latticeNode({ id: 'lat_tags', name: 'TagSet', carrier: 'Set<Text>', laws: ['semilattice', 'commutative'], frontierCrdt: { packageName: '@shapeshift-labs/frontier-crdt', exportName: 'createCrdtOrSetLattice' } }),
  capabilityNode({ id: 'cap_http', name: 'HttpRequest', capability: 'http.request', category: 'network', adapters: [
    { target: { language: 'javascript', platform: 'browser' }, symbol: 'fetch', kind: 'host' }
  ] }),
  effectNode({ id: 'effect_persist', name: 'PersistTodo', capability: 'storage.write', input: 'Todo', returns: 'Json', resources: ['TodoDb.todos'] }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [
    { id: 'title', name: 'title', type: 'Text' },
    { id: 'count', name: 'count', type: 'Number' }
  ] }),
  typeNode({ id: 'type_load_state', name: 'LoadState', variants: [
    { id: 'variant_loading', name: 'Loading' },
    { id: 'variant_ready', name: 'Ready', fields: [
      { id: 'variant_ready_value', name: 'value', type: 'Text' },
      { id: 'variant_ready_stale', name: 'stale', type: 'Boolean', optional: true }
    ] },
    { id: 'variant_failed', name: 'Failed', fields: [{ id: 'variant_failed_message', name: 'message', type: 'Text' }] }
  ] }),
  stateNode({ id: 'state_todo', name: 'TodoDb', collections: [{ id: 'todos', name: 'todos', type: { kind: 'map', key: 'Text', value: 'Todo' } }] }),
  viewNode({ id: 'view_todo_list', name: 'TodoList', reads: ['TodoDb.todos'], dispatches: ['action_add'], props: [{ id: 'view_prop_disabled', name: 'disabled', type: 'Boolean' }], events: [{ id: 'view_event_save', name: 'save', action: 'action_add' }], renders: [{ id: 'render_save_button', kind: 'element', tagName: 'Button', identityKey: 'save', text: 'Save', props: [{ name: 'disabled', expression: 'disabled' }], events: [{ name: 'press', action: 'save' }] }] }),
  migrationNode({ id: 'migration_todo_v1_v2', name: 'TodoV1ToV2', fromVersion: '1', toVersion: '2', changes: [{ id: 'change_add_title', kind: 'addField', target: 'Todo.title' }], invariants: ['title_present'] }),
  targetNode({ id: 'target_js', name: 'javascript', target: { language: 'javascript', emitPath: 'doc.js', moduleFormat: 'esm' } }),
  nativeSourceNode({ id: 'native_todo_js', name: 'TodoJs', language: 'javascript', parser: 'typescript-estree', sourcePath: 'doc.js', sourceHash: 'sha256:doc', symbol: 'Todo', frontierNodeIds: ['entity_todo', 'action_add'], losses: [{ id: 'loss_runtime_schema', kind: 'runtimeOnly', message: 'schema emitted as descriptor', severity: 'info' }] }),
  externNode({ id: 'extern_persist', name: 'persistTodo', language: 'javascript', symbol: 'persistTodo', signature: { input: 'Todo', returns: 'Patch' }, effects: ['storage'] }),
  actionNode({ id: 'action_add', name: 'addTodo', input: 'Todo', returns: 'Patch', body: [
    { kind: 'let', id: 'bind_normalized_title', name: 'normalizedTitle', callType: 'Text', value: { expression: 'normalizeTitle(input.title)', expressionAst: call('normalizeTitle', [ref('input.title', 'input', ['title'])], 'Text'), callType: 'Text' } },
    { kind: 'let', id: 'bind_can_write', name: 'canWrite', value: { expression: 'input.enabled == true', expressionAst: { kind: 'binary', op: '==', left: ref('input.enabled', 'input', ['enabled']), right: literal(true) } } },
    { kind: 'let', id: 'bind_next_count', name: 'nextCount', valueType: 'Number', value: { expression: 'input.count + 1', expressionAst: { kind: 'binary', op: '+', left: ref('input.count', 'input', ['count']), right: literal(1) }, valueType: 'Number' } },
    { kind: 'let', id: 'bind_has_count', name: 'hasCount', comparisonType: 'Number', value: { expression: 'input.count > 0', expressionAst: { kind: 'binary', op: '>', left: ref('input.count', 'input', ['count']), right: literal(0) }, comparisonType: 'Number' } },
    { kind: 'let', id: 'bind_payload', name: 'payload', value: { expression: '{ title: input.title, tags: [input.title, "new"] }', expressionAst: { kind: 'object', entries: [
      { key: 'title', value: ref('input.title', 'input', ['title']) },
      { key: 'tags', value: { kind: 'array', elements: [ref('input.title', 'input', ['title']), literal('new')] } }
    ] } } },
    { kind: 'patch', op: 'set', id: 'patch_title', name: 'title', path: '/todos/title', value: { expression: 'normalizedTitle', expressionAst: ref('normalizedTitle', 'local', ['normalizedTitle']) } },
    { kind: 'patch', op: 'set', id: 'patch_count', name: 'count', path: '/todos/count', valueType: 'Number', value: { expression: 'nextCount', expressionAst: ref('nextCount', 'local', ['nextCount']), valueType: 'Number' } },
    { kind: 'patch', op: 'set', id: 'patch_payload', name: 'payload', path: '/todos/payload', value: { expression: 'payload', expressionAst: ref('payload', 'local', ['payload']) } },
    { kind: 'patch', op: 'set', id: 'patch_inline_payload', name: 'inlinePayload', path: '/todos/inlinePayload', value: { expression: '[input.title, "new"]', expressionAst: { kind: 'array', elements: [ref('input.title', 'input', ['title']), literal('new')] } } },
    { kind: 'if', id: 'guard_counted', name: 'counted', comparisonType: 'Number', condition: { expression: 'input.count > 0', expressionAst: { kind: 'binary', op: '>', left: ref('input.count', 'input', ['count']), right: literal(0) }, comparisonType: 'Number' }, body: [
      { kind: 'patch', op: 'set', id: 'patch_counted', name: 'counted', path: '/todos/counted', value: { expression: 'hasCount', expressionAst: ref('hasCount', 'local', ['hasCount']) } }
    ] },
    { kind: 'if', id: 'guard_enabled', name: 'enabled', condition: { expression: 'canWrite && input.enabled', expressionAst: { kind: 'logical', op: '&&', left: ref('canWrite', 'local', ['canWrite']), right: ref('input.enabled', 'input', ['enabled']) } }, body: [
      { kind: 'let', id: 'bind_status_text', name: 'statusText', value: { value: 'ready' } },
      { kind: 'patch', op: 'set', id: 'patch_status', name: 'status', path: '/todos/status', value: { expression: 'statusText', expressionAst: ref('statusText', 'local', ['statusText']) } },
      { kind: 'callEffect', id: 'call_guarded_storage', name: 'guardedPersist', capability: 'storage.write', input: { expression: 'normalizedTitle', expressionAst: ref('normalizedTitle', 'local', ['normalizedTitle']) } }
    ] },
    { kind: 'patch', op: 'insert', id: 'patch_insert', name: 'item', path: '/todos', value: { expression: 'input', expressionAst: ref('input', 'input', []) } },
    { kind: 'patch', op: 'remove', id: 'patch_remove', name: 'oldTitle', path: '/todos/oldTitle' },
    { kind: 'callEffect', id: 'call_storage', name: 'persist', capability: 'storage.write', input: { expression: 'input', expressionAst: ref('input', 'input', []) } },
    { kind: 'return', id: 'return_patches', value: { expression: 'patches', expressionAst: ref('patches', 'patches', []) } }
  ] })
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
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'LoadStateSchema'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'HttpRequestCapability'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'PersistTodoEffect'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'effectRunnerFunction' && declaration.name === 'runPersistTodoEffect'));
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
assert.deepEqual(todoMapping.metadata.regionIds, ['title', 'count']);
assert.match(out, /export const TagSetLattice/);
assert.match(out, /export const HttpRequestCapability/);
assert.match(out, /export const PersistTodoEffect/);
assert.match(out, /export async function runPersistTodoEffect\(input, env\)/);
assert.match(out, /env\.invoke\("storage\.write", input/);
assert.match(out, /resources: \["TodoDb\.todos"\]/);
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
assert.match(out, /export const LoadStateSchema/);
assert.match(out, /"variants":\[\{"id":"variant_loading","name":"Loading"\},\{"fields":\[\{"id":"variant_ready_value","name":"value","type":"Text"\},\{"id":"variant_ready_stale","name":"stale","optional":true,"type":"Boolean"\}\],"id":"variant_ready","name":"Ready"\},\{"fields":\[\{"id":"variant_failed_message","name":"message","type":"Text"\}\],"id":"variant_failed","name":"Failed"\}\]/);
assert.match(out, /export function addTodo/);
assert.match(out, /const patches = \[\];/);
assert.match(out, /const normalizedTitle = normalizeTitle\(input\.title\);/);
assert.match(out, /const canWrite = \(input\.enabled === true\);/);
assert.match(out, /const nextCount = \(input\.count \+ 1\);/);
assert.match(out, /const hasCount = \(input\.count > 0\);/);
assert.match(out, /const payload = \{ "title": input\.title, "tags": \[input\.title, "new"\] \};/);
assert.match(out, /patches\.push\(\{ op: "set", path: "\/todos\/title", value: normalizedTitle \}\);/);
assert.match(out, /patches\.push\(\{ op: "set", path: "\/todos\/count", value: nextCount \}\);/);
assert.match(out, /patches\.push\(\{ op: "set", path: "\/todos\/payload", value: payload \}\);/);
assert.match(out, /patches\.push\(\{ op: "set", path: "\/todos\/inlinePayload", value: \[input\.title, "new"\] \}\);/);
assert.match(out, /if \(\(input\.count > 0\)\) \{\n    patches\.push\(\{ op: "set", path: "\/todos\/counted", value: hasCount \}\);\n  \}/);
assert.match(out, /if \(canWrite && input\.enabled\) \{\n    const statusText = "ready";\n    patches\.push\(\{ op: "set", path: "\/todos\/status", value: statusText \}\);\n    const invoke_call_guarded_storage = env\["storage\.write"\];\n    if \(typeof invoke_call_guarded_storage === "function"\) invoke_call_guarded_storage\(normalizedTitle\);\n  \}/);
assert.match(out, /patches\.push\(\{ op: "insert", path: "\/todos", value: input \}\);/);
assert.match(out, /patches\.push\(\{ op: 'remove', path: "\/todos\/oldTitle" \}\);/);
assert.match(out, /const invoke_call_storage = env\["storage\.write"\];/);
assert.match(out, /if \(typeof invoke_call_storage === "function"\) invoke_call_storage\(input\);/);
assert.match(out, /return patches;/);

const unsupportedExpressionDocument = createDocument({ id: 'bad', name: 'Bad', nodes: [
  actionNode({ id: 'action_bad', name: 'badAction', returns: 'Patch', body: [
    { kind: 'let', id: 'bad_operator', name: 'badOperator', value: { expressionAst: { kind: 'binary', op: '+', left: literal(1), right: literal(2) } } }
  ] })
] });
assert.throws(() => emitJavaScript(unsupportedExpressionDocument), /Unsupported Frontier action expression operator/);
const unsupportedRefDocument = createDocument({ id: 'bad_ref', name: 'BadRef', nodes: [
  actionNode({ id: 'action_bad_ref', name: 'badRefAction', returns: 'Patch', body: [
    { kind: 'let', id: 'bad_ref', name: 'badRef', value: { expressionAst: ref('env.secret', 'env', ['secret']) } }
  ] })
] });
assert.throws(() => emitJavaScript(unsupportedRefDocument), /Unsupported Frontier action expression ref/);
const unsupportedComparisonDocument = createDocument({ id: 'bad_comparison', name: 'BadComparison', nodes: [
  actionNode({ id: 'action_bad_comparison', name: 'badComparisonAction', returns: 'Patch', body: [
    { kind: 'let', id: 'bad_comparison', name: 'badComparison', value: { expressionAst: { kind: 'binary', op: '>', left: ref('input.count', 'input', ['count']), right: literal(0) } } }
  ] })
] });
assert.throws(() => emitJavaScript(unsupportedComparisonDocument), /Unsupported Frontier action expression operator/);
const unsupportedCallDocument = createDocument({ id: 'bad_call', name: 'BadCall', nodes: [
  actionNode({ id: 'action_bad_call', name: 'badCallAction', returns: 'Patch', body: [
    { kind: 'let', id: 'bad_call', name: 'badCall', value: { expressionAst: call('normalizeTitle', [ref('input.title', 'input', ['title'])]) } }
  ] })
] });
assert.throws(() => emitJavaScript(unsupportedCallDocument), /Unsupported Frontier action call type/);

const directReturnDocument = createDocument({ id: 'direct_return', name: 'DirectReturn', nodes: [
  entityNode({ id: 'direct_input', name: 'DirectInput', fields: [
    { id: 'direct_title', name: 'title', type: 'Text' },
    { id: 'direct_count', name: 'count', type: 'Number' }
  ] }),
  actionNode({ id: 'action_next_count', name: 'nextCount', input: 'DirectInput', returns: 'Number', body: [
    { kind: 'return', id: 'return_next_count', valueType: 'Number', value: { expression: 'input.count + 1', expressionAst: { kind: 'binary', op: '+', left: ref('input.count', 'input', ['count']), right: literal(1) }, valueType: 'Number' } }
  ] }),
  actionNode({ id: 'action_normalized_title', name: 'normalizedTitle', input: 'DirectInput', returns: 'Text', body: [
    { kind: 'return', id: 'return_normalized_title', callType: 'Text', value: { expression: 'normalizeTitle(input.title)', expressionAst: call('normalizeTitle', [ref('input.title', 'input', ['title'])], 'Text'), callType: 'Text' } }
  ] })
] });
const directReturnOut = emitJavaScript(directReturnDocument);
assert.match(directReturnOut, /export function nextCount/);
assert.match(directReturnOut, /return \(input\.count \+ 1\);/);
assert.match(directReturnOut, /export function normalizedTitle/);
assert.match(directReturnOut, /return normalizeTitle\(input\.title\);/);

const ifElseDocument = createDocument({ id: 'if_else', name: 'IfElse', nodes: [
  entityNode({ id: 'else_input', name: 'ElseInput', fields: [{ id: 'else_enabled', name: 'enabled', type: 'Boolean' }] }),
  actionNode({ id: 'action_status', name: 'setStatus', input: 'ElseInput', returns: 'Patch', body: [
    { kind: 'if', id: 'guard_enabled', condition: { expression: 'input.enabled', expressionAst: ref('input.enabled', 'input', ['enabled']) }, body: [
      { kind: 'patch', op: 'set', id: 'patch_ready', name: 'ready', path: '/status', value: { value: 'ready' } }
    ], elseId: 'else_disabled', elseBody: [
      { kind: 'patch', op: 'set', id: 'patch_blocked', name: 'blocked', path: '/status', value: { value: 'blocked' } }
    ] }
  ] })
] });
assert.match(emitJavaScript(ifElseDocument), /if \(input\.enabled\) \{\n    patches\.push\(\{ op: "set", path: "\/status", value: "ready" \}\);\n  \} else \{\n    patches\.push\(\{ op: "set", path: "\/status", value: "blocked" \}\);\n  \}/);

const matchDocument = createDocument({ id: 'match', name: 'Match', nodes: [
  entityNode({ id: 'match_input', name: 'MatchInput', fields: [{ id: 'match_status', name: 'status', type: 'Text' }] }),
  actionNode({ id: 'action_match_status', name: 'setStatusByMatch', input: 'MatchInput', returns: 'Patch', body: [
    { kind: 'match', id: 'match_status', name: 'status', value: { expression: 'input.status', expressionAst: ref('input.status', 'input', ['status']) }, cases: [
      { id: 'case_ready', name: 'ready', value: { value: 'ready' }, body: [{ kind: 'patch', op: 'set', id: 'patch_ready', name: 'ready', path: '/status', value: { value: 'ready' } }] },
      { id: 'case_blocked', name: 'blocked', value: { value: 'blocked' }, body: [{ kind: 'patch', op: 'set', id: 'patch_blocked', name: 'blocked', path: '/status', value: { value: 'blocked' } }] }
    ], defaultBody: [{ kind: 'patch', op: 'set', id: 'patch_pending', name: 'pending', path: '/status', value: { value: 'pending' } }] }
  ] })
] });
assert.match(emitJavaScript(matchDocument), /switch \(input\.status\) \{\n    case "ready": \{\n      patches\.push\(\{ op: "set", path: "\/status", value: "ready" \}\);\n      break;\n    \}\n    case "blocked": \{\n      patches\.push\(\{ op: "set", path: "\/status", value: "blocked" \}\);\n      break;\n    \}\n    default: \{\n      patches\.push\(\{ op: "set", path: "\/status", value: "pending" \}\);\n    \}\n  \}/);

const forInDocument = createDocument({ id: 'for_in', name: 'ForIn', nodes: [
  entityNode({ id: 'for_input', name: 'ForInput', fields: [{ id: 'for_items', name: 'items', type: 'Json' }] }),
  actionNode({ id: 'action_copy_names', name: 'copyNames', input: 'ForInput', returns: 'Patch', body: [
    { kind: 'forIn', id: 'for_items', itemName: 'item', collection: { expression: 'input.items', expressionAst: ref('input.items', 'input', ['items']) }, body: [
      { kind: 'patch', op: 'set', id: 'patch_last_name', name: 'lastName', path: '/lastName', value: { expression: 'item.name', expressionAst: ref('item.name', 'local', ['item', 'name']) } }
    ] }
  ] })
] });
assert.match(emitJavaScript(forInDocument), /for \(const item of input\.items\) \{\n    patches\.push\(\{ op: "set", path: "\/lastName", value: item\.name \}\);\n  \}/);

const repeatDocument = createDocument({ id: 'repeat', name: 'Repeat', nodes: [
  entityNode({ id: 'repeat_input', name: 'RepeatInput', fields: [{ id: 'repeat_count', name: 'count', type: 'Number' }] }),
  actionNode({ id: 'action_repeat_index', name: 'recordLastIndex', input: 'RepeatInput', returns: 'Patch', body: [
    { kind: 'repeat', id: 'repeat_items', indexName: 'index', count: { expression: 'input.count', expressionAst: ref('input.count', 'input', ['count']) }, body: [
      { kind: 'patch', op: 'set', id: 'patch_last_index', name: 'lastIndex', path: '/lastIndex', value: { expression: 'index', expressionAst: ref('index', 'local', ['index']) } }
    ] }
  ] })
] });
assert.match(emitJavaScript(repeatDocument), /for \(let index = 0; index < Number\(input\.count\); index\+\+\) \{\n    patches\.push\(\{ op: "set", path: "\/lastIndex", value: index \}\);\n  \}/);
