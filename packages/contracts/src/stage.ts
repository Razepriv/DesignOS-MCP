/**
 * @file stage.ts
 * Defines the various stages a project can be in and transitions between them.
 */

export const PROJECT_STAGES = [
  'new',
  'discovery',
  'research',
  'moodboard_pending',
  'moodboard_approved',
  'storyboard_pending',
  'storyboard_approved',
  'design_spec_ready',
  'implementing',
  'qa',
  'design_approved',
  'production',
  'ready_to_ship'
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const STAGE_TRANSITIONS: Record<ProjectStage, ProjectStage[]> = {
  new: ['discovery'],
  discovery: ['research'],
  research: ['moodboard_pending'],
  moodboard_pending: ['moodboard_approved', 'research'],
  moodboard_approved: ['storyboard_pending'],
  storyboard_pending: ['storyboard_approved', 'moodboard_pending'],
  storyboard_approved: ['design_spec_ready'],
  design_spec_ready: ['implementing'],
  implementing: ['qa'],
  qa: ['design_approved', 'implementing'],
  design_approved: ['production'],
  production: ['ready_to_ship'],
  ready_to_ship: [],
};

export function canTransition(from: ProjectStage, to: ProjectStage): boolean {
  return STAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: ProjectStage, to: ProjectStage): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition from ${from} to ${to}`);
  }
}
