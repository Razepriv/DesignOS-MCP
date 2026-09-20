import { describe, it, expect } from 'vitest';
import { TinyFishAdapter } from '../src/tinyfish-adapter.js';
import { CaptureEngine } from '../src/capture.js';
import { PlaywrightAdapter } from '../src/playwright-adapter.js';

describe('TinyFishAdapter', () => {
  it('throws when api key is missing', async () => {
    const adapter = new TinyFishAdapter();
    expect(() => adapter.isAvailable()).not.toThrow();
    if (!adapter.isAvailable()) {
      await expect(adapter.search('test')).rejects.toThrow(/TINYFISH_API_KEY required/);
    }
  });
});

describe('CaptureEngine', () => {
  it('instantiates', () => {
    const p = new PlaywrightAdapter();
    const c = new CaptureEngine(p);
    expect(c).toBeDefined();
  });
});
