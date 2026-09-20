import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase } from '../src/connection.js';
import { ProjectRepo } from '../src/repositories/project-repo.js';
import { EventRepo } from '../src/repositories/event-repo.js';

describe('Database package', () => {
  beforeEach(() => {
    // Set to memory database for tests
    process.env.DESIGNOS_DB_PATH = ':memory:';
    getDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  it('initializes schema and connects successfully', () => {
    const db = getDatabase();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    expect(tables.length).toBeGreaterThan(10); // Ensure tables got created
  });

  it('can create and get a project', () => {
    const projectId = ProjectRepo.create({
      title: 'Test Project',
      input_type: 'text',
      original_input: 'Hello world',
      brief: 'Test brief'
    });
    
    expect(projectId).toBeDefined();

    const project = ProjectRepo.get(projectId);
    expect(project.title).toBe('Test Project');
    expect(project.input_type).toBe('text');
    expect(project.current_stage).toBe('new');
    expect(project.data).toEqual({});
  });

  it('can update a project', () => {
    const projectId = ProjectRepo.create({
      title: 'Test Project',
      input_type: 'text',
    });

    ProjectRepo.update(projectId, { title: 'Updated Title', data: { updated: true } });
    
    const project = ProjectRepo.get(projectId);
    expect(project.title).toBe('Updated Title');
    expect(project.data).toEqual({ updated: true });
  });

  it('can transition project stage', () => {
    const projectId = ProjectRepo.create({
      title: 'Test Project',
      input_type: 'text',
    });

    ProjectRepo.transition(projectId, 'research');
    
    const project = ProjectRepo.get(projectId);
    expect(project.current_stage).toBe('research');
  });

  it('can emit and get events', () => {
    const projectId = ProjectRepo.create({
      title: 'Test Project',
      input_type: 'text',
    });

    EventRepo.emit({
      project_id: projectId,
      type: 'PROJECT_STARTED',
      payload: { test: 123 },
      metadata: { source: 'test' }
    });

    const events = EventRepo.getByProject(projectId);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('PROJECT_STARTED');
    expect(events[0].payload).toEqual({ test: 123 });
    expect(events[0].metadata).toEqual({ source: 'test' });
  });
});
