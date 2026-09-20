import { describe, it, expect } from 'vitest';
import { LicensePolicy } from '../src/policy.js';

describe('License Policy', () => {
  it('should classify MIT as PERMISSIVE', () => {
    const policy = new LicensePolicy();
    expect(policy.classify('MIT')).toBe('PERMISSIVE');
    expect(policy.canAutoInstall('PERMISSIVE')).toBe(true);
  });
  
  it('should create correct license record', () => {
    const policy = new LicensePolicy();
    const record = policy.createRecord('MySource', 'http://example.com', 'GPL');
    expect(record.classification).toBe('REFERENCE_ONLY');
    expect(record.modificationAllowed).toBe(false);
  });
});
