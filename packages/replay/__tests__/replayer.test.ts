import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { ProjectReplayer } from '../src/replayer.js';

describe('ProjectReplayer', () => {
  let db: any;
  let replayer: ProjectReplayer;

  beforeEach(() => {
    db = new Database(':memory:');
    replayer = new ProjectReplayer(db);
  });

  it('should replay events and build state', async () => {
    replayer.addEvent({ projectId: 'p1', type: 'SET', payload: JSON.stringify({ name: 'DesignOS' }), timestamp: '2024-01-01T00:00:00Z' });
    replayer.addEvent({ projectId: 'p1', type: 'SET', payload: JSON.stringify({ version: '1.0' }), timestamp: '2024-01-02T00:00:00Z' });
    
    const res = await replayer.replay('p1');
    expect(res.eventCount).toBe(2);
    expect(res.state.name).toBe('DesignOS');
    expect(res.state.version).toBe('1.0');
  });
});
