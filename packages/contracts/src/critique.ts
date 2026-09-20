export type CritiqueReviewerRole = 'design' | 'accessibility' | 'engineering' | 'product';

export interface CritiqueFinding {
  id: string;
  reviewer: CritiqueReviewerRole;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screen: string;
  component: string;
  issue: string;
  evidence: string;
  recommendation: string;
  confidence: number;
}
