import { ProjectStage } from './stage.js';
import { RequirementNode } from './requirements.js';
import { DesignDNA } from './design-dna.js';
import { LineageEntry } from './lineage.js';

export type InputType = 'prd' | 'prompt' | 'url' | 'screenshot' | 'existing_product' | 'idea' | 'brand_kit' | 'codebase';

export interface Constraint {
  id: string;
  description: string;
}

export interface Preference {
  id: string;
  description: string;
}

export interface Decision {
  id: string;
  description: string;
  kind: 'keep' | 'modify' | 'reject' | 'constraint' | 'preference';
}

export interface Approval {
  id: string;
  stage: ProjectStage;
  approvedBy: string;
  timestamp: string;
}

export interface RejectedDirection {
  id: string;
  reason: string;
}

export interface Reference {
  id: string;
  url: string;
}

export interface ResearchRun {
  id: string;
  timestamp: string;
  findings: string[];
}

export interface MoodboardRef {
  id: string;
}

export interface StoryboardRef {
  id: string;
}

export interface BrandSystemRef {
  id: string;
}

export interface DesignTokensRef {
  id: string;
}

export interface ImplementationPlanRef {
  id: string;
}

export interface QARunRef {
  id: string;
}

export interface CritiqueRunRef {
  id: string;
}

export interface ProductionAssetRef {
  id: string;
}

export interface PromptPackRef {
  id: string;
}

export interface PluginSnapshotRef {
  id: string;
}

export interface TokenMetrics {
  totalUsed: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
}

export interface ProjectSession {
  id: string;
  title: string;
  inputType: InputType;
  originalInput: string;
  currentStage: ProjectStage;
  brief: string;
  requirementsGraph: RequirementNode[];
  constraints: Constraint[];
  preferences: Preference[];
  decisions: Decision[];
  approvals: Approval[];
  rejectedDirections: RejectedDirection[];
  references: Reference[];
  researchRuns: ResearchRun[];
  designDNA: DesignDNA[];
  moodboards: MoodboardRef[];
  storyboards: StoryboardRef[];
  brandSystem: BrandSystemRef | null;
  designTokens: DesignTokensRef | null;
  implementationPlan: ImplementationPlanRef | null;
  qaRuns: QARunRef[];
  critiqueRuns: CritiqueRunRef[];
  productionAssets: ProductionAssetRef[];
  promptPacks: PromptPackRef[];
  pluginSnapshots: PluginSnapshotRef[];
  designLineage: LineageEntry[];
  tokenMetrics: TokenMetrics;
  cacheMetrics: CacheMetrics;
  createdAt: string;
  updatedAt: string;
}
