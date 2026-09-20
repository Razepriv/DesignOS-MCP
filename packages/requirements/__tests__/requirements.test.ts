import { describe, it, expect } from 'vitest';
import { RequirementsGraph } from '../src/graph';

describe('RequirementsGraph', () => {
  it('should add requirement and relation', () => {
    const graph = new RequirementsGraph();
    const r1 = graph.addRequirement({
      reason: 'test', confidence: 1, designImpact: 'UI', technicalImpact: 'API', source: 'user'
    });
    const r2 = graph.addRequirement({
      reason: 'test2', confidence: 0.5, designImpact: 'UX', technicalImpact: 'DB', source: 'user'
    });
    
    graph.addRelation(r1, r2, 'depends_on');
    
    expect(graph.getDesignConsequences()).toEqual(['UI', 'UX']);
    expect(graph.toJSON().edges.length).toBe(1);
  });
});
