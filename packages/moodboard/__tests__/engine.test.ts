import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { MoodboardEngine } from '../src/engine.js';

describe('MoodboardEngine', () => {
  let db: any;
  let engine: MoodboardEngine;

  beforeEach(() => {
    db = new Database(':memory:');
    engine = new MoodboardEngine(db);
  });

  it('creates and retrieves a moodboard', () => {
    const board = engine.create('proj1', 'My Board');
    expect(board.title).toBe('My Board');
    
    const fetched = engine.get(board.id);
    expect(fetched?.id).toBe(board.id);
  });
});
