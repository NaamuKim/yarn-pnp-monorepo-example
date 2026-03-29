import jscodeshift from 'jscodeshift';

type TransformFn = (
  fileInfo: { source: string; path: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api: any,
  options?: Record<string, unknown>,
) => string | null | undefined;

/**
 * Runs a jscodeshift transform function against the given source string and
 * returns the result. Uses the `tsx` parser by default so TypeScript + JSX
 * syntax is fully supported.
 */
export function applyTransform(
  transform: TransformFn,
  source: string,
  parser: 'ts' | 'tsx' | 'babel' = 'tsx',
): string {
  const j = jscodeshift.withParser(parser);
  const result = transform(
    { source, path: 'test.ts' },
    { jscodeshift: j, stats: () => {}, report: () => {} },
    {},
  );
  return result ?? source;
}
