import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export interface TokenMetricInput {
  project_id: string;
  operation: string;
  tokens_before?: number;
  tokens_after?: number;
  tokens_saved?: number;
  semantic_cache_hits?: number;
  exact_cache_hits?: number;
  browser_calls_avoided?: number;
  model_calls_avoided?: number;
}

export const MetricsRepo = {
  record(metric: TokenMetricInput): string {
    const db = getDatabase();
    const id = randomUUID();
    
    let compressionRatio = null;
    if (metric.tokens_before && metric.tokens_after && metric.tokens_before > 0) {
      compressionRatio = metric.tokens_after / metric.tokens_before;
    }

    db.prepare(`
      INSERT INTO token_metrics (
        id, project_id, operation, tokens_before, tokens_after, tokens_saved,
        compression_ratio, semantic_cache_hits, exact_cache_hits,
        browser_calls_avoided, model_calls_avoided, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      metric.project_id,
      metric.operation,
      metric.tokens_before ?? 0,
      metric.tokens_after ?? 0,
      metric.tokens_saved ?? 0,
      compressionRatio,
      metric.semantic_cache_hits ?? 0,
      metric.exact_cache_hits ?? 0,
      metric.browser_calls_avoided ?? 0,
      metric.model_calls_avoided ?? 0,
      new Date().toISOString()
    );
    return id;
  },

  getByProject(projectId: string): any[] {
    const db = getDatabase();
    return db.prepare('SELECT * FROM token_metrics WHERE project_id = ? ORDER BY recorded_at DESC').all(projectId) as any[];
  },

  getAggregated(projectId: string): any {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        SUM(tokens_saved) as total_tokens_saved,
        SUM(semantic_cache_hits) as total_semantic_hits,
        SUM(exact_cache_hits) as total_exact_hits,
        SUM(model_calls_avoided) as total_model_calls_avoided
      FROM token_metrics 
      WHERE project_id = ?
    `).get(projectId);
  }
};
