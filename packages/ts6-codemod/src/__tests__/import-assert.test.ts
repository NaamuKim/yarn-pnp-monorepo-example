import { describe, it, expect } from 'vitest';
import { applyTransform } from './helpers';
import transform from '../transforms/import-assert';

describe('import-assert transform (BC #5 – PR #63077)', () => {
  it('replaces assert with with in import statement', () => {
    const input = `import data from './data.json' assert { type: 'json' };`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`import data from './data.json' with { type: 'json' };`);
  });

  it('handles double-quoted module specifier', () => {
    const input = `import meta from "../package.json" assert { type: "json" };`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`import meta from "../package.json" with { type: "json" };`);
  });

  it('handles whitespace before assert', () => {
    const input = `import x from 'mod'  assert { type: 'json' };`;
    const output = applyTransform(transform, input);
    expect(output).toContain('with {');
    expect(output).not.toContain('assert {');
  });

  it('does not replace assert used as an identifier', () => {
    // `assert` as a regular identifier (e.g. Node.js assert module) must not change
    const input = `import assert from 'node:assert';`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('does not replace assert() function calls', () => {
    const input = `assert(value !== null, 'must not be null');`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('handles multiple imports in one file', () => {
    const input = `
import a from './a.json' assert { type: 'json' };
import b from './b.json' assert { type: 'json' };
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toBe(`
import a from './a.json' with { type: 'json' };
import b from './b.json' with { type: 'json' };
`.trim());
  });
});
