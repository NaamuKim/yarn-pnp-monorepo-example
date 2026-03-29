// BC #1 – microsoft/TypeScript PR #62338
// "moduleResolution": "node" and "classic" are removed in TS6 (TS6046 / TS5107).
//
// Rewrite strategy:
//   "node" / "classic" → "bundler"  (projects with a bundler: Vite, webpack, Rollup)
//
// Note: a more sophisticated codemod would inspect devDependencies for
// bundler markers (vite, webpack, @rollup/*, esbuild) vs Node.js server
// markers and choose "bundler" vs "nodenext" accordingly. This function
// applies the most common safe default.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fixModuleResolution(config: Record<string, any>): boolean {
  const opts = config.compilerOptions;
  if (!opts) return false;
  const current: string | undefined = opts.moduleResolution;
  if (current === 'node' || current === 'classic') {
    opts.moduleResolution = 'bundler';
    return true;
  }
  return false;
}
