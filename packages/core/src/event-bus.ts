import crypto from 'node:crypto';
import type { Database } from 'better-sqlite3';

export type DesignOSEventType = 'PROJECT_CREATED' | 'STAGE_TRANSITION' | 'DECISION_ADDED' | 'APPROVAL_ADDED' | 'REFERENCE_ADDED' | 'GENERAL_EVENT';

export interface DesignOSEvent {
  id: string;
  type: DesignOSEventType | string;
  projectId?: string;
  payload: any;
  timestamp: string;
}

export type EventHandler = (event: DesignOSEvent) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  
  constructor(private db?: Database) {
    if (this.db) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          projectId TEXT,
          payload TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);
    }
  }
  
  on(type: DesignOSEventType | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    
    return () => {
      const typeHandlers = this.handlers.get(type);
      if (typeHandlers) {
        typeHandlers.delete(handler);
      }
    };
  }
  
  emit(eventInfo: Omit<DesignOSEvent, 'id' | 'timestamp'>): DesignOSEvent {
    const event: DesignOSEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...eventInfo
    };

    if (this.db) {
      try {
        const stmt = this.db.prepare('INSERT INTO events (id, type, projectId, payload, timestamp) VALUES (?, ?, ?, ?, ?)');
        stmt.run(event.id, event.type, event.projectId || null, JSON.stringify(event.payload), event.timestamp);
      } catch (e) {
        console.error('Failed to persist event to DB', e);
      }
    }

    const specificHandlers = this.handlers.get(event.type) || new Set();
    const catchAllHandlers = this.handlers.get('*') || new Set();
    
    for (const handler of specificHandlers) {
      void Promise.resolve(handler(event)).catch(console.error);
    }
    
    for (const handler of catchAllHandlers) {
      void Promise.resolve(handler(event)).catch(console.error);
    }
    
    return event;
  }
  
  getHistory(projectId: string): DesignOSEvent[] {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare('SELECT * FROM events WHERE projectId = ? ORDER BY timestamp ASC');
      const rows = stmt.all(projectId) as any[];
      return rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload)
      }));
    } catch (e) {
      console.error('Failed to fetch history', e);
      return [];
    }
  }
}
