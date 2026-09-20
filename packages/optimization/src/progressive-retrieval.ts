import { TokenGovernor, RetrievalDepth } from './token-governor.js';

export const RETRIEVAL_LEVELS = {
  0: 'metadata',
  1: 'micro-summary', 
  2: 'design-dna',
  3: 'relevant-fragments',
  4: 'complete-artifact',
} as const;

export interface FullContent {
  metadata: string;
  microSummary: string;
  designDna: string;
  relevantFragments: string;
  completeArtifact: string;
}

export interface RetrievalResult {
  content: string;
  depth: RetrievalDepth;
}

export class ProgressiveRetriever {
  constructor(private governor: TokenGovernor) {}
  
  /** Retrieve at the minimum depth needed */
  retrieve(entityId: string, maxDepth?: RetrievalDepth): RetrievalResult {
    // Mock retrieval using the governor plan
    const plan = this.governor.plan({ query: entityId, maxDepth });
    const depth = plan.allowedDepth;
    
    return {
      content: `Content for ${entityId} at level ${RETRIEVAL_LEVELS[depth]}`,
      depth,
    };
  }
  
  /** Produce output at a specific depth from full content */
  atDepth(content: FullContent, depth: RetrievalDepth): string {
    switch (depth) {
      case 0: return content.metadata;
      case 1: return content.microSummary;
      case 2: return content.designDna;
      case 3: return content.relevantFragments;
      case 4: return content.completeArtifact;
      default: return content.metadata;
    }
  }
}
