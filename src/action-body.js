export function actionBodyStatements(node, { safeIdentifier }) {
  const body = node.body ?? [];
  if (!body.length) return ['void state;', 'void input;', 'void env;', 'return [];'];
  const statements = ['void state;', 'const patches = [];'];
  let hasReturn = false;
  for (const record of body) {
    if (record.kind === 'patch' && (record.op === 'set' || record.op === 'insert' || record.op === 'merge')) {
      statements.push(`patches.push({ op: ${JSON.stringify(record.op)}, path: ${JSON.stringify(record.path ?? '')}, value: ${actionValueExpression(record.value)} });`);
      continue;
    }
    if (record.kind === 'patch' && record.op === 'remove') {
      statements.push(`patches.push({ op: 'remove', path: ${JSON.stringify(record.path ?? '')} });`);
      continue;
    }
    if (record.kind === 'callEffect') {
      const local = safeIdentifier(`invoke_${record.id ?? record.name ?? 'effect'}`);
      statements.push(`const ${local} = env[${JSON.stringify(record.capability ?? record.name ?? '')}];`);
      statements.push(`if (typeof ${local} === "function") ${local}(${actionValueExpression(record.input)});`);
      continue;
    }
    if (record.kind === 'return') {
      statements.push(`return ${actionValueExpression(record.value)};`);
      hasReturn = true;
    }
  }
  if (!hasReturn) statements.push('return patches;');
  return statements;
}

function actionValueExpression(value) {
  if (value && Object.prototype.hasOwnProperty.call(value, 'value')) return JSON.stringify(value.value);
  const expression = String(value?.expression ?? '').trim();
  if (/^(input|state|patches|env)(?:\.[A-Za-z_$][\w$]*)*$/.test(expression)) return expression;
  if (/^(true|false|null|-?\d+(?:\.\d+)?)$/.test(expression)) return expression;
  return JSON.stringify(expression);
}
