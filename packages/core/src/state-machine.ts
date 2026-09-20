export type ProjectStage = 
  | 'INITIALIZATION' 
  | 'DISCOVERY' 
  | 'ANALYSIS' 
  | 'DESIGN' 
  | 'IMPLEMENTATION' 
  | 'REVIEW' 
  | 'COMPLETION';

export const PROJECT_STAGES: ProjectStage[] = [
  'INITIALIZATION',
  'DISCOVERY',
  'ANALYSIS',
  'DESIGN',
  'IMPLEMENTATION',
  'REVIEW',
  'COMPLETION'
];

export const STAGE_TRANSITIONS: Record<ProjectStage, ProjectStage[]> = {
  'INITIALIZATION': ['DISCOVERY'],
  'DISCOVERY': ['ANALYSIS'],
  'ANALYSIS': ['DESIGN', 'DISCOVERY'],
  'DESIGN': ['IMPLEMENTATION', 'ANALYSIS'],
  'IMPLEMENTATION': ['REVIEW', 'DESIGN'],
  'REVIEW': ['COMPLETION', 'IMPLEMENTATION'],
  'COMPLETION': []
};

export function canTransition(from: ProjectStage, to: ProjectStage): boolean {
  return STAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: ProjectStage, to: ProjectStage): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid stage transition from ${from} to ${to}`);
  }
}

export function getNextStages(current: ProjectStage): ProjectStage[] {
  return STAGE_TRANSITIONS[current] || [];
}

export function getProgress(current: ProjectStage): number {
  const index = PROJECT_STAGES.indexOf(current);
  if (index === -1) return 0;
  return Math.round((index / (PROJECT_STAGES.length - 1)) * 100);
}
