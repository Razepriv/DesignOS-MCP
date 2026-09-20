import { describe, it, expect } from 'vitest';
import { SourceRegistry } from '../src/registry.js';
import { validateRegistry } from '../src/validator.js';

describe('SourceRegistry', () => {
  it('should initialize and get stats', () => {
    const registry = new SourceRegistry([]);
    const stats = registry.getStats();
    expect(stats.total).toBe(0);
  });

  it('should validate empty registry with errors', () => {
    const result = validateRegistry([]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
