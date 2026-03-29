// ─── BC #1: moduleResolution "node" removed ───────────────────────────────────
// microsoft/TypeScript#62200 / PR #62338 (TS 6.0)
//
// TS5: "moduleResolution": "node" was the long-standing default and widely used.
// TS6: "node" is removed. TypeScript 6 errors immediately:
//   error TS6046: Argument for '--moduleResolution' option must be:
//   'node16', 'nodenext', 'bundler', 'node10'.
//
// Note: "node10" is the renamed alias kept for compatibility, but it is also
// marked deprecated. The real intended targets are "bundler" or "nodenext".
//
// CODEMOD GAP:
//   ts5to6 never inspects "moduleResolution". A codemod could:
//     - If the project uses Vite/webpack/Rollup → rewrite to "bundler"
//     - If the project is a Node.js server → rewrite to "nodenext" + "module": "nodenext"
//     - Otherwise → rewrite to "node16" as a conservative step
//
//   Heuristic: check package.json devDeps for vite/webpack/esbuild → "bundler".
//   Check scripts for "node" execution with no bundler → "nodenext".
//
// Example of resolution behaviour difference:
//   With "node": bare specifiers resolve via node_modules only.
//   With "bundler": supports package.json "exports" + extensionless imports.
//   With "nodenext": requires explicit .js extension in relative imports.

export const resolutionNote =
  '"moduleResolution": "node" was valid in TS5 but is removed in TS6. ' +
  'Rewrite to "bundler" for browser/Vite projects or "nodenext" for Node.js servers.';
