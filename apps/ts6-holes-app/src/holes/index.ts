export { resolutionNote } from './01-module-resolution-node';
export { mountApp } from './02-esmodule-interop';
export { Formatters } from './03-module-keyword';
export { assertToWithNote } from './04-import-assert';
export { getEnv, resolveFromRoot } from './05-types-default-empty';
export { outFileNote } from './06-out-file-removed';
export { double, getLength, first } from './07-strict-default-true';
export { Direction, move } from './08-const-enum-erasable';
export { Api } from './09-namespace-erasable';
export type { ApiTypes } from './09-namespace-erasable';

export interface Hole {
  id: string;
  pr: string;
  breaks: string;
  fix: string;
}

export const holes: Hole[] = [
  {
    id: '#1',
    pr: '62338',
    breaks: '"moduleResolution": "node" removed. tsc errors with TS6046.',
    fix: 'Detect "node" → rewrite to "bundler" (Vite/webpack) or "nodenext" (Node.js server).',
  },
  {
    id: '#2',
    pr: '62567',
    breaks: '"esModuleInterop": false now an error (TS5107). Always true in TS6.',
    fix: 'Detect false value → remove the line from tsconfig.',
  },
  {
    id: '#3',
    pr: '62567',
    breaks: '"allowSyntheticDefaultImports": false now an error (TS5107).',
    fix: 'Detect false value → remove the line from tsconfig.',
  },
  {
    id: '#4',
    pr: '62876',
    breaks: '"module Foo {}" is TS1344. Must use "namespace Foo {}" keyword.',
    fix: 'Regex/AST scan src/**/*.ts – replace non-ambient "module " with "namespace ".',
  },
  {
    id: '#5',
    pr: '63077',
    breaks: 'import assert {} deprecated (TS2836). Replace with import with {}.',
    fix: 'AST walk ImportDeclaration.assertClause → rename keyword to "with".',
  },
  {
    id: '#6',
    pr: '58941',
    breaks: 'noUncheckedSideEffectImports defaults to true → CSS/asset imports TS2882.',
    fix: 'Scan src/ for side-effect imports → add vite-env.d.ts ref OR set option false.',
  },
  {
    id: '#7',
    pr: '63054',
    breaks: '"types" defaults to [] → @types/node globals (process, __dirname) vanish.',
    fix: 'Scan devDeps for @types/* + scan src/ for globals → populate "types": [...].',
  },
  {
    id: '#8',
    pr: '62669',
    breaks: 'outFile + module amd/umd/system/none + moduleResolution classic removed (TS5101/TS6046).',
    fix: 'Detect these options in tsconfig → error with migration advice toward a bundler.',
  },
  {
    id: '#9',
    pr: '63089',
    breaks: 'strict defaults to true → latent TS7006/TS2531/TS2532 errors appear.',
    fix: 'If "strict" absent → add "strict": false as safe migration step.',
  },
  {
    id: '#10',
    pr: '61011',
    breaks: 'const enum / namespace-with-values breaks erasableSyntaxOnly (TS1294).',
    fix: 'Scan src/ → rewrite const enum to enum or as const; namespace to plain object.',
  },
];
