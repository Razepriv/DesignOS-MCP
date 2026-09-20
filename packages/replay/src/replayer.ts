import type { Database } from 'better-sqlite3';

export interface ProjectEvent { id: string; projectId: string; type: string; payload: string; timestamp: string; }
export interface ReplayResult { state: any; eventCount: number; lastTimestamp: string; }
export interface ProjectSnapshot { projectId: string; state: any; timestamp: string; }

export class ProjectReplayer {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS project_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, payload TEXT, timestamp TEXT);
    `);
  }
  
  addEvent(event: Omit<ProjectEvent, 'id'>): string {
    const id = Math.random().toString(36).substring(7);
    this.db.prepare('INSERT INTO project_events (id, project_id, type, payload, timestamp) VALUES (?, ?, ?, ?, ?)').run(
      id, event.projectId, event.type, event.payload, event.timestamp
    );
    return id;
  }
  
  async replay(projectId: string, toTimestamp?: string): Promise<ReplayResult> {
    let query = 'SELECT * FROM project_events WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (toTimestamp) {
      query += ' AND timestamp <= ?';
      params.push(toTimestamp);
    }
    query += ' ORDER BY timestamp ASC';
    
    const events = this.db.prepare(query).all(...params) as any[];
    
    const state: any = {};
    for (const event of events) {
      const payload = JSON.parse(event.payload);
      if (event.type === 'SET') Object.assign(state, payload);
      if (event.type === 'DELETE') delete state[payload.key];
    }
    
    return {
      state,
      eventCount: events.length,
      lastTimestamp: events.length > 0 ? events[events.length - 1].timestamp : ''
    };
  }
  
  async getSnapshot(projectId: string): Promise<ProjectSnapshot> {
    const result = await this.replay(projectId);
    return { projectId, state: result.state, timestamp: result.lastTimestamp || new Date().toISOString() };
  }
}
