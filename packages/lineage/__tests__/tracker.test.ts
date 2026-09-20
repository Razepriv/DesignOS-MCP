import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { LineageTracker } from '../src/tracker.js';

describe('LineageTracker', () => {
  let db: any;
  let tracker: LineageTracker;

  beforeEach(() => {
    db = new Database(':memory:');
    tracker = new LineageTracker(db);
  });

  it('should track lineage and resolve DAG', () => {
    tracker.addLink('p1', { type: 'spec', id: 's1' }, { type: 'design', id: 'd1' }, 'derives_from');
    tracker.addLink('p1', { type: 'design', id: 'd1' }, { type: 'asset', id: 'a1' }, 'generates');

    const ancestors = tracker.getAncestors('asset', 'a1');
    expect(ancestors.length).toBe(2);
    
    const descendants = tracker.getDescendants('spec', 's1');
    expect(descendants.length).toBe(2);
  });
});
