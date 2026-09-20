import { describe, it, expect } from 'vitest';
import { canTransition, validateTransition } from '../src/stage.js';

describe('stage transitions', () => {
  it('should allow valid transitions', () => {
    expect(canTransition('new', 'discovery')).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(canTransition('new', 'ready_to_ship')).toBe(false);
  });

  it('should throw on validation of invalid transitions', () => {
    expect(() => validateTransition('new', 'ready_to_ship')).toThrow();
  });
});
