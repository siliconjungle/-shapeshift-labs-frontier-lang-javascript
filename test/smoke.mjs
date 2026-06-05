import assert from 'node:assert/strict';
import { createDocument, entityNode, latticeNode, actionNode, capabilityNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript, renderJavaScriptAst, toJavaScriptAst } from '../dist/index.js';

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
assert.equal(ast.kind, 'javascript.module');
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'TodoSchema'));
assert.ok(ast.declarations.some((declaration) => declaration.kind === 'exportConst' && declaration.name === 'HttpRequestCapability'));
assert.equal(renderJavaScriptAst(ast), out);
assert.match(out, /export const TagSetLattice/);
assert.match(out, /export const HttpRequestCapability/);
assert.match(out, /http\.request/);
assert.match(out, /createCrdtOrSetLattice/);
assert.match(out, /export const TodoSchema/);
assert.match(out, /export function addTodo/);
