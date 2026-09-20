import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export interface ProjectInput {
  title: string;
  input_type: string;
  original_input?: string;
  brief?: string;
}

export const ProjectRepo = {
  create(input: ProjectInput): string {
    const db = getDatabase();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO projects (id, title, input_type, original_input, brief, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.title,
      input.input_type,
      input.original_input ?? '',
      input.brief ?? '',
      now,
      now
    );
    return id;
  },

  get(id: string): any {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (row && typeof row.data === 'string') {
      row.data = JSON.parse(row.data);
    }
    return row;
  },

  update(id: string, updates: Partial<{ title: string; brief: string; data: any }>): void {
    const db = getDatabase();
    const sets: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      sets.push('title = ?');
      values.push(updates.title);
    }
    if (updates.brief !== undefined) {
      sets.push('brief = ?');
      values.push(updates.brief);
    }
    if (updates.data !== undefined) {
      sets.push('data = ?');
      values.push(JSON.stringify(updates.data));
    }
    
    if (sets.length === 0) return;
    
    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  },

  transition(id: string, stage: string): void {
    const db = getDatabase();
    db.prepare('UPDATE projects SET current_stage = ?, updated_at = ? WHERE id = ?')
      .run(stage, new Date().toISOString(), id);
  },

  list(): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
    return rows.map(r => {
      if (typeof r.data === 'string') r.data = JSON.parse(r.data);
      return r;
    });
  },

  delete(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  },

  addDecision(projectId: string, decision: { kind: string; subject: string; note?: string }): string {
    const db = getDatabase();
    const id = randomUUID();
    db.prepare(`
      INSERT INTO decisions (id, project_id, kind, subject, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, projectId, decision.kind, decision.subject, decision.note ?? null, new Date().toISOString());
    return id;
  },

  addApproval(projectId: string, approval: { artifact_type: string; artifact_id: string }): string {
    const db = getDatabase();
    const id = randomUUID();
    db.prepare(`
      INSERT INTO approvals (id, project_id, artifact_type, artifact_id, approved_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, projectId, approval.artifact_type, approval.artifact_id, new Date().toISOString());
    return id;
  }
};
