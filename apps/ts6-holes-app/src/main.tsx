// BC #5 – noUncheckedSideEffectImports default changed to true
// microsoft/TypeScript#58941 (introduced in TS 5.6, made default in TS 6.0)
//
// TS5 behaviour: side-effect imports of unknown file types were silently allowed.
// TS6 behaviour: noUncheckedSideEffectImports defaults to true → TS2882 error:
//   "Cannot find module or type declarations for side-effect import of './index.css'."
//
// CODEMOD GAP: ts5to6 never scans src/ for side-effect imports.
//   Option A – tsconfig codemod: add "noUncheckedSideEffectImports": false (preserve TS5 behaviour)
//   Option B – source codemod: detect CSS/asset imports and insert vite-env.d.ts with
//              /// <reference types="vite/client" />  (proper fix)
//
// tsc error with TS6 default:
//   src/main.tsx(6,8): error TS2882: Cannot find module or type declarations
//   for side-effect import of './index.css'.
import './index.css';   // ← TS2882 in TS6

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
