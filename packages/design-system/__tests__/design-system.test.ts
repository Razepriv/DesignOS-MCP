import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { DesignSystemManager } from '../src/manager.js';

describe('DesignSystemManager', () => {
  let db: Database.Database;
  let manager: DesignSystemManager;

  beforeEach(() => {
    db = new Database(':memory:');
    manager = new DesignSystemManager(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should create and retrieve a design system', async () => {
    const ds = await manager.create({
      name: 'My DS',
      tokens: { colors: { brand: '#ff0000' } }
    });

    expect(ds.id).toBeDefined();
    
    const retrieved = await manager.get(ds.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('My DS');
    expect(retrieved?.tokens.colors.brand).toBe('#ff0000');
  });

  it('should list design systems', async () => {
    await manager.create({ name: 'DS 1', tokens: {} });
    await manager.create({ name: 'DS 2', tokens: {} });
    
    const list = await manager.list();
    expect(list.length).toBe(2);
  });

  it('should export tokens to css', async () => {
    const ds = await manager.create({
      name: 'Export DS',
      tokens: { colors: { primary: '#000', secondary: '#fff' } }
    });
    
    const css = await manager.exportTokens(ds.id, 'css');
    expect(css).toContain('--colors-primary: #000;');
    expect(css).toContain('--colors-secondary: #fff;');
  });
});
