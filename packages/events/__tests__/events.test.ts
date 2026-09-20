import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { EventStore } from '../src/event-store.js';

describe('EventStore', () => {
  let db: Database.Database;
  let store: EventStore;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_events (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL,
        payload JSON NOT NULL DEFAULT '{}',
        metadata JSON,
        timestamp TEXT NOT NULL
      );
    `);
    store = new EventStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should emit and retrieve events by project', () => {
    const event = store.emit({
      projectId: 'proj-1',
      type: 'project.created',
      payload: { stage: 'research' }
    } as any);

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.projectId).toBe('proj-1');

    const events = store.getByProject('proj-1');
    expect(events.length).toBe(1);
    expect(events[0].id).toBe(event.id);
    expect(events[0].payload).toEqual({ stage: 'research' });
  });

  it('should replay events from a specific timestamp', async () => {
    store.emit({ projectId: 'proj-2', type: 'project.created', payload: {} } as any);
    await new Promise(resolve => setTimeout(resolve, 5));
    // Slight delay to ensure different timestamp
    const midEvent = store.emit({ projectId: 'proj-2', type: 'project.updated', payload: {} } as any);
    await new Promise(resolve => setTimeout(resolve, 5));
    store.emit({ projectId: 'proj-2', type: 'research.completed', payload: {} } as any);

    const replayed = store.replay('proj-2', midEvent.timestamp);
    expect(replayed.length).toBe(2);
    expect(replayed[0].type).toBe('project.updated');
    expect(replayed[1].type).toBe('research.completed');
  });
});
