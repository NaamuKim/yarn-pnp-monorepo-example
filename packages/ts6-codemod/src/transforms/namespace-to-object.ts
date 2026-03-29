import type { FileInfo, API } from 'jscodeshift';

// BC #10 – microsoft/TypeScript PR #61011
// namespace with runtime values is TS1294 with --erasableSyntaxOnly.
//
// Strategy: convert value-containing namespaces to exported const objects.
// Type-only namespaces (only interface / type alias / abstract class) are left
// as-is — they ARE erasable and require no change.
//
// Handled member types:
//   export function foo() {}  →  foo() {}   (method shorthand)
//   export const/let/var x = v  →  x: v    (property)
//   export class Foo {}  →  Foo: Foo        (skipped, left in namespace — complex)
//
// Uses jscodeshift AST (tsx parser) to safely distinguish value vs type members.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

function isValueDeclaration(declType: string): boolean {
  return ['FunctionDeclaration', 'VariableDeclaration'].includes(declType);
}

function hasValueExports(statements: AnyNode[]): boolean {
  return statements.some(
    (stmt: AnyNode) =>
      stmt.type === 'ExportNamedDeclaration' &&
      stmt.declaration &&
      isValueDeclaration(stmt.declaration.type),
  );
}

function buildProperty(j: AnyNode, decl: AnyNode): AnyNode {
  if (decl.type === 'FunctionDeclaration') {
    // export function foo(params) { body } → foo(params) { body }
    const fn = j.functionExpression(null, decl.params, decl.body);
    if (decl.returnType) fn.returnType = decl.returnType;
    if (decl.typeParameters) fn.typeParameters = decl.typeParameters;
    const prop = j.property('init', j.identifier(decl.id.name), fn);
    prop.method = true;
    return prop;
  }
  if (decl.type === 'VariableDeclaration') {
    // export const x = v → x: v
    const declarator = decl.declarations[0];
    return j.property(
      'init',
      declarator.id,
      declarator.init ?? j.identifier('undefined'),
    );
  }
  // Unsupported declaration type — produce a placeholder so callers know to review
  return j.property('init', j.identifier('_unsupported'), j.identifier('undefined'));
}

export default function transform(fileInfo: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let changed = false;

  root.find(j.TSModuleDeclaration).forEach((path: AnyNode) => {
    const node = path.node;

    // Skip: declare module "foo" {} — string-literal id
    if (node.id?.type !== 'Identifier') return;

    // Skip: no block body (e.g. namespace Foo.Bar)
    const body = node.body;
    if (!body || body.type !== 'TSModuleBlock') return;

    // Skip: type-only namespace — nothing to rewrite
    if (!hasValueExports(body.body)) return;

    const name: string = node.id.name;

    const properties = body.body
      .filter(
        (stmt: AnyNode) =>
          stmt.type === 'ExportNamedDeclaration' &&
          stmt.declaration &&
          isValueDeclaration(stmt.declaration.type),
      )
      .map((stmt: AnyNode) => buildProperty(j, stmt.declaration));

    const objExpr = j.objectExpression(properties);
    const constDecl = j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier(name), objExpr),
    ]);

    // `export namespace Foo {}` → parent is ExportNamedDeclaration
    const parentNode = path.parent?.node;
    const isExported = parentNode?.type === 'ExportNamedDeclaration';
    const replacement = isExported
      ? j.exportNamedDeclaration(constDecl, [])
      : constDecl;
    const targetPath = isExported ? path.parent : path;

    j(targetPath).replaceWith(replacement);
    changed = true;
  });

  return changed ? root.toSource() : fileInfo.source;
}
