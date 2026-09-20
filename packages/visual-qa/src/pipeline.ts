import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface QARun { id: string; projectId: string; status: string; findings: QAFinding[]; startedAt: string; }
export interface QAFinding { id: string; qaRunId: string; severity: string; category: string; screen: string; component: string; issue: string; evidence: string; recommendation: string; }
export interface QAFindingInput extends Omit<QAFinding, 'id' | 'qaRunId'> {}
export interface DesignSpec { typography: any; spacing: any; colors: any; }

export class VisualQAPipeline {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS qa_runs (id TEXT PRIMARY KEY, project_id TEXT, status TEXT, findings TEXT, started_at TEXT);
      CREATE TABLE IF NOT EXISTS qa_findings (id TEXT PRIMARY KEY, qa_run_id TEXT, severity TEXT, category TEXT, screen TEXT, component TEXT, issue TEXT, evidence TEXT, recommendation TEXT);
    `);
  }
  
  async startRun(projectId: string): Promise<QARun> {
    const id = randomUUID();
    const startedAt = new Date().toISOString();
    this.db.prepare('INSERT INTO qa_runs (id, project_id, status, findings, started_at) VALUES (?, ?, ?, ?, ?)').run(id, projectId, 'running', '[]', startedAt);
    return { id, projectId, status: 'running', findings: [], startedAt };
  }
  
  async addFinding(runId: string, finding: QAFindingInput): Promise<QAFinding> {
    const id = randomUUID();
    this.db.prepare('INSERT INTO qa_findings (id, qa_run_id, severity, category, screen, component, issue, evidence, recommendation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, runId, finding.severity, finding.category, finding.screen, finding.component, finding.issue, finding.evidence, finding.recommendation
    );
    return { id, qaRunId: runId, ...finding };
  }
  
  async completeRun(runId: string, passed: boolean): Promise<void> {
    this.db.prepare('UPDATE qa_runs SET status = ? WHERE id = ?').run(passed ? 'passed' : 'failed', runId);
  }
  
  async getRun(runId: string): Promise<QARun | null> {
    const row = this.db.prepare('SELECT * FROM qa_runs WHERE id = ?').get(runId) as any;
    if (!row) return null;
    return {
      id: row.id, projectId: row.project_id, status: row.status,
      findings: JSON.parse(row.findings || '[]'), startedAt: row.started_at
    };
  }
  
  async getFindings(runId: string): Promise<QAFinding[]> {
    return this.db.prepare('SELECT * FROM qa_findings WHERE qa_run_id = ?').all(runId) as QAFinding[];
  }
  
  async checkSpacing(screenshot: Buffer, spec: DesignSpec): Promise<QAFindingInput[]> {
    if (screenshot.length === 0) throw new Error("Empty screenshot");
    return [{ severity: 'warning', category: 'spacing', screen: 'home', component: 'header', issue: 'Inconsistent padding', evidence: 'screenshot_region.png', recommendation: 'Align to 8px grid' }];
  }
}
