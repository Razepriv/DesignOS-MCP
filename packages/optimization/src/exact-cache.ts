import type Database from 'better-sqlite3';
import { createHash } from 'node:crypto';

export class ExactCache {
  constructor(private db: Database.Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exact_cache (
        cache_key TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        params_hash TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);
  }
  
  /** Generate cache key from operation + normalized params */
  private makeKey(operation: string, params: Record<string, unknown>): string {
    const normalized = JSON.stringify(params, Object.keys(params).sort());
    return createHash('sha256').update(`${operation}:${normalized}`).digest('hex');
  }
  
  get<T>(operation: string, params: Record<string, unknown>): T | null {
    const key = this.makeKey(operation, params);
    const row = this.db.prepare(
      'SELECT result, expires_at FROM exact_cache WHERE cache_key = ?'
    ).get(key) as { result: string; expires_at: string | null } | undefined;
    if (!row) return null;
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      this.db.prepare('DELETE FROM exact_cache WHERE cache_key = ?').run(key);
      return null;
    }
    return JSON.parse(row.result) as T;
  }
  
  set<T>(operation: string, params: Record<string, unknown>, result: T, ttlMs?: number): void {
    const key = this.makeKey(operation, params);
    const expiresAt = ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null;
    this.db.prepare(`
      INSERT OR REPLACE INTO exact_cache (cache_key, operation, params_hash, result, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(key, operation, key, JSON.stringify(result), new Date().toISOString(), expiresAt);
  }
  
  has(operation: string, params: Record<string, unknown>): boolean {
    return this.get(operation, params) !== null;
  }
  
  invalidate(operation: string, params: Record<string, unknown>): void {
    const key = this.makeKey(operation, params);
    this.db.prepare('DELETE FROM exact_cache WHERE cache_key = ?').run(key);
  }
  
  pruneExpired(): number {
    const result = this.db.prepare(
      'DELETE FROM exact_cache WHERE expires_at IS NOT NULL AND expires_at < ?'
    ).run(new Date().toISOString());
    return result.changes;
  }
  
  getStats(): { total: number; expired: number } {
    const totalRow = this.db.prepare('SELECT COUNT(*) as count FROM exact_cache').get() as { count: number };
    const expiredRow = this.db.prepare('SELECT COUNT(*) as count FROM exact_cache WHERE expires_at IS NOT NULL AND expires_at < ?').get(new Date().toISOString()) as { count: number };
    return {
      total: totalRow.count,
      expired: expiredRow.count,
    };
  }
}
