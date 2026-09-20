import { describe, it, expect } from 'vitest';
import { CraftKernel } from '../src/kernel.js';
import { typographyRules } from '../src/modules/typography.js';

describe('CraftKernel', () => {
  it('should load and evaluate rules', () => {
    const kernel = new CraftKernel();
    kernel.loadModule({ name: 'typography', rules: typographyRules as any });
    const rules = kernel.getRules(['typography']);
    expect(rules.length).toBe(5);
  });
});
