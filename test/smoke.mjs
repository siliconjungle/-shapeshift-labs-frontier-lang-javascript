import assert from 'node:assert/strict';
import { createDocument, entityNode, latticeNode, actionNode } from '@shapeshift-labs/frontier-lang-kernel';
import { emitJavaScript } from '../dist/index.js';

const document = createDocument({ id: 'doc', name: 'Doc', nodes: [
  latticeNode({ id: 'lat_tags', name: 'TagSet', carrier: 'Set<Text>', laws: ['semilattice', 'commutative'], frontierCrdt: { packageName: '@shapeshift-labs/frontier-crdt', exportName: 'createCrdtOrSetLattice' } }),
  entityNode({ id: 'entity_todo', name: 'Todo', fields: [{ id: 'title', name: 'title', type: 'Text' }] }),
  actionNode({ id: 'action_add', name: 'addTodo', input: 'Todo', returns: 'Patch' })
] });
const out = emitJavaScript(document);
assert.match(out, /export const TagSetLattice/);
assert.match(out, /createCrdtOrSetLattice/);
assert.match(out, /export const TodoSchema/);
assert.match(out, /export function addTodo/);
