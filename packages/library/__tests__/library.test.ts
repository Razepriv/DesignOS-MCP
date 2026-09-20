import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AssetLibrary } from '../src/index.js';
import Database from 'better-sqlite3';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('AssetLibrary', () => {
  let storageDir: string;
  let library: AssetLibrary;
  let db: any;

  beforeEach(async () => {
    storageDir = await mkdtemp(join(tmpdir(), 'library-'));
    db = new Database(':memory:');
    library = new AssetLibrary(db, storageDir);
    await library.init();
  });

  afterEach(async () => {
    db.close();
    await rm(storageDir, { recursive: true, force: true });
  });

  it('adds and retrieves an asset', async () => {
    const data = Buffer.from('test asset data');
    const asset = await library.add({ data, mimeType: 'text/plain', kind: 'document' });
    
    expect(asset.id).toContain('asset_');
    expect(asset.mimeType).toBe('text/plain');
    
    const fetched = await library.get(asset.id);
    expect(fetched?.id).toBe(asset.id);
    expect(fetched?.hash).toBe(asset.hash);
  });
});
