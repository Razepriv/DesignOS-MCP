import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { StoryboardEngine } from '../src/engine.js';

describe('StoryboardEngine', () => {
  let db: any;
  let engine: StoryboardEngine;

  beforeEach(() => {
    db = new Database(':memory:');
    engine = new StoryboardEngine(db);
  });

  it('creates and retrieves a storyboard', () => {
    const s = engine.create('proj1', 'My Storyboard');
    expect(s.title).toBe('My Storyboard');
    
    const fetched = engine.get(s.id);
    expect(fetched?.id).toBe(s.id);
  });
});
