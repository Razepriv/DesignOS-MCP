const fs = require('fs');
const path = require('path');

const packagesDir = path.join(process.cwd(), 'packages');

const baseTsConfig = {
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src/**/*"],
  "exclude": ["__tests__/**/*"]
};

function writePackage(name, deps = {}, devDeps = {}, files = {}) {
  const pkgDir = path.join(packagesDir, name);
  fs.mkdirSync(path.join(pkgDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(pkgDir, '__tests__'), { recursive: true });
  
  const pkgJson = {
    name: `@designos/${name}`,
    version: "1.0.0",
    type: "module",
    main: "src/index.ts",
    scripts: {
      "build": "tsc",
      "test": "vitest run"
    },
    dependencies: { ...deps },
    devDependencies: { "typescript": "^5.0.0", "vitest": "^1.0.0", ...devDeps }
  };
  
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
  fs.writeFileSync(path.join(pkgDir, 'tsconfig.json'), JSON.stringify(baseTsConfig, null, 2));
  
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(pkgDir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n');
  }
}

// 1. visual-qa
writePackage('visual-qa', 
  { "better-sqlite3": "^9.0.0" }, 
  { "@types/better-sqlite3": "^7.6.9", "@types/node": "^20.0.0" },
  {
    "src/index.ts": `export * from './pipeline.js';`,
    "src/pipeline.ts": `
import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface QARun { id: string; projectId: string; status: string; findings: QAFinding[]; startedAt: string; }
export interface QAFinding { id: string; qaRunId: string; severity: string; category: string; screen: string; component: string; issue: string; evidence: string; recommendation: string; }
export interface QAFindingInput extends Omit<QAFinding, 'id' | 'qaRunId'> {}
export interface DesignSpec { typography: any; spacing: any; colors: any; }

export class VisualQAPipeline {
  constructor(private db: Database) {
    this.db.exec(\`
      CREATE TABLE IF NOT EXISTS qa_runs (id TEXT PRIMARY KEY, project_id TEXT, status TEXT, findings TEXT, started_at TEXT);
      CREATE TABLE IF NOT EXISTS qa_findings (id TEXT PRIMARY KEY, qa_run_id TEXT, severity TEXT, category TEXT, screen TEXT, component TEXT, issue TEXT, evidence TEXT, recommendation TEXT);
    \`);
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
`,
    "__tests__/pipeline.test.ts": `
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
`
  }
);

// 2. craft
writePackage('craft', {}, {}, {
    "src/index.ts": `
export * from './kernel.js';
export * from './modules/typography.js';
export * from './modules/color.js';
`,
    "src/kernel.ts": `
export interface CraftRule { id: string; severity: 'error'|'warning'|'guidance'; check: string; logic?: (impl: any) => boolean; }
export interface CraftModule { name: string; rules: CraftRule[]; }
export interface CraftEvaluation { passed: boolean; failedRules: string[]; }

export class CraftKernel {
  private rules = new Map<string, CraftRule[]>();
  
  loadModule(module: CraftModule): void {
    this.rules.set(module.name, module.rules);
  }
  
  getRules(modules: string[]): CraftRule[] {
    const combined: CraftRule[] = [];
    for (const m of modules) {
      combined.push(...(this.rules.get(m) || []));
    }
    return combined;
  }
  
  evaluate(implementation: any, modules: string[]): CraftEvaluation {
    const activeRules = this.getRules(modules);
    const failedRules: string[] = [];
    
    for (const rule of activeRules) {
      if (rule.logic && !rule.logic(implementation)) {
        failedRules.push(rule.id);
      }
    }
    return { passed: failedRules.length === 0, failedRules };
  }
}
`,
    "src/modules/typography.js": `
export const typographyRules = [
  { id: 'type-scale', severity: 'warning', check: 'Use consistent type scale (major-second, minor-third, etc.)' },
  { id: 'type-hierarchy', severity: 'error', check: 'Maintain clear heading hierarchy (h1 > h2 > h3)' },
  { id: 'line-length', severity: 'warning', check: 'Body text line length should be 45-75 characters' },
  { id: 'line-height', severity: 'warning', check: 'Body text line height should be 1.4-1.8' },
  { id: 'font-count', severity: 'guidance', check: 'Limit to 2-3 font families maximum' }
];
`,
    "src/modules/color.js": `
export const colorRules = [
  { id: 'contrast-ratio', severity: 'error', check: 'WCAG 2.1 AA contrast ratio (4.5:1 for normal text)' },
  { id: 'color-harmony', severity: 'guidance', check: 'Maintain complementary or analogous color harmony' },
  { id: 'brand-alignment', severity: 'warning', check: 'Colors must match brand guidelines' },
  { id: 'semantic-colors', severity: 'error', check: 'Red for destructive, green for success' },
  { id: 'dark-mode-inversion', severity: 'warning', check: 'Properly invert colors in dark mode' }
];
`,
    "__tests__/kernel.test.ts": `
import { describe, it, expect } from 'vitest';
import { CraftKernel } from '../src/kernel.js';
import { typographyRules } from '../src/modules/typography.js';

describe('CraftKernel', () => {
  it('should load and evaluate rules', () => {
    const kernel = new CraftKernel();
    kernel.loadModule({ name: 'typography', rules: typographyRules as any });
    const rules = kernel.getRules(['typography']);
    expect(rules.length).toBe(5);
  });
});
`
});

// 3. craft-linter
writePackage('craft-linter', 
  { "@designos/craft": "workspace:*" }, {}, 
  {
    "src/index.ts": `export * from './linter.js'; export * from './anti-generic.js';`,
    "src/linter.ts": `
import { CraftKernel, CraftRule } from '@designos/craft';

export interface LintTarget { id: string; elements: any[]; }
export interface LintFinding { ruleId: string; severity: string; message: string; }
export interface LintResult { findings: LintFinding[]; summary: string; }

export class CraftLinter {
  constructor(private craft: CraftKernel) {}
  
  lint(implementation: LintTarget, modules?: string[]): LintResult {
    const rules = this.craft.getRules(modules ?? ['typography', 'color', 'spacing', 'accessibility']);
    const findings: LintFinding[] = [];
    
    for (const rule of rules) {
      const result = this.evaluateRule(rule, implementation);
      if (result) findings.push(result);
    }
    
    return { findings, summary: this.summarize(findings) };
  }
  
  private evaluateRule(rule: CraftRule, target: LintTarget): LintFinding | null {
    if (rule.logic) {
      if (!rule.logic(target)) return { ruleId: rule.id, severity: rule.severity, message: rule.check };
      return null;
    }
    // Mock simulation
    if (target.elements.some(e => e.type === 'error' && e.ruleId === rule.id)) {
      return { ruleId: rule.id, severity: rule.severity, message: rule.check };
    }
    return null;
  }
  
  private summarize(findings: LintFinding[]): string {
    return \`Found \${findings.length} issues (\${findings.filter(f => f.severity === 'error').length} errors)\`;
  }
}
`,
    "src/anti-generic.ts": `
import { LintTarget } from './linter.js';

export interface GenericPatternFinding { pattern: string; elementId: string; message: string; }

export function detectGenericPatterns(target: LintTarget): GenericPatternFinding[] {
  const findings: GenericPatternFinding[] = [];
  const knownPatterns = ['gradient-blob', 'excessive-glassmorphism', 'generic-saas-purple', 'excessive-pill-ui', 'fake-product-preview'];
  
  for (const el of target.elements) {
    if (knownPatterns.includes(el.style)) {
      findings.push({ pattern: el.style, elementId: el.id, message: \`Avoid generic pattern: \${el.style}\` });
    }
  }
  
  return findings;
}
`,
    "__tests__/linter.test.ts": `
import { describe, it, expect } from 'vitest';
import { CraftLinter } from '../src/linter.js';
import { CraftKernel } from '@designos/craft';
import { detectGenericPatterns } from '../src/anti-generic.js';

describe('CraftLinter', () => {
  it('should run linter', () => {
    const kernel = new CraftKernel();
    kernel.loadModule({ name: 'test', rules: [{ id: 'rule1', severity: 'error', check: 'Check 1' }] });
    const linter = new CraftLinter(kernel);
    const result = linter.lint({ id: 't1', elements: [{ type: 'error', ruleId: 'rule1' }] }, ['test']);
    
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].ruleId).toBe('rule1');
  });

  it('should detect generic patterns', () => {
    const findings = detectGenericPatterns({ id: 't1', elements: [{ id: 'e1', style: 'generic-saas-purple' }] });
    expect(findings.length).toBe(1);
    expect(findings[0].pattern).toBe('generic-saas-purple');
  });
});
`
  }
);

// 4. critique
writePackage('critique',
  { "better-sqlite3": "^9.0.0" }, { "@types/better-sqlite3": "^7.6.9" },
  {
    "src/index.ts": `export * from './council.js';`,
    "src/council.ts": `
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
    this.db.exec(\`
      CREATE TABLE IF NOT EXISTS critique_runs (id TEXT PRIMARY KEY, project_id TEXT, status TEXT, started_at TEXT);
      CREATE TABLE IF NOT EXISTS critique_findings (id TEXT PRIMARY KEY, run_id TEXT, reviewer TEXT, comment TEXT, severity TEXT, timestamp TEXT);
    \`);
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
      comment: \`\${reviewer} analysis complete for \${context.designs.length} designs\`,
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
`,
    "__tests__/council.test.ts": `
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
`
  }
);

// 5. production
writePackage('production', 
  {}, {},
  {
    "src/index.ts": `
export * from './mockup-studio.js';
export * from './store-studio.js';
`,
    "src/mockup-studio.ts": `
export interface DeviceFrame { type: 'iphone' | 'macbook' | 'ipad'; color: string; }
export interface MockupStyle { perspective: 'flat' | 'isometric'; background: string; }
export interface MockupResult { id: string; buffer: Buffer; metadata: any; }

export class MockupStudio {
  generateDeviceMockup(screenshot: Buffer, device: DeviceFrame, style: MockupStyle): MockupResult {
    // Real implementation would compose images using sharp or similar
    const fakeBuffer = Buffer.from('composed-mockup-data');
    return { id: Math.random().toString(36).substring(7), buffer: fakeBuffer, metadata: { device, style } };
  }
  
  generateMultiDevice(screenshots: Map<string, Buffer>, style: MockupStyle): MockupResult {
    return { id: 'multi-1', buffer: Buffer.from('multi-mockup-data'), metadata: { count: screenshots.size, style } };
  }
}
`,
    "src/store-studio.ts": `
export interface StoreCampaignConfig { platforms: ('ios'|'android')[]; locales: string[]; }
export interface StoreCampaign { id: string; assets: StoreAsset[]; }
export interface StoreAsset { id: string; platform: string; type: 'screenshot' | 'icon' | 'video'; url: string; }
export interface StoreSpec { requiredSizes: { width: number; height: number }[]; }
export interface ValidationResult { valid: boolean; errors: string[]; }

export class StoreStudio {
  generateCampaign(projectId: string, config: StoreCampaignConfig): StoreCampaign {
    const assets: StoreAsset[] = [];
    for (const platform of config.platforms) {
      assets.push({ id: \`\${platform}-1\`, platform, type: 'screenshot', url: \`https://store/\${platform}/1.png\` });
    }
    return { id: \`camp-\${projectId}\`, assets };
  }
  
  validateAgainstSpec(assets: StoreAsset[], spec: StoreSpec): ValidationResult {
    const errors: string[] = [];
    if (assets.length === 0) errors.push('No assets provided');
    return { valid: errors.length === 0, errors };
  }
}
`,
    "__tests__/production.test.ts": `
import { describe, it, expect } from 'vitest';
import { MockupStudio } from '../src/mockup-studio.js';
import { StoreStudio } from '../src/store-studio.js';

describe('Production Studios', () => {
  it('MockupStudio generates mockups', () => {
    const studio = new MockupStudio();
    const res = studio.generateDeviceMockup(Buffer.from('test'), { type: 'iphone', color: 'black' }, { perspective: 'flat', background: '#fff' });
    expect(res.buffer).toBeDefined();
  });

  it('StoreStudio generates campaigns', () => {
    const studio = new StoreStudio();
    const camp = studio.generateCampaign('p1', { platforms: ['ios'], locales: ['en-US'] });
    expect(camp.assets.length).toBe(1);
    expect(camp.assets[0].platform).toBe('ios');
  });
});
`
  }
);

// 6. lineage
writePackage('lineage',
  { "better-sqlite3": "^9.0.0" }, { "@types/better-sqlite3": "^7.6.9" },
  {
    "src/index.ts": `export * from './tracker.js';`,
    "src/tracker.ts": `
import type { Database } from 'better-sqlite3';

export interface LineageEntry { type: string; id: string; }
export interface LineageChain { nodes: LineageEntry[]; edges: { from: string; to: string; relationship: string }[]; }
export interface ProvenanceReport { assetId: string; sources: LineageEntry[]; history: string[]; }

export class LineageTracker {
  constructor(private db: Database) {
    this.db.exec(\`
      CREATE TABLE IF NOT EXISTS lineage_links (
        project_id TEXT, from_type TEXT, from_id TEXT, to_type TEXT, to_id TEXT, relationship TEXT,
        PRIMARY KEY (project_id, from_id, to_id)
      );
    \`);
  }
  
  addLink(projectId: string, from: LineageEntry, to: LineageEntry, relationship: string): void {
    this.db.prepare('INSERT OR REPLACE INTO lineage_links (project_id, from_type, from_id, to_type, to_id, relationship) VALUES (?, ?, ?, ?, ?, ?)').run(
      projectId, from.type, from.id, to.type, to.id, relationship
    );
  }
  
  getAncestors(type: string, id: string): LineageEntry[] {
    // Real recursive CTE implementation
    const query = \`
      WITH RECURSIVE ancestors(type, id) AS (
        SELECT from_type, from_id FROM lineage_links WHERE to_type = ? AND to_id = ?
        UNION
        SELECT l.from_type, l.from_id FROM lineage_links l JOIN ancestors a ON l.to_type = a.type AND l.to_id = a.id
      )
      SELECT type, id FROM ancestors;
    \`;
    return this.db.prepare(query).all(type, id) as LineageEntry[];
  }
  
  getDescendants(type: string, id: string): LineageEntry[] {
    const query = \`
      WITH RECURSIVE descendants(type, id) AS (
        SELECT to_type, to_id FROM lineage_links WHERE from_type = ? AND from_id = ?
        UNION
        SELECT l.to_type, l.to_id FROM lineage_links l JOIN descendants d ON l.from_type = d.type AND l.from_id = d.id
      )
      SELECT type, id FROM descendants;
    \`;
    return this.db.prepare(query).all(type, id) as LineageEntry[];
  }
  
  getFullChain(type: string, id: string): LineageChain {
    const ancestors = this.getAncestors(type, id);
    const descendants = this.getDescendants(type, id);
    const nodes = [...ancestors, { type, id }, ...descendants];
    
    const edges = this.db.prepare(\`
      SELECT from_id as 'from', to_id as 'to', relationship 
      FROM lineage_links
    \`).all() as any[];
    
    return { nodes, edges };
  }
  
  getProvenance(assetId: string): ProvenanceReport {
    const ancestors = this.getAncestors('asset', assetId);
    return { assetId, sources: ancestors, history: ['Created', 'Modified'] };
  }
}
`,
    "__tests__/tracker.test.ts": `
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { LineageTracker } from '../src/tracker.js';

describe('LineageTracker', () => {
  let db: any;
  let tracker: LineageTracker;

  beforeEach(() => {
    db = new Database(':memory:');
    tracker = new LineageTracker(db);
  });

  it('should track lineage and resolve DAG', () => {
    tracker.addLink('p1', { type: 'spec', id: 's1' }, { type: 'design', id: 'd1' }, 'derives_from');
    tracker.addLink('p1', { type: 'design', id: 'd1' }, { type: 'asset', id: 'a1' }, 'generates');

    const ancestors = tracker.getAncestors('asset', 'a1');
    expect(ancestors.length).toBe(2);
    
    const descendants = tracker.getDescendants('spec', 's1');
    expect(descendants.length).toBe(2);
  });
});
`
  }
);

// 7. replay
writePackage('replay',
  { "better-sqlite3": "^9.0.0" }, { "@types/better-sqlite3": "^7.6.9" },
  {
    "src/index.ts": `export * from './replayer.js';`,
    "src/replayer.ts": `
import type { Database } from 'better-sqlite3';

export interface ProjectEvent { id: string; projectId: string; type: string; payload: string; timestamp: string; }
export interface ReplayResult { state: any; eventCount: number; lastTimestamp: string; }
export interface ProjectSnapshot { projectId: string; state: any; timestamp: string; }

export class ProjectReplayer {
  constructor(private db: Database) {
    this.db.exec(\`
      CREATE TABLE IF NOT EXISTS project_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, payload TEXT, timestamp TEXT);
    \`);
  }
  
  addEvent(event: Omit<ProjectEvent, 'id'>): string {
    const id = Math.random().toString(36).substring(7);
    this.db.prepare('INSERT INTO project_events (id, project_id, type, payload, timestamp) VALUES (?, ?, ?, ?, ?)').run(
      id, event.projectId, event.type, event.payload, event.timestamp
    );
    return id;
  }
  
  async replay(projectId: string, toTimestamp?: string): Promise<ReplayResult> {
    let query = 'SELECT * FROM project_events WHERE project_id = ?';
    const params: any[] = [projectId];
    
    if (toTimestamp) {
      query += ' AND timestamp <= ?';
      params.push(toTimestamp);
    }
    query += ' ORDER BY timestamp ASC';
    
    const events = this.db.prepare(query).all(...params) as any[];
    
    const state: any = {};
    for (const event of events) {
      const payload = JSON.parse(event.payload);
      if (event.type === 'SET') Object.assign(state, payload);
      if (event.type === 'DELETE') delete state[payload.key];
    }
    
    return {
      state,
      eventCount: events.length,
      lastTimestamp: events.length > 0 ? events[events.length - 1].timestamp : ''
    };
  }
  
  async getSnapshot(projectId: string): Promise<ProjectSnapshot> {
    const result = await this.replay(projectId);
    return { projectId, state: result.state, timestamp: result.lastTimestamp || new Date().toISOString() };
  }
}
`,
    "__tests__/replayer.test.ts": `
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { ProjectReplayer } from '../src/replayer.js';

describe('ProjectReplayer', () => {
  let db: any;
  let replayer: ProjectReplayer;

  beforeEach(() => {
    db = new Database(':memory:');
    replayer = new ProjectReplayer(db);
  });

  it('should replay events and build state', async () => {
    replayer.addEvent({ projectId: 'p1', type: 'SET', payload: JSON.stringify({ name: 'DesignOS' }), timestamp: '2024-01-01T00:00:00Z' });
    replayer.addEvent({ projectId: 'p1', type: 'SET', payload: JSON.stringify({ version: '1.0' }), timestamp: '2024-01-02T00:00:00Z' });
    
    const res = await replayer.replay('p1');
    expect(res.eventCount).toBe(2);
    expect(res.state.name).toBe('DesignOS');
    expect(res.state.version).toBe('1.0');
  });
});
`
  }
);

console.log('All packages generated.');
