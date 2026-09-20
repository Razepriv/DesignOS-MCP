import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export const StoryboardRepo = {
  create(projectId: string, title: string = 'Storyboard'): string {
    const db = getDatabase();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO storyboards (id, project_id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, projectId, title, now, now);
    return id;
  },

  get(id: string): any {
    const db = getDatabase();
    const board = db.prepare('SELECT * FROM storyboards WHERE id = ?').get(id) as any;
    if (!board) return null;
    
    board.data = JSON.parse(board.data);
    const scenes = db.prepare('SELECT * FROM storyboard_scenes WHERE storyboard_id = ? ORDER BY scene_number ASC').all(id) as any[];
    board.scenes = scenes.map(s => ({
      ...s,
      motion: s.motion ? JSON.parse(s.motion) : null,
      interaction: s.interaction ? JSON.parse(s.interaction) : null,
      responsive: s.responsive ? JSON.parse(s.responsive) : null,
      data: JSON.parse(s.data)
    }));
    return board;
  },

  addScene(storyboardId: string, scene: { scene_number: number; purpose: string; content?: string }): string {
    const db = getDatabase();
    const id = randomUUID();
    
    db.prepare(`
      INSERT INTO storyboard_scenes (id, storyboard_id, scene_number, purpose, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, storyboardId, scene.scene_number, scene.purpose, scene.content ?? null);
    
    return id;
  },

  updateScene(sceneId: string, updates: any): void {
    const db = getDatabase();
    const sets: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      sets.push(`${key} = ?`);
      if (typeof value === 'object' && value !== null) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
    
    if (sets.length === 0) return;
    
    values.push(sceneId);
    db.prepare(`UPDATE storyboard_scenes SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  },

  approve(id: string): void {
    const db = getDatabase();
    db.prepare('UPDATE storyboards SET status = ?, approved_at = ?, updated_at = ? WHERE id = ?')
      .run('approved', new Date().toISOString(), new Date().toISOString(), id);
  }
};
