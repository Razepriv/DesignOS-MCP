import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VaultManager } from '../src/index.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('VaultManager', () => {
  let vaultDir: string;
  let manager: VaultManager;

  beforeEach(async () => {
    vaultDir = await mkdtemp(join(tmpdir(), 'vault-'));
    manager = new VaultManager(vaultDir);
    await manager.initialize();
  });

  afterEach(async () => {
    await rm(vaultDir, { recursive: true, force: true });
  });

  it('creates and reads entry', async () => {
    const entry = await manager.createEntry('sources', { id: 'test1', tags: ['a', 'b'] }, 'Hello world');
    expect(entry.id).toBe('test1');
    
    const read = await manager.getEntry('sources', 'test1');
    expect(read?.content).toBe('Hello world');
    expect((read?.frontmatter as any).tags).toEqual(['a', 'b']);
  });
});
