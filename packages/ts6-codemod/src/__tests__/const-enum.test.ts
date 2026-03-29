import { describe, it, expect } from 'vitest';
import { applyTransform } from './helpers';
import transform from '../transforms/const-enum';

describe('const-enum transform (BC #9 – PR #61011)', () => {
  it('removes const from const enum', () => {
    const input = `const enum Direction { Up = 'UP', Down = 'DOWN' }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`enum Direction { Up = 'UP', Down = 'DOWN' }`);
  });

  it('handles exported const enum', () => {
    const input = `export const enum Status { OK = 200, NotFound = 404 }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`export enum Status { OK = 200, NotFound = 404 }`);
  });

  it('handles declare const enum', () => {
    const input = `declare const enum Flags { None = 0, Read = 1, Write = 2 }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(`declare enum Flags { None = 0, Read = 1, Write = 2 }`);
  });

  it('does not affect regular const declarations', () => {
    const input = `const x = 42;`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('does not affect regular enum declarations', () => {
    const input = `enum Color { Red, Green, Blue }`;
    const output = applyTransform(transform, input);
    expect(output).toBe(input);
  });

  it('handles the exact pattern from ts6-holes-app hole #9', () => {
    const input = `
export const enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export function move(dir: Direction): string {
  return \`Moving \${dir}\`;
}
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toContain('export enum Direction');
    expect(output).not.toContain('const enum');
    // Function body and other code must remain intact
    expect(output).toContain('export function move');
  });

  it('transforms multiple const enums in one file', () => {
    const input = `
const enum A { X = 1 }
const enum B { Y = 2 }
`.trim();
    const output = applyTransform(transform, input);
    expect(output).toBe(`enum A { X = 1 }\nenum B { Y = 2 }`);
  });
});
