// BC #8 – microsoft/TypeScript PR #63089 area
// `strict` defaults to `true` in TS6. A project that omitted `strict` in TS5
// compiled with loose settings (implicit any, nullable access, etc.). After
// upgrading to TS6 those files will suddenly fail.
//
// Safe migration step: if `strict` is absent, explicitly set it to `false`
// so behaviour is identical to TS5. The developer can then incrementally
// opt into strict mode on their own schedule.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fixStrict(config: Record<string, any>): boolean {
  const opts = config.compilerOptions;
  if (!opts) return false;
  if (!('strict' in opts)) {
    opts.strict = false;
    return true;
  }
  return false;
}
