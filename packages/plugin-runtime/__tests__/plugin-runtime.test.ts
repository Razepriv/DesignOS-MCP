import { describe, it, expect } from 'vitest';
import { PluginLoader } from '../src/loader.js';
import { PermissionSystem } from '../src/permissions.js';

describe('Plugin Runtime', () => {
  it('should manage permissions', () => {
    const perms = new PermissionSystem();
    perms.grant('file:read');
    expect(perms.check('file:read')).toBe(true);
    expect(perms.check('file:write')).toBe(false);
  });
});
