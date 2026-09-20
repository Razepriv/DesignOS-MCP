import { describe, it, expect } from 'vitest';
import { ComponentResolver } from '../src/resolver.js';
import { DependencySandbox } from '../src/sandbox.js';
import { SourceRegistry } from '@designos/source-registry';
import * as os from 'os';
import * as path from 'path';

describe('ComponentResolver', () => {
  it('should find and resolve components', async () => {
    const registry = new SourceRegistry();
    const resolver = new ComponentResolver(registry, { allowedLicenses: ['MIT'] });
    
    const candidates = await resolver.findComponents('button', { framework: 'react' });
    expect(candidates).toBeInstanceOf(Array);
    
    if (candidates.length > 0) {
      const resolved = await resolver.resolveComponent(candidates[0], '/tmp/proj');
      expect(resolved.isCompatible).toBe(true);
      expect(resolved.installInstructions.length).toBeGreaterThan(0);
    }
  });
});

describe('DependencySandbox', () => {
  it('should create sandbox and manage dependencies', async () => {
    const tmpDir = path.join(os.tmpdir(), 'designos-sandbox-test-' + Date.now());
    const sandbox = new DependencySandbox(tmpDir);
    
    const dir = await sandbox.createSandbox('proj-1');
    expect(dir).toContain('proj-1');
    
    const installRes = await sandbox.installDependency('proj-1', 'react', '18.2.0');
    expect(installRes.success).toBe(true);
    
    const deps = await sandbox.getInstalledDeps('proj-1');
    expect(deps.length).toBe(1);
    expect(deps[0].name).toBe('react');
    expect(deps[0].version).toBe('18.2.0');
  });
});
