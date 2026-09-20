import { RequirementsGraph, RequirementNode } from './graph';

export class RequirementsBuilder {
  buildFromSummary(summary: any): RequirementNode[] {
    const nodes: RequirementNode[] = [];
    
    if (summary.domains?.audience?.includes('B2B')) {
      nodes.push({
        id: 'temp-1',
        reason: 'B2B Audience detected',
        confidence: 0.8,
        designImpact: 'Needs enterprise density and clear datagrids',
        technicalImpact: 'Requires robust data table components',
        source: 'Interview Summary'
      });
    }

    return nodes;
  }
}
