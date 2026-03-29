// ─── BC #4: legacy "module" keyword for namespaces is now a hard error ─────────
// microsoft/TypeScript#62211 / PR #62876 (TS 6.0)
//
// TS5: both spellings were accepted for internal modules:
//   module Foo { ... }      ← old TS 1.x / 0.x spelling
//   namespace Foo { ... }   ← modern spelling (since TS 1.5)
//
// TS6: "module Foo { ... }" is now a hard error:
//   error TS1540: A 'namespace' declaration should not be declared using the 'module' keyword.
//                Please use the 'namespace' keyword instead.
//
// Note: ambient "declare module '...'" declarations (for .d.ts augmentation) are
// still valid — only the non-ambient "module Foo { }" form is banned.
//
// CODEMOD GAP:
//   ts5to6 never scans .ts source files. A codemod could:
//     Regex over every .ts/.tsx:
//       /(?<!["\s])(?:^|\n)\s*(export\s+)?module\s+(\w)/
//     and rewrite "module Foo" → "namespace Foo".
//   This is a pure textual substitution — no AST needed for the common case.

// ────────── TS5 code (errors in TS6) ──────────
// tsc error: TS1540 – A 'namespace' declaration should not be declared using the 'module' keyword.
module Formatters {                         // ← ERROR in TS6
  export function currency(n: number) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);
  }
  export function date(d: Date) {
    return new Intl.DateTimeFormat('ko-KR').format(d);
  }
}

// ────────── TS6-safe equivalent (what the codemod should produce) ──────────
// namespace Formatters {
//   export function currency(n: number) { ... }
//   export function date(d: Date) { ... }
// }

export { Formatters };
