import { describe, it, expect } from 'vitest';
import { BrandGenerator } from '../src/generator.js';

describe('BrandGenerator', () => {
  it('generates a brand system and tokens', () => {
    const generator = new BrandGenerator(null);
    const system = generator.generate('proj1', { moodboardId: 'm1', keptItems: [] });
    expect(system.projectId).toBe('proj1');
    
    const tokens = generator.generateTokens(system);
    expect(tokens.colors).toHaveProperty('primary');
  });
});
