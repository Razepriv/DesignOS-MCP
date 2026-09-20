export type DesignOSEventType = 
  | 'project.created' | 'project.updated' | 'brief.normalized'
  | 'interview.started' | 'interview.answer_received'
  | 'requirements.updated' | 'research.started' | 'source.selected'
  | 'source.captured' | 'reference.analyzed' | 'research.completed'
  | 'design_dna.created' | 'moodboard.created' | 'moodboard.updated'
  | 'moodboard.approved' | 'storyboard.created' | 'storyboard.updated'
  | 'storyboard.approved' | 'brand.generated' | 'tokens.generated'
  | 'implementation.started' | 'implementation.capture'
  | 'qa.started' | 'qa.finding' | 'qa.failed' | 'qa.passed'
  | 'critique.started' | 'critique.finding' | 'critique.completed'
  | 'production.started' | 'asset.generated' | 'video.rendered'
  | 'production.completed' | 'project.ready_to_ship';

export interface DesignOSEvent {
  id: string;
  type: DesignOSEventType;
  projectId: string;
  timestamp: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
