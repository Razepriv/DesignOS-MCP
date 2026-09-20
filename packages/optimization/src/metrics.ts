import type Database from 'better-sqlite3';
import { TokenMetrics } from './token-governor.js';

export interface AggregatedMetrics {
  totalTokensSaved: number;
  operationsCount: number;
}

export class MetricsCollector {
  constructor(private db?: Database.Database) {
    if (this.db) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS optimization_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT,
          operation TEXT NOT NULL,
          tokens_before INTEGER,
          tokens_after INTEGER,
          tokens_saved INTEGER,
          created_at TEXT NOT NULL
        )
      `);
    }
  }
  
  record(projectId: string, operation: string, metrics: Partial<TokenMetrics>): void {
    if (this.db) {
      this.db.prepare(`
        INSERT INTO optimization_metrics (project_id, operation, tokens_before, tokens_after, tokens_saved, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        projectId,
        operation,
        metrics.tokensBefore || 0,
        metrics.tokensAfter || 0,
        metrics.tokensSaved || 0,
        new Date().toISOString()
      );
    }
  }
  
  getProjectMetrics(projectId: string): AggregatedMetrics {
    if (!this.db) return { totalTokensSaved: 0, operationsCount: 0 };
    
    const row = this.db.prepare(`
      SELECT SUM(tokens_saved) as saved, COUNT(*) as count 
      FROM optimization_metrics WHERE project_id = ?
    `).get(projectId) as { saved: number | null, count: number };
    
    return {
      totalTokensSaved: row.saved || 0,
      operationsCount: row.count,
    };
  }
  
  getGlobalMetrics(): AggregatedMetrics {
    if (!this.db) return { totalTokensSaved: 0, operationsCount: 0 };
    
    const row = this.db.prepare(`
      SELECT SUM(tokens_saved) as saved, COUNT(*) as count 
      FROM optimization_metrics
    `).get() as { saved: number | null, count: number };
    
    return {
      totalTokensSaved: row.saved || 0,
      operationsCount: row.count,
    };
  }
  
  formatReport(metrics: AggregatedMetrics): string {
    return `Optimization Report:\n- Total Tokens Saved: ${metrics.totalTokensSaved}\n- Operations Performed: ${metrics.operationsCount}`;
  }
}
