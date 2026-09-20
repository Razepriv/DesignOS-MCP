import { describe, it, expect } from 'vitest';
import { MockupStudio } from '../src/mockup-studio.js';
import { StoreStudio } from '../src/store-studio.js';

describe('Production Studios', () => {
  it('MockupStudio generates mockups', () => {
    const studio = new MockupStudio();
    const res = studio.generateDeviceMockup(Buffer.from('test'), { type: 'iphone', color: 'black' }, { perspective: 'flat', background: '#fff' });
    expect(res.buffer).toBeDefined();
  });

  it('StoreStudio generates campaigns', () => {
    const studio = new StoreStudio();
    const camp = studio.generateCampaign('p1', { platforms: ['ios'], locales: ['en-US'] });
    expect(camp.assets.length).toBe(1);
    expect(camp.assets[0].platform).toBe('ios');
  });
});
