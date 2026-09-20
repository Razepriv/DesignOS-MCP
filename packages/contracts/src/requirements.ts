export interface RequirementNode {
  id: string;
  requirement: string;
  reason: string;
  confidence: number;
  designImpact: string;
  technicalImpact: string;
  source: string;
}
