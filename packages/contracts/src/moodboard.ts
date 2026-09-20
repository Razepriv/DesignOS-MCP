export interface MoodboardItem {
  id: string;
  sourceUrl: string;
  description: string;
  status: 'keep' | 'modify' | 'reject';
}

export interface Moodboard {
  id: string;
  items: MoodboardItem[];
  approvals: string[];
}
