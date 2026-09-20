export type RetrievalDepth = 'shallow' | 'medium' | 'deep';

export interface ContextBudget {
  tokensAllowed: number;
  tokensUsed: number;
  depth: RetrievalDepth;
}
