export interface StoryboardScene {
  id: string;
  sequence: number;
  description: string;
  actors: string[];
  actions: string[];
  visuals: string;
  notes?: string;
}

export interface Storyboard {
  id: string;
  scenes: StoryboardScene[];
}
