export type RetrievalDepth = 0 | 1 | 2 | 3 | 4;

export interface ContextBudget {
  maxContextTokens: number;
  maxSources: number;
  maxFullArtifacts: number;
  maxBrowserCalls: number;
  maxImages: number;
  maxModelCalls: number;
  preferredRetrievalDepth: RetrievalDepth;
}

export const DEFAULT_BUDGET: ContextBudget = {
  maxContextTokens: 12000,
  maxSources: 12,
  maxFullArtifacts: 2,
  maxBrowserCalls: 8,
  maxImages: 10,
  maxModelCalls: 20,
  preferredRetrievalDepth: 2 as RetrievalDepth,
};

export interface RetrievalRequest {
  query: string;
  maxDepth?: RetrievalDepth;
}

export interface RetrievalPlan {
  allowedDepth: RetrievalDepth;
  tokenAllocation: number;
}

export interface TokenMetrics {
  tokensBefore: number;
  tokensAfter: number;
  tokensSaved: number;
}

export class TokenGovernor {
  private metrics = { tokensBefore: 0, tokensAfter: 0, tokensSaved: 0 };
  
  constructor(private budget: ContextBudget = DEFAULT_BUDGET) {}
  
  plan(request: RetrievalRequest): RetrievalPlan {
    const allowedDepth = request.maxDepth !== undefined 
      ? Math.min(request.maxDepth, this.budget.preferredRetrievalDepth) as RetrievalDepth 
      : this.budget.preferredRetrievalDepth;
      
    return {
      allowedDepth,
      tokenAllocation: Math.floor(this.budget.maxContextTokens / this.budget.maxSources),
    };
  }
  
  track(before: number, after: number): void {
    this.metrics.tokensBefore += before;
    this.metrics.tokensAfter += after;
    this.metrics.tokensSaved += (before - after);
  }
  
  getMetrics(): TokenMetrics {
    return { ...this.metrics };
  }
  
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  shouldExpand(currentDepth: RetrievalDepth, confidence: number): boolean {
    if (currentDepth >= 4) return false;
    return confidence < 0.8;
  }
}
