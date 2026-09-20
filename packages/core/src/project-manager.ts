import crypto from 'node:crypto';
import type { Database } from 'better-sqlite3';
import { validateTransition } from './state-machine.js';
import type { ProjectStage } from './state-machine.js';

export interface TokenMetrics { total: number; input: number; output: number; }
export interface CacheMetrics { hits: number; misses: number; size: number; }

export interface Decision { id: string; title: string; description: string; createdAt: string; }
export interface Approval { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; reviewer: string; timestamp: string; }
export interface Reference { id: string; url: string; title: string; type: string; }

export interface ProjectSession {
  id: string;
  name: string;
  stage: ProjectStage;
  decisions: Decision[];
  approvals: Approval[];
  references: Reference[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
}

export class ProjectManager {
  constructor(private db: Database) {
    this.initDb();
  }

  private initDb() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        stage TEXT NOT NULL,
        decisions TEXT NOT NULL,
        approvals TEXT NOT NULL,
        references_list TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  private serialize(project: ProjectSession): any {
    return {
      ...project,
      decisions: JSON.stringify(project.decisions),
      approvals: JSON.stringify(project.approvals),
      references_list: JSON.stringify(project.references)
    };
  }

  private deserialize(row: any): ProjectSession {
    return {
      id: row.id,
      name: row.name,
      stage: row.stage as ProjectStage,
      decisions: JSON.parse(row.decisions),
      approvals: JSON.parse(row.approvals),
      references: JSON.parse(row.references_list),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  create(input: CreateProjectInput): ProjectSession {
    const project: ProjectSession = {
      id: crypto.randomUUID(),
      name: input.name,
      stage: 'INITIALIZATION',
      decisions: [],
      approvals: [],
      references: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const s = this.serialize(project);
    const stmt = this.db.prepare('INSERT INTO projects (id, name, stage, decisions, approvals, references_list, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(s.id, s.name, s.stage, s.decisions, s.approvals, s.references_list, s.createdAt, s.updatedAt);
    
    return project;
  }

  get(id: string): ProjectSession | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this.deserialize(row);
  }

  list(): ProjectSession[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updatedAt DESC');
    const rows = stmt.all();
    return rows.map((row: any) => this.deserialize(row));
  }

  private update(project: ProjectSession): void {
    project.updatedAt = new Date().toISOString();
    const s = this.serialize(project);
    const stmt = this.db.prepare('UPDATE projects SET name = ?, stage = ?, decisions = ?, approvals = ?, references_list = ?, updatedAt = ? WHERE id = ?');
    stmt.run(s.name, s.stage, s.decisions, s.approvals, s.references_list, s.updatedAt, s.id);
  }

  transition(id: string, stage: ProjectStage): ProjectSession {
    const project = this.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    
    validateTransition(project.stage, stage);
    project.stage = stage;
    this.update(project);
    return project;
  }

  addDecision(id: string, decision: Omit<Decision, 'id' | 'createdAt'>): Decision {
    const project = this.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    
    const newDecision: Decision = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...decision
    };
    
    project.decisions.push(newDecision);
    this.update(project);
    return newDecision;
  }

  addApproval(id: string, approval: Omit<Approval, 'id'>): Approval {
    const project = this.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    
    const newApproval: Approval = {
      id: crypto.randomUUID(),
      ...approval
    };
    
    project.approvals.push(newApproval);
    this.update(project);
    return newApproval;
  }

  addReference(id: string, ref: Omit<Reference, 'id'>): Reference {
    const project = this.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    
    const newRef: Reference = {
      id: crypto.randomUUID(),
      ...ref
    };
    
    project.references.push(newRef);
    this.update(project);
    return newRef;
  }

  getMetrics(id: string): { tokenMetrics: TokenMetrics; cacheMetrics: CacheMetrics } {
    // Mocked metrics for now, could be stored in a separate table
    return {
      tokenMetrics: { total: 0, input: 0, output: 0 },
      cacheMetrics: { hits: 0, misses: 0, size: 0 }
    };
  }

  resume(id: string): ProjectSession {
    const project = this.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    return project;
  }
}
