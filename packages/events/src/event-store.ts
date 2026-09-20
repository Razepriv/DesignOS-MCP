import { randomUUID } from 'crypto';
import type { Database } from 'better-sqlite3';
import { DesignOSEvent } from '@designos/contracts';

export class EventStore {
  constructor(private db: Database) {
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS project_events (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        metadata TEXT,
        timestamp TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_project_events_project_id ON project_events(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_events_type ON project_events(type);
    `);
  }
  
  emit(event: Omit<DesignOSEvent, 'id' | 'timestamp'>): DesignOSEvent {
    const full: DesignOSEvent = { 
      ...event, 
      id: randomUUID(), 
      timestamp: new Date().toISOString() 
    };
    
    this.db.prepare('INSERT INTO project_events (id, project_id, type, payload, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      full.id, 
      full.projectId, 
      full.type, 
      JSON.stringify(full.payload), 
      full.metadata ? JSON.stringify(full.metadata) : null, 
      full.timestamp
    );
    
    return full;
  }
  
  getByProject(projectId: string): DesignOSEvent[] {
    const rows = this.db.prepare('SELECT * FROM project_events WHERE project_id = ? ORDER BY timestamp ASC').all(projectId) as any[];
    return rows.map(this.mapRowToEvent);
  }
  
  getByType(type: string): DesignOSEvent[] {
    const rows = this.db.prepare('SELECT * FROM project_events WHERE type = ? ORDER BY timestamp ASC').all(type) as any[];
    return rows.map(this.mapRowToEvent);
  }
  
  replay(projectId: string, fromTimestamp?: string): DesignOSEvent[] {
    let query = 'SELECT * FROM project_events WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (fromTimestamp) {
      query += ' AND timestamp >= ?';
      params.push(fromTimestamp);
    }
    
    query += ' ORDER BY timestamp ASC';
    
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map(this.mapRowToEvent);
  }

  private mapRowToEvent(row: any): DesignOSEvent {
    return {
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      payload: JSON.parse(row.payload),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      timestamp: row.timestamp,
    };
  }
}
