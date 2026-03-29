import type { FileInfo, API } from 'jscodeshift';

// BC #9 – microsoft/TypeScript PR #61011
// `const enum` is TS1294 with --erasableSyntaxOnly (default direction in TS6 ecosystem).
//
// Safe migration: drop `const` → regular enum.
// The enum object is always emitted at runtime (tiny overhead), but it's
// fully compatible with erase-only transpilers (esbuild, SWC, Node.js type-stripping).
export default function transform(fileInfo: FileInfo, _api: API): string {
  return fileInfo.source.replace(/\bconst\s+(enum\b)/g, '$1');
}
