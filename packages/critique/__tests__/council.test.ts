import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { CritiqueCouncil } from '../src/council.js';

describe('CritiqueCouncil', () => {
  let db: any;
  let council: CritiqueCouncil;

  beforeEach(() => {
    db = new Database(':memory:');
    council = new CritiqueCouncil(db);
  });

  it('should run a critique flow', async () => {
    const run = await council.startCritique('p1');
    expect(run.status).toBe('running');

    await council.runReviewer(run.id, 'visual-director', { designs: ['d1'], requirements: 'Make it pop' });
    const findings = await council.getFindings(run.id);
    expect(findings.length).toBe(1);
    expect(findings[0].reviewer).toBe('visual-director');

    const report = await council.completeCritique(run.id);
    expect(report.run.status).toBe('completed');
  });
});
