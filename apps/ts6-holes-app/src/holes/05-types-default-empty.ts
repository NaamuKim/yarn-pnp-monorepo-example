// ─── BC #6: "types" now defaults to [] instead of all installed @types/* ───────
// microsoft/TypeScript#62195 / PR #63054 (TS 6.0)
//
// TS5: if "types" was absent from tsconfig, TypeScript auto-loaded every
//   @types/* package found in node_modules.
//   → @types/node, @types/jest, @types/lodash … all silently included.
//
// TS6: "types" defaults to [].
//   → Globals from @types/node (process, Buffer, __dirname …) no longer exist
//     unless "types": ["node"] is added explicitly.
//   → Test globals (describe, it, expect …) from @types/jest / @types/vitest
//     also disappear.
//
// tsc error example (no "types": ["node"] in tsconfig):
//   error TS2304: Cannot find name 'process'.
//   error TS2304: Cannot find name '__dirname'.
//   error TS2304: Cannot find name 'Buffer'.
//
// CODEMOD GAP:
//   ts5to6 does not populate "types". A codemod could:
//     1. Read devDependencies in package.json for all "@types/*" entries.
//     2. Cross-reference which globals are actually used in src/ (process, Buffer, etc.).
//     3. Append the required entries to "types": [...] in tsconfig.
//   This is fully automatable: it is pure static analysis over text.

// ────────── TS5 code (errors in TS6 when @types/node not in "types") ──────────
// tsc error: TS2304 – Cannot find name 'process'.
export function getEnv(key: string): string | undefined {
  return process.env[key];   // ← TS2304 in TS6 if "types" is missing ["node"]
}

// tsc error: TS2304 – Cannot find name '__dirname'.
export function resolveFromRoot(relative: string): string {
  return `${__dirname}/${relative}`;   // ← TS2304 in TS6
}

// ────────── TS6-safe equivalent (what the codemod should produce) ──────────
// tsconfig.json:
//   "types": ["node"]
// (After adding that, the above code compiles fine.)
