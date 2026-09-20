import { describe, it, expect } from 'vitest';
import { ImplementationPlanner } from '../src/planner.js';

describe('ImplementationPlanner', () => {
  it('should generate a full implementation plan', () => {
    const planner = new ImplementationPlanner();
    const plan = planner.generatePlan(
      { id: 'sb-1', frames: [{ path: '/', name: 'Home' }] },
      { id: 'brand-1', colors: { primary: '#000' } },
      { id: 'tokens-1', tokens: { spacing: { sm: '4px' } } }
    );
    
    expect(plan.id).toBeDefined();
    expect(plan.pages.length).toBe(1);
    expect(plan.pages[0].path).toBe('/');
    expect(plan.tokenBindings.colors.primary).toBe('#000');
    expect(plan.performanceBudget.maxFirstLoadKb).toBe(200);
  });
});
