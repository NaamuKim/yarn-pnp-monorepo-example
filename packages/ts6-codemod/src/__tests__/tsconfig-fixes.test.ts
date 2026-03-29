import { describe, it, expect } from 'vitest';
import { fixModuleResolution } from '../tsconfig-fixes/fix-module-resolution';
import { fixEsModuleInterop } from '../tsconfig-fixes/fix-esmodule-interop';
import { fixStrict } from '../tsconfig-fixes/fix-strict';
import { applyAllTsconfigFixes } from '../tsconfig-fixes/index';

// ── fixModuleResolution (BC #1 – PR #62338) ──────────────────────────────────

describe('fixModuleResolution', () => {
  it('rewrites "node" to "bundler"', () => {
    const config = { compilerOptions: { moduleResolution: 'node' } };
    const changed = fixModuleResolution(config);
    expect(changed).toBe(true);
    expect(config.compilerOptions.moduleResolution).toBe('bundler');
  });

  it('rewrites "classic" to "bundler"', () => {
    const config = { compilerOptions: { moduleResolution: 'classic' } };
    const changed = fixModuleResolution(config);
    expect(changed).toBe(true);
    expect(config.compilerOptions.moduleResolution).toBe('bundler');
  });

  it('leaves "bundler" unchanged', () => {
    const config = { compilerOptions: { moduleResolution: 'bundler' } };
    const changed = fixModuleResolution(config);
    expect(changed).toBe(false);
    expect(config.compilerOptions.moduleResolution).toBe('bundler');
  });

  it('leaves "nodenext" unchanged', () => {
    const config = { compilerOptions: { moduleResolution: 'nodenext' } };
    const changed = fixModuleResolution(config);
    expect(changed).toBe(false);
  });

  it('returns false when compilerOptions is absent', () => {
    const config = {};
    expect(fixModuleResolution(config)).toBe(false);
  });
});

// ── fixEsModuleInterop (BC #2 & #3 – PR #62567) ──────────────────────────────

describe('fixEsModuleInterop', () => {
  it('removes esModuleInterop: false', () => {
    const config = { compilerOptions: { esModuleInterop: false } };
    const changed = fixEsModuleInterop(config);
    expect(changed).toBe(true);
    expect('esModuleInterop' in config.compilerOptions).toBe(false);
  });

  it('removes allowSyntheticDefaultImports: false', () => {
    const config = { compilerOptions: { allowSyntheticDefaultImports: false } };
    const changed = fixEsModuleInterop(config);
    expect(changed).toBe(true);
    expect('allowSyntheticDefaultImports' in config.compilerOptions).toBe(false);
  });

  it('removes both flags at once', () => {
    const config = {
      compilerOptions: { esModuleInterop: false, allowSyntheticDefaultImports: false },
    };
    const changed = fixEsModuleInterop(config);
    expect(changed).toBe(true);
    expect('esModuleInterop' in config.compilerOptions).toBe(false);
    expect('allowSyntheticDefaultImports' in config.compilerOptions).toBe(false);
  });

  it('does not touch esModuleInterop: true', () => {
    const config = { compilerOptions: { esModuleInterop: true } };
    const changed = fixEsModuleInterop(config);
    expect(changed).toBe(false);
    expect(config.compilerOptions.esModuleInterop).toBe(true);
  });

  it('returns false when compilerOptions is absent', () => {
    expect(fixEsModuleInterop({})).toBe(false);
  });
});

// ── fixStrict (BC #8 – PR #63089) ─────────────────────────────────────────────

describe('fixStrict', () => {
  it('adds strict: false when strict is absent', () => {
    const config = { compilerOptions: { target: 'ES2020' } };
    const changed = fixStrict(config);
    expect(changed).toBe(true);
    expect(config.compilerOptions.strict).toBe(false);
  });

  it('does not touch existing strict: true', () => {
    const config = { compilerOptions: { strict: true } };
    const changed = fixStrict(config);
    expect(changed).toBe(false);
    expect(config.compilerOptions.strict).toBe(true);
  });

  it('does not touch existing strict: false', () => {
    const config = { compilerOptions: { strict: false } };
    const changed = fixStrict(config);
    expect(changed).toBe(false);
  });

  it('returns false when compilerOptions is absent', () => {
    expect(fixStrict({})).toBe(false);
  });
});

// ── applyAllTsconfigFixes (integration) ──────────────────────────────────────

describe('applyAllTsconfigFixes', () => {
  it('applies all three fixes to a TS5-style tsconfig', () => {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        moduleResolution: 'node',
        esModuleInterop: false,
        allowSyntheticDefaultImports: false,
        // strict is absent
      },
    };
    const result = applyAllTsconfigFixes(config);
    expect(result.moduleResolution).toBe(true);
    expect(result.esModuleInterop).toBe(true);
    expect(result.strict).toBe(true);
    expect(config.compilerOptions.moduleResolution).toBe('bundler');
    expect('esModuleInterop' in config.compilerOptions).toBe(false);
    expect(config.compilerOptions.strict).toBe(false);
  });

  it('reports false for already-correct tsconfig', () => {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        moduleResolution: 'bundler',
        strict: true,
      },
    };
    const result = applyAllTsconfigFixes(config);
    expect(result.moduleResolution).toBe(false);
    expect(result.esModuleInterop).toBe(false);
    expect(result.strict).toBe(false);
  });
});
