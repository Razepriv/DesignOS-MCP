import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';

export const CRITIQUE_REVIEWERS = [
  'visual-director', 'product-designer', 'brand-guardian', 'ux-reviewer',
  'accessibility-reviewer', 'motion-reviewer', 'copy-reviewer',
  'performance-reviewer', 'production-reviewer', 'store-creative-reviewer'
] as const;

export type CritiqueReviewer = typeof CRITIQUE_REVIEWERS[number];

export interface CritiqueRun { id: string; projectId: string; status: 'pending' | 'running' | 'completed'; startedAt: string; }
export interface CritiqueFindingInput { reviewer: CritiqueReviewer; comment: string; severity: 'low' | 'medium' | 'high'; }
export interface CritiqueFinding extends CritiqueFindingInput { id: string; runId: string; timestamp: string; }
export interface ReviewContext { designs: string[]; requirements: string; }
export interface CritiqueReport { run: CritiqueRun; findings: CritiqueFinding[]; }

export class CritiqueCouncil {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS critique_runs (id TEXT PRIMARY KEY, project_id TEXT, status TEXT, started_at TEXT);
      CREATE TABLE IF NOT EXISTS critique_findings (id TEXT PRIMARY KEY, run_id TEXT, reviewer TEXT, comment TEXT, severity TEXT, timestamp TEXT);
    `);
  }
  
  async startCritique(projectId: string): Promise<CritiqueRun> {
    const id = randomUUID();
    const startedAt = new Date().toISOString();
    this.db.prepare('INSERT INTO critique_runs (id, project_id, status, started_at) VALUES (?, ?, ?, ?)').run(id, projectId, 'running', startedAt);
    return { id, projectId, status: 'running', startedAt };
  }
  
  async addFinding(runId: string, finding: CritiqueFindingInput): Promise<CritiqueFinding> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    this.db.prepare('INSERT INTO critique_findings (id, run_id, reviewer, comment, severity, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, runId, finding.reviewer, finding.comment, finding.severity, timestamp
    );
    return { id, runId, ...finding, timestamp };
  }
  
  async runReviewer(runId: string, reviewer: CritiqueReviewer, context: ReviewContext): Promise<CritiqueFinding[]> {
    // Real implementation would invoke LLM / rules here
    const finding = await this.addFinding(runId, {
      reviewer,
      comment: `${reviewer} analysis complete for ${context.designs.length} designs`,
      severity: 'medium'
    });
    return [finding];
  }
  
  async completeCritique(runId: string): Promise<CritiqueReport> {
    this.db.prepare('UPDATE critique_runs SET status = ? WHERE id = ?').run('completed', runId);
    const run = await this.getCritique(runId);
    const findings = await this.getFindings(runId);
    return { run: run!, findings };
  }
  
  async getCritique(runId: string): Promise<CritiqueRun | null> {
    const row = this.db.prepare('SELECT * FROM critique_runs WHERE id = ?').get(runId) as any;
    if (!row) return null;
    return { id: row.id, projectId: row.project_id, status: row.status, startedAt: row.started_at };
  }
  
  async getFindings(runId: string, reviewer?: string): Promise<CritiqueFinding[]> {
    if (reviewer) {
      return this.db.prepare('SELECT * FROM critique_findings WHERE run_id = ? AND reviewer = ?').all(runId, reviewer) as CritiqueFinding[];
    }
    return this.db.prepare('SELECT * FROM critique_findings WHERE run_id = ?').all(runId) as CritiqueFinding[];
  }
}
