import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export interface EventInput {
  project_id: string;
  type: string;
  payload: any;
  metadata?: any;
}

export const EventRepo = {
  emit(event: EventInput): string {
    const db = getDatabase();
    const id = randomUUID();
    db.prepare(`
      INSERT INTO project_events (id, project_id, type, payload, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event.project_id,
      event.type,
      JSON.stringify(event.payload),
      event.metadata ? JSON.stringify(event.metadata) : null,
      new Date().toISOString()
    );
    return id;
  },

  getByProject(projectId: string): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM project_events WHERE project_id = ? ORDER BY timestamp ASC').all(projectId) as any[];
    return rows.map(r => ({
      ...r,
      payload: JSON.parse(r.payload),
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }));
  },

  getByType(type: string): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM project_events WHERE type = ? ORDER BY timestamp ASC').all(type) as any[];
    return rows.map(r => ({
      ...r,
      payload: JSON.parse(r.payload),
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }));
  },

  replay(projectId: string, fromTimestamp?: string): any[] {
    const db = getDatabase();
    let query = 'SELECT * FROM project_events WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (fromTimestamp) {
      query += ' AND timestamp >= ?';
      params.push(fromTimestamp);
    }
    
    query += ' ORDER BY timestamp ASC';
    const rows = db.prepare(query).all(...params) as any[];
    
    return rows.map(r => ({
      ...r,
      payload: JSON.parse(r.payload),
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }));
  }
};
