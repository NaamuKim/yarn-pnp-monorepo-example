import type { FileInfo, API } from 'jscodeshift';

// BC #4 – microsoft/TypeScript PR #62876
// "module Foo {}" is TS1540 in TS6. Replace with "namespace Foo {}".
//
// Safe: only matches `module <Identifier>`, not `module "string"` or `module 'string'`
// (ambient module declarations like `declare module 'foo' {}` have a string literal id,
//  which doesn't match [A-Za-z_$], so they are left untouched).
export default function transform(fileInfo: FileInfo, _api: API): string {
  return fileInfo.source.replace(
    /\bmodule\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    'namespace $1',
  );
}
