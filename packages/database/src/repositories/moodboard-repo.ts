import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export const MoodboardRepo = {
  create(projectId: string, title: string = 'Moodboard'): string {
    const db = getDatabase();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO moodboards (id, project_id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, projectId, title, now, now);
    return id;
  },

  get(id: string): any {
    const db = getDatabase();
    const board = db.prepare('SELECT * FROM moodboards WHERE id = ?').get(id) as any;
    if (!board) return null;
    
    board.data = JSON.parse(board.data);
    const items = db.prepare('SELECT * FROM moodboard_items WHERE moodboard_id = ? ORDER BY sort_order ASC').all(id);
    board.items = items;
    return board;
  },

  addItem(moodboardId: string, item: { category: string; source_url?: string; reason_selected?: string }): string {
    const db = getDatabase();
    const id = randomUUID();
    
    db.prepare(`
      INSERT INTO moodboard_items (id, moodboard_id, category, source_url, reason_selected, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, moodboardId, item.category, item.source_url ?? null, item.reason_selected ?? null, new Date().toISOString());
    
    return id;
  },

  updateItemStatus(itemId: string, status: 'keep' | 'modify' | 'reject'): void {
    const db = getDatabase();
    db.prepare('UPDATE moodboard_items SET status = ? WHERE id = ?').run(status, itemId);
  },

  approve(id: string): void {
    const db = getDatabase();
    db.prepare('UPDATE moodboards SET status = ?, approved_at = ?, updated_at = ? WHERE id = ?')
      .run('approved', new Date().toISOString(), new Date().toISOString(), id);
  }
};
