// ─── BC #5: import assertions ("assert {…}") deprecated → import attributes ("with {…}") ──
// microsoft/TypeScript#62210 / PR #63077 (TS 6.0)
//
// TS5: TypeScript 4.5+ supported the Stage 3 import assertions proposal:
//   import data from './data.json' assert { type: 'json' };
//
// TS6: The TC39 proposal was revised. "assert" was replaced by "with".
//   TypeScript 6 deprecates "assert {}" and will warn (or error):
//   error TS2836: Import assertions have been superseded by import attributes.
//                Use 'with' instead of 'assert'.
//
// CODEMOD GAP:
//   ts5to6 never touches .ts source files. A codemod could:
//     Regex over every .ts/.tsx:
//       /\bassert\s*\{/g  → replace with  "with {"
//     Edge case: the identifier "assert" inside normal code must be preserved.
//     AST-based replacement:  look for ImportDeclaration.assertClause → rename to withClause.
//
// ────────── TS5 code (deprecated/erroring in TS6) ──────────
// tsc with TS6: warning/error TS2836 on the 'assert' keyword.

// Simulated — actual JSON import assertions require "resolveJsonModule": true
// and the runtime to support them, but the syntax change is universal.
export type ImportAssertExample = {
  // Before (TS4.5 – TS5.x):
  //   import meta from '../package.json' assert { type: 'json' };
  //
  // After (TS5.3+ / TS6 required):
  //   import meta from '../package.json' with { type: 'json' };
  //
  // The difference is purely the keyword: "assert" → "with".
  // No runtime semantics change — both are import attributes under the hood.
  description: string;
};

export const assertToWithNote =
  'Replace  assert { type: "json" }  with  with { type: "json" }  in every import statement.';
