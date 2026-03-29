// ─── BC #9: const enum incompatible with erase-only transpilation ──────────────
// microsoft/TypeScript#61011 (PR, TS 5.8 flag --erasableSyntaxOnly)
// Related long-standing issue: microsoft/TypeScript#5243
//
// TS5: const enum exported from a library was valid. TypeScript inlined the
//   numeric values at every usage site.
//   → Works fine when tsc is the sole compiler.
//
// TS6 context: TypeScript 5.8 introduced --erasableSyntaxOnly (opt-in).
//   Bundlers (esbuild, SWC, Vite's native TS transform) erase types without
//   reading imported modules → they cannot inline const enum values → runtime ReferenceError.
//   Node.js 23.6+ native type-stripping also cannot handle const enum.
//
// While --erasableSyntaxOnly is opt-in today, it is the direction TS6 ecosystem
// is heading. If ANY consumer of your library uses erase-only transpilation
// (common in monorepos!), exported const enums silently produce broken runtime output.
//
// error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
//
// CODEMOD GAP:
//   ts5to6 never reads .ts source files. A codemod could:
//     1. Find all "export const enum Foo { … }" declarations.
//     2. Rewrite to "export enum Foo { … }" (drop the const).
//        — Safe: behaviour is identical when tsc compiles the whole project.
//        — Side effect: enum object is emitted at runtime (tiny overhead).
//     OR
//     3. Rewrite to "export const Foo = { … } as const" + type alias.
//        — Better: fully erasable and tree-shakeable.

// ────────── TS5 code (breaks with --erasableSyntaxOnly or erase-only tools) ──────────
export const enum Direction {     // ← TS1294 with --erasableSyntaxOnly
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export function move(dir: Direction): string {
  return `Moving ${dir}`;
}

// ────────── TS6-safe equivalents ──────────────────────────────────────────────
//
// Option A – plain enum (always-emitted object, no inlining):
// export enum Direction { Up = 'UP', Down = 'DOWN', Left = 'LEFT', Right = 'RIGHT' }
//
// Option B – const object + type alias (erasable, tree-shakeable):
// export const Direction = { Up: 'UP', Down: 'DOWN', Left: 'LEFT', Right: 'RIGHT' } as const;
// export type Direction = (typeof Direction)[keyof typeof Direction];
