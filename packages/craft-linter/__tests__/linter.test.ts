import { describe, it, expect } from 'vitest';
import { CraftLinter } from '../src/linter.js';
import { CraftKernel } from '@designos/craft';
import { detectGenericPatterns } from '../src/anti-generic.js';

describe('CraftLinter', () => {
  it('should run linter', () => {
    const kernel = new CraftKernel();
    kernel.loadModule({ name: 'test', rules: [{ id: 'rule1', severity: 'error', check: 'Check 1' }] });
    const linter = new CraftLinter(kernel);
    const result = linter.lint({ id: 't1', elements: [{ type: 'error', ruleId: 'rule1' }] }, ['test']);
    
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].ruleId).toBe('rule1');
  });

  it('should detect generic patterns', () => {
    const findings = detectGenericPatterns({ id: 't1', elements: [{ id: 'e1', style: 'generic-saas-purple' }] });
    expect(findings.length).toBe(1);
    expect(findings[0].pattern).toBe('generic-saas-purple');
  });
});
