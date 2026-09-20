import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { VisualQAPipeline } from '../src/pipeline.js';

describe('VisualQAPipeline', () => {
  let db: any;
  let pipeline: VisualQAPipeline;

  beforeEach(() => {
    db = new Database(':memory:');
    pipeline = new VisualQAPipeline(db);
  });

  it('should start a run and add findings', async () => {
    const run = await pipeline.startRun('proj-1');
    expect(run.status).toBe('running');
    
    await pipeline.addFinding(run.id, { severity: 'error', category: 'typography', screen: 'home', component: 'h1', issue: 'Wrong font', evidence: 'img', recommendation: 'Fix it' });
    
    const findings = await pipeline.getFindings(run.id);
    expect(findings.length).toBe(1);
    expect(findings[0].issue).toBe('Wrong font');
  });
});
