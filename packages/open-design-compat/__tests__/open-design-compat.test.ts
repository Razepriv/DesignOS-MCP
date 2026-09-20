import { describe, it, expect } from 'vitest';
import { Normalizer } from '../src/normalizer.js';
import { PluginCompat } from '../src/plugin-compat.js';

describe('Open Design Compat', () => {
  it('should normalize Open Design format', () => {
    const normalizer = new Normalizer();
    const result = normalizer.normalizeFormat({ id: 'od-1', title: 'Test' });
    expect(result.id).toBe('od-1');
    expect(result.designosCompatible).toBe(true);
  });
  
  it('should convert plugin manifest', () => {
    const compat = new PluginCompat();
    const manifest = compat.normalizeManifest({ pluginId: 'test-plugin', permissions: ['read'] });
    expect(manifest.id).toBe('test-plugin');
    expect(manifest.capabilities).toContain('read');
  });
});
