// BC #2 & #3 – microsoft/TypeScript PR #62567
// `"esModuleInterop": false` and `"allowSyntheticDefaultImports": false`
// are now hard errors in TS6 (TS5107). Both options are permanently true.
//
// Fix: remove the false entries. Omitting them is equivalent to `true` in TS6.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fixEsModuleInterop(config: Record<string, any>): boolean {
  const opts = config.compilerOptions;
  if (!opts) return false;
  let changed = false;
  if (opts.esModuleInterop === false) {
    delete opts.esModuleInterop;
    changed = true;
  }
  if (opts.allowSyntheticDefaultImports === false) {
    delete opts.allowSyntheticDefaultImports;
    changed = true;
  }
  return changed;
}
