import { describe, it, expect } from 'vitest';
import { applyTransform } from './helpers';
import transform from '../transforms/module-keyword';

describe('module-keyword transform (BC #4 – PR #62876)', () => {
  it('replaces module keyword with namespace', () => {
    const input = `
module Formatters {
  export function currency(n: number) {
    return n.toString();
  }
}
export { Formatters };
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('namespace Formatters');
    expect(output).not.toContain('module Formatters');
  });

  it('handles export module declaration', () => {
    const input = `export module Utils { export const x = 1; }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`export namespace Utils { export const x = 1; }`);
  });

  it('handles declare module (non-string) declaration', () => {
    const input = `declare module Internal { export type Id = string; }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`declare namespace Internal { export type Id = string; }`);
  });

  it('preserves ambient module declarations with string id', () => {
    // declare module 'foo' {} must NOT be changed
    const input = `declare module 'foo' { export const bar: string; }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('preserves module.exports references', () => {
    const input = `module.exports = { foo: 1 };`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('handles the exact pattern from ts6-holes-app hole #4', () => {
    const input = `
module Formatters {
  export function currency(n: number) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);
  }
  export function date(d: Date) {
    return new Intl.DateTimeFormat('ko-KR').format(d);
  }
}
export { Formatters };
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toMatch(/^namespace Formatters/);
    expect(output).not.toMatch(/^module Formatters/);
  });
});
