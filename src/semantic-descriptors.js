export function semanticDescriptorDeclarations(document, context) {
  const declarations = [];
  for (const node of Object.values(document.nodes)) {
    if (node.kind === 'action') declarations.push(actionDescriptor(node, context));
    if (node.kind === 'effect') declarations.push(effectDescriptor(node, context), effectRunnerFunction(node, context));
    if (node.kind === 'extern') declarations.push(externDescriptor(node, context));
    if (node.kind === 'state') declarations.push(stateDescriptor(node, context));
    if (node.kind === 'migration') declarations.push(migrationDescriptor(node, context));
    if (node.kind === 'target') declarations.push(targetDescriptor(node, context));
    if (node.kind === 'nativeSource') declarations.push(nativeSourceDescriptor(node, context));
  }
  return declarations;
}

function descriptor(name, value, node, context, extra = {}) {
  return {
    kind: 'exportConst',
    name,
    value,
    freeze: true,
    sourceRef: context.sourceRef(node, extra)
  };
}

function actionDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}Action`, {
    name: node.name,
    input: node.input,
    returns: node.returns,
    reads: node.reads ?? [],
    writes: node.writes ?? [],
    uses: node.uses ?? [],
    throws: node.throws ?? [],
    body: node.body ?? []
  }, node, { sourceRef });
}

function effectDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}Effect`, {
    name: node.name,
    capability: node.capability,
    input: node.input,
    returns: node.returns,
    resources: node.resources ?? [],
    semantics: node.semantics
  }, node, { sourceRef });
}

function effectRunnerFunction(node, { safeIdentifier, sourceRef }) {
  return {
    kind: 'effectRunnerFunction',
    name: `run${safeIdentifier(node.name)}Effect`,
    value: {
      name: node.name,
      capability: node.capability,
      resources: node.resources ?? [],
      semantics: node.semantics
    },
    sourceRef: sourceRef(node)
  };
}

function externDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}Extern`, {
    name: node.name,
    language: node.language,
    symbol: node.symbol,
    capability: node.capability,
    input: node.signature?.input,
    returns: node.signature?.returns,
    effects: node.effects ?? [],
    resources: node.resources ?? [],
    target: node.target
  }, node, { sourceRef });
}

function stateDescriptor(node, { safeIdentifier, sourceRef }) {
  const regionIds = (node.collections ?? []).map((collection) => collection.id);
  return descriptor(`${safeIdentifier(node.name)}StateDescriptor`, {
    name: node.name,
    collections: node.collections ?? []
  }, node, { sourceRef }, { regionIds });
}

function migrationDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}Migration`, {
    name: node.name,
    fromVersion: node.fromVersion,
    toVersion: node.toVersion,
    changes: node.changes ?? [],
    invariants: node.invariants ?? []
  }, node, { sourceRef });
}

function targetDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}Target`, { name: node.name, target: node.target }, node, { sourceRef });
}

function nativeSourceDescriptor(node, { safeIdentifier, sourceRef }) {
  return descriptor(`${safeIdentifier(node.name)}NativeSource`, {
    name: node.name,
    language: node.language,
    parser: node.parser,
    parserVersion: node.parserVersion,
    sourcePath: node.sourcePath,
    sourceHash: node.sourceHash,
    symbol: node.symbol,
    ast: node.ast,
    frontierNodeIds: node.frontierNodeIds ?? [],
    losses: node.losses ?? [],
    target: node.target
  }, node, { sourceRef }, { regionIds: node.frontierNodeIds ?? [] });
}
