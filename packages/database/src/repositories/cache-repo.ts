import { getDatabase } from '../connection.js';

export const CacheRepo = {
  getExact(key: string): any | null {
    const db = getDatabase();
    const row = db.prepare('SELECT result, expires_at FROM exact_cache WHERE cache_key = ?').get(key) as any;
    if (!row) return null;
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      db.prepare('DELETE FROM exact_cache WHERE cache_key = ?').run(key);
      return null;
    }
    return JSON.parse(row.result);
  },

  setExact(key: string, operation: string, paramsHash: string, result: any, ttlDays?: number): void {
    const db = getDatabase();
    const now = new Date();
    const expiresAt = ttlDays ? new Date(now.getTime() + ttlDays * 86400000).toISOString() : null;
    
    db.prepare(`
      INSERT OR REPLACE INTO exact_cache (cache_key, operation, params_hash, result, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(key, operation, paramsHash, JSON.stringify(result), now.toISOString(), expiresAt);
  },

  getSemantic(intent: string, threshold: number = 0.9): any | null {
    const db = getDatabase();
    // Simplified logic since full vector search needs a vector extension
    // We just exact match the intent and threshold here for scaffolding
    const row = db.prepare('SELECT result, expires_at FROM semantic_cache WHERE intent = ? AND confidence >= ? ORDER BY confidence DESC LIMIT 1').get(intent, threshold) as any;
    if (!row) return null;
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return null; // Will be pruned later
    }
    return JSON.parse(row.result);
  },

  setSemantic(id: string, intent: string, vector: number[], result: any, ttlDays?: number): void {
    const db = getDatabase();
    const now = new Date();
    const expiresAt = ttlDays ? new Date(now.getTime() + ttlDays * 86400000).toISOString() : null;
    
    db.prepare(`
      INSERT OR REPLACE INTO semantic_cache (id, intent, vector, result, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, intent, JSON.stringify(vector), JSON.stringify(result), now.toISOString(), expiresAt);
  },

  pruneExpired(): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare('DELETE FROM exact_cache WHERE expires_at IS NOT NULL AND expires_at < ?').run(now);
    db.prepare('DELETE FROM semantic_cache WHERE expires_at IS NOT NULL AND expires_at < ?').run(now);
  }
};
