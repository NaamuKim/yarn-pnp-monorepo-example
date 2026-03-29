import { describe, it, expect } from 'vitest';
import { applyTransform } from './helpers';
import transform from '../transforms/namespace-to-object';

describe('namespace-to-object transform (BC #10 – PR #61011)', () => {
  it('converts exported value namespace to const object', () => {
    const input = `
export namespace Api {
  export function get(url: string) {
    return fetch(url).then((r) => r.json());
  }
  export function post(url: string, body: unknown) {
    return fetch(url, { method: 'POST', body: JSON.stringify(body) });
  }
}
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('export const Api =');
    expect(output).not.toContain('export namespace Api');
    expect(output).toContain('get(');
    expect(output).toContain('post(');
  });

  it('preserves type-only namespace (no value exports)', () => {
    // namespace with only interface/type is erasable — must NOT be changed
    const input = `
export namespace ApiTypes {
  export interface Response<T> { data: T; status: number }
  export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
}
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('namespace ApiTypes');
    expect(output).not.toContain('const ApiTypes');
  });

  it('handles non-exported value namespace', () => {
    const input = `
namespace Utils {
  export function add(a: number, b: number) { return a + b; }
}
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('const Utils =');
    expect(output).not.toContain('namespace Utils');
  });

  it('handles export const inside namespace', () => {
    const input = `
export namespace Config {
  export const timeout = 3000;
  export const baseUrl = 'https://api.example.com';
}
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('export const Config =');
    expect(output).not.toContain('namespace Config');
    expect(output).toContain('timeout');
    expect(output).toContain('baseUrl');
  });

  it('preserves ambient module declarations with string id', () => {
    const input = `declare module 'foo' { export const bar: string; }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('handles the exact pattern from ts6-holes-app hole #10', () => {
    const input = `
export namespace Api {
  export function get(url: string) {
    return fetch(url).then((r) => r.json());
  }
  export function post(url: string, body: unknown) {
    return fetch(url, { method: 'POST', body: JSON.stringify(body) });
  }
}

export namespace ApiTypes {
  export interface Response<T> { data: T; status: number }
  export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
}
`.trim();
    const output = applyTransform(transform, input);
    // Value namespace → const object
    expect(output).toContain('export const Api =');
    // "export namespace Api " (with space) to avoid matching "export namespace ApiTypes"
    expect(output).not.toMatch(/export namespace Api\b(?!Types)/);
    // Type-only namespace → unchanged
    expect(output).toContain('export namespace ApiTypes');
    expect(output).not.toContain('const ApiTypes');
  });
});
