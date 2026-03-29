// ─── BC #2 & #3: esModuleInterop / allowSyntheticDefaultImports: false banned ──
// microsoft/TypeScript#62529 / PR #62567 (TS 6.0)
//
// TS5: you could disable safe interop:
//   "esModuleInterop": false
//   "allowSyntheticDefaultImports": false
//
// TS6: both options are locked to true. Setting either to false is now an error:
//   error TS5107: Option 'esModuleInterop' cannot be set to 'false'.
//   error TS5107: Option 'allowSyntheticDefaultImports' cannot be set to 'false'.
//
// Impact on source code: if you relied on esModuleInterop:false and were using
// the namespace-import style to avoid synthetic defaults, that pattern now looks
// redundant (synthetic defaults are always available).
//
// CODEMOD GAP:
//   ts5to6 does not scan tsconfig for these options. A codemod could:
//     1. Find "esModuleInterop": false  → remove the line entirely.
//     2. Find "allowSyntheticDefaultImports": false → remove the line.
//     3. Optionally flag imports that were written in the "no-interop" style,
//        e.g.  import * as React from 'react'  used as a workaround for missing
//        default, and suggest  import React from 'react'  instead.

// Code that only compiles without esModuleInterop
// (namespace import as a workaround for missing synthetic default):
import * as ReactDOM from 'react-dom/client';

export function mountApp(root: HTMLElement) {
  // With esModuleInterop:false this was the only safe pattern.
  // With TS6's always-on interop, `import ReactDOM from 'react-dom/client'` works too.
  return ReactDOM.createRoot(root);
}
