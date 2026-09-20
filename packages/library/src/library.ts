import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

export interface AssetInput {
  data: Buffer;
  mimeType: string;
  projectId?: string;
  kind: string;
}

export interface DesignAsset {
  id: string;
  hash: string;
  path: string;
  mimeType: string;
  projectId: string | null;
  kind: string;
}

export class AssetLibrary {
  constructor(private db: any, private storageDir: string) {}
  
  async init(): Promise<void> {
    await mkdir(this.storageDir, { recursive: true });
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS library_assets (
        id TEXT PRIMARY KEY,
        hash TEXT NOT NULL,
        path TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        projectId TEXT,
        kind TEXT NOT NULL
      )
    `);
  }

  async add(input: AssetInput): Promise<DesignAsset> {
    const hash = createHash('sha256').update(input.data).digest('hex');
    const existing = this.db.prepare('SELECT * FROM library_assets WHERE hash = ?').get(hash);
    if (existing) return existing as DesignAsset;

    const id = `asset_${createHash('md5').update(hash + Date.now().toString()).digest('hex').slice(0, 8)}`;
    const path = await this.storeContent(hash, input.data, input.mimeType);
    
    const asset: DesignAsset = {
      id,
      hash,
      path,
      mimeType: input.mimeType,
      projectId: input.projectId || null,
      kind: input.kind
    };

    this.db.prepare(
      'INSERT INTO library_assets (id, hash, path, mimeType, projectId, kind) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(asset.id, asset.hash, asset.path, asset.mimeType, asset.projectId, asset.kind);

    return asset;
  }
  
  async get(id: string): Promise<DesignAsset | null> {
    return this.db.prepare('SELECT * FROM library_assets WHERE id = ?').get(id) || null;
  }
  
  async search(query: string): Promise<DesignAsset[]> {
    return this.db.prepare('SELECT * FROM library_assets WHERE kind LIKE ? OR mimeType LIKE ?').all(`%${query}%`, `%${query}%`);
  }
  
  async getByProject(projectId: string): Promise<DesignAsset[]> {
    return this.db.prepare('SELECT * FROM library_assets WHERE projectId = ?').all(projectId);
  }
  
  async getByKind(kind: string): Promise<DesignAsset[]> {
    return this.db.prepare('SELECT * FROM library_assets WHERE kind = ?').all(kind);
  }
  
  async delete(id: string): Promise<void> {
    const asset = await this.get(id);
    if (asset) {
      this.db.prepare('DELETE FROM library_assets WHERE id = ?').run(id);
      const shared = this.db.prepare('SELECT COUNT(*) as c FROM library_assets WHERE hash = ?').get(asset.hash);
      if (shared.c === 0) {
        await rm(asset.path, { force: true });
      }
    }
  }
  
  private async storeContent(hash: string, data: Buffer, mimeType: string): Promise<string> {
    const dir = join(this.storageDir, hash.slice(0, 2), hash.slice(2, 4));
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, hash);
    await writeFile(filePath, data);
    return filePath;
  }
}
