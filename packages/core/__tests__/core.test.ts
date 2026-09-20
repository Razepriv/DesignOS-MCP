import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DesignOS } from '../src/designos.js';
import { loadConfig } from '../src/config.js';
import { validateTransition, canTransition, getProgress } from '../src/state-machine.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

describe('DesignOS Core', () => {
  let tempDir: string;
  let designos: DesignOS;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'designos-test-'));
    const config = loadConfig({ home: tempDir, dbPath: path.join(tempDir, 'test.db') });
    designos = await DesignOS.initialize(config);
  });

  afterEach(async () => {
    await designos.shutdown();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should initialize and shutdown correctly', () => {
    expect(designos).toBeDefined();
    expect(designos.db).toBeDefined();
  });

  it('should manage projects', () => {
    const project = designos.projects.create({ name: 'Test Project' });
    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.stage).toBe('INITIALIZATION');

    const fetched = designos.projects.get(project.id);
    expect(fetched).toEqual(project);

    const list = designos.projects.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(project.id);
  });

  it('should handle stage transitions', () => {
    const project = designos.projects.create({ name: 'Test Project' });
    expect(canTransition('INITIALIZATION', 'DISCOVERY')).toBe(true);
    expect(canTransition('INITIALIZATION', 'DESIGN')).toBe(false);

    designos.projects.transition(project.id, 'DISCOVERY');
    const updated = designos.projects.get(project.id);
    expect(updated?.stage).toBe('DISCOVERY');

    expect(() => designos.projects.transition(project.id, 'COMPLETION')).toThrow();
    expect(getProgress('DISCOVERY')).toBeGreaterThan(0);
  });

  it('should manage project entities (decisions, approvals, references)', () => {
    const project = designos.projects.create({ name: 'Entity Test' });
    
    designos.projects.addDecision(project.id, { title: 'D1', description: 'Desc' });
    designos.projects.addApproval(project.id, { status: 'APPROVED', reviewer: 'Ted', timestamp: new Date().toISOString() });
    designos.projects.addReference(project.id, { url: 'http://example.com', title: 'Ex', type: 'link' });

    const updated = designos.projects.get(project.id)!;
    expect(updated.decisions.length).toBe(1);
    expect(updated.approvals.length).toBe(1);
    expect(updated.references.length).toBe(1);
  });

  it('should handle events', async () => {
    let handled = false;
    designos.events.on('PROJECT_CREATED', (e) => {
      expect(e.payload.name).toBe('Event Test');
      handled = true;
    });

    const e = designos.events.emit({ type: 'PROJECT_CREATED', projectId: 'p1', payload: { name: 'Event Test' } });
    expect(e.id).toBeDefined();

    // Give microtasks time to run
    await new Promise(r => setTimeout(r, 10));
    expect(handled).toBe(true);

    const history = designos.events.getHistory('p1');
    expect(history.length).toBe(1);
    expect(history[0].type).toBe('PROJECT_CREATED');
  });

  it('should resume projects', () => {
    const project = designos.projects.create({ name: 'Resume Test' });
    designos.projects.transition(project.id, 'DISCOVERY');
    
    const resumed = designos.projects.resume(project.id);
    expect(resumed.stage).toBe('DISCOVERY');
    expect(resumed.name).toBe('Resume Test');
  });
});
