// ─── BC #7: --outFile removed ──────────────────────────────────────────────────
// microsoft/TypeScript#62199 / PR #62669 (TS 6.0, same PR as module amd/umd/system removal)
//
// TS5: "outFile" concatenated all input files into one output file.
//   Required "module": "amd" | "system" | "none".
//   Widely used in pre-bundler era (RequireJS / SystemJS setups).
//
// TS6: "outFile" is removed. Any tsconfig with this option errors:
//   error TS5101: Option 'outFile' is not supported. Use a bundler instead.
//
// Companion removals in the same PR #62669:
//   "module": "amd"     → removed
//   "module": "umd"     → removed
//   "module": "system"  → removed
//   "module": "none"    → removed
//   "moduleResolution": "classic" → removed
//
// These were all tied to the pre-ESM bundling story. TypeScript 6 drops them
// entirely in favour of real bundlers (Vite, Rollup, webpack, esbuild …).
//
// CODEMOD GAP:
//   ts5to6 does not check for outFile, module amd/umd/system, or
//   moduleResolution classic. A codemod could:
//     1. Detect "outFile" in any tsconfig → emit actionable error with migration advice.
//     2. Detect "module": "amd" | "umd" | "system" → same.
//     3. Detect "moduleResolution": "classic" → rewrite to "bundler" or error.
//   Automated rewrite is safe for (3); (1) and (2) require human decision
//   (which bundler to adopt), so the codemod should error+explain rather than
//   silently rewrite.

// Example tsconfig that would error in TS6:
// {
//   "compilerOptions": {
//     "module": "amd",           // ← TS6 error TS5101
//     "outFile": "bundle.js",    // ← TS6 error TS5101
//     "moduleResolution": "classic"  // ← TS6 error TS6046
//   }
// }

export const outFileNote =
  'outFile + module amd/umd/system/none + moduleResolution classic are all removed in TS6. ' +
  'Migrate to a real bundler (Vite, Rollup, webpack).';
