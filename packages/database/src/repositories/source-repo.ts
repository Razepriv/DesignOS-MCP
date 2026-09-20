import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export interface SourceInput {
  name: string;
  url: string;
  category: string;
  tags?: string[];
  access?: string;
  adapter: string;
  capabilities?: any;
}

export const SourceRepo = {
  upsertSource(source: SourceInput & { id?: string }): string {
    const db = getDatabase();
    const id = source.id ?? randomUUID();
    
    db.prepare(`
      INSERT INTO sources (id, name, url, category, tags, access, adapter, capabilities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        url = excluded.url,
        category = excluded.category,
        tags = excluded.tags,
        access = excluded.access,
        adapter = excluded.adapter,
        capabilities = excluded.capabilities
    `).run(
      id,
      source.name,
      source.url,
      source.category,
      JSON.stringify(source.tags ?? []),
      source.access ?? 'public',
      source.adapter,
      JSON.stringify(source.capabilities ?? {})
    );
    return id;
  },

  getSource(id: string): any {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM sources WHERE id = ?').get(id) as any;
    if (row) {
      row.tags = JSON.parse(row.tags);
      row.capabilities = JSON.parse(row.capabilities);
    }
    return row;
  },

  getAllSources(): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM sources').all() as any[];
    return rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags),
      capabilities: JSON.parse(r.capabilities)
    }));
  },

  searchSources(query: string): any[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT * FROM sources 
      WHERE name LIKE ? OR category LIKE ? OR tags LIKE ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as any[];
    
    return rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags),
      capabilities: JSON.parse(r.capabilities)
    }));
  },

  getStats(): any {
    const db = getDatabase();
    const byAdapter = db.prepare('SELECT adapter, COUNT(*) as count FROM sources GROUP BY adapter').all();
    const byAccess = db.prepare('SELECT access, COUNT(*) as count FROM sources GROUP BY access').all();
    const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM sources GROUP BY category').all();
    
    return { byAdapter, byAccess, byCategory };
  }
};
