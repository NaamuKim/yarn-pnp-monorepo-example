// ─── BC #8: strict now defaults to true ───────────────────────────────────────
// microsoft/TypeScript#62213 / PR #63089 area (TS 6.0)
//
// TS5: strict defaulted to false. Code without strict: true compiled happily
//   with implicit any, unchecked this, loose function types, etc.
//
// TS6: strict defaults to true. A project with no "strict" key in tsconfig
//   now compiles as if "strict": true were set, surfacing all latent errors.
//
// Common errors that appear when strict is newly enabled:
//   TS7006: Parameter 'x' implicitly has an 'any' type.
//   TS2531: Object is possibly 'null'.
//   TS2532: Object is possibly 'undefined'.
//   TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
//
// CODEMOD GAP:
//   ts5to6 does not inspect the "strict" field. A codemod could:
//     Safe migration: if "strict" is absent, add "strict": false explicitly
//     so that behaviour is identical to TS5. The developer can then incrementally
//     enable strict on their own schedule.
//   This is a one-line tsconfig insertion — fully automatable, zero risk.

// ────────── TS5 code (compiles with strict:false, errors with strict:true) ──────────

// TS7006: implicit any parameter
export function double(x) {            // ← TS7006 if strict:true
  return x * 2;
}

// TS2531: possibly null
export function getLength(s: string | null) {
  return s.length;                     // ← TS2531 if strict:true (no null check)
}

// TS2532: possibly undefined
export function first(arr: number[]) {
  return arr[0].toFixed(2);            // ← TS2532 if strict:true + noUncheckedIndexedAccess
}

// ────────── TS6-safe equivalents (what incremental strict migration looks like) ──────────
// export function double(x: number) { return x * 2; }
// export function getLength(s: string | null) { return s?.length ?? 0; }
// export function first(arr: number[]) { return arr[0]?.toFixed(2) ?? '0.00'; }
