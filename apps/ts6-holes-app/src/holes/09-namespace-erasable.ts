// ─── BC #10: namespace with runtime values incompatible with erasableSyntaxOnly ─
// microsoft/TypeScript#61011 (PR, TS 5.8 --erasableSyntaxOnly)
//
// TS5: namespace (or module) declarations with value-level exports were common,
//   especially as a grouping mechanism or for declaration merging.
//
// TS6 context: --erasableSyntaxOnly (from TS 5.8, direction of TS6 ecosystem)
//   requires all TypeScript syntax to be purely type-level. A namespace that
//   contains functions, variables, or classes has runtime code → cannot be erased.
//
// error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
//
// EXCEPTION: a namespace that contains ONLY type-level constructs (interface,
// type alias, abstract class without implementation) IS considered erasable.
// TypeScript's checker is smart enough to allow those.
//
// CODEMOD GAP:
//   ts5to6 never reads .ts source files. A codemod could:
//     1. Find namespace declarations with any value-level member.
//     2. Option A – flatten: move each export to module scope with a name-prefix.
//        e.g.  namespace Api { export function get() {} }
//           →  export function ApiGet() {}
//     3. Option B – convert to a plain object:
//        e.g.  namespace Api { export function get() {} }
//           →  export const Api = { get() {} };
//     Option B is the least invasive and preserves call-site syntax.

// ────────── TS5 code (breaks with --erasableSyntaxOnly) ──────────
export namespace Api {            // ← TS1294: contains runtime function
  export function get(url: string) {
    return fetch(url).then((r) => r.json());
  }
  export function post(url: string, body: unknown) {
    return fetch(url, { method: 'POST', body: JSON.stringify(body) });
  }
}

// This IS fine with erasableSyntaxOnly (type-only namespace):
export namespace ApiTypes {
  export interface Response<T> { data: T; status: number }
  export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
}

// ────────── TS6-safe equivalent for Api (plain object): ──────────────────────
// export const Api = {
//   get(url: string) { return fetch(url).then(r => r.json()); },
//   post(url: string, body: unknown) { return fetch(url, { method: 'POST', body: JSON.stringify(body) }); },
// };
