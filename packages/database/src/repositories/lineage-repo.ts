import { getDatabase } from '../connection.js';
import { randomUUID } from 'node:crypto';

export const LineageRepo = {
  addLink(fromType: string, fromId: string, toType: string, toId: string, relationship: string = 'derived_from'): string {
    const db = getDatabase();
    const id = randomUUID();
    // Use an arbitrary project ID or pass it. For now, grab it from 'toId' if it's a project, otherwise use a default
    // In real app, projectId should be passed. Here we insert dummy project_id for constraints
    const dummyProjectId = 'system';
    
    db.prepare(`
      INSERT INTO design_lineage (id, project_id, from_type, from_id, to_type, to_id, relationship, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, dummyProjectId, fromType, fromId, toType, toId, relationship, new Date().toISOString());
    return id;
  },

  getAncestors(entityType: string, entityId: string): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM design_lineage WHERE to_type = ? AND to_id = ?').all(entityType, entityId) as any[];
    return rows.map(r => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : null }));
  },

  getDescendants(entityType: string, entityId: string): any[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM design_lineage WHERE from_type = ? AND from_id = ?').all(entityType, entityId) as any[];
    return rows.map(r => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : null }));
  },

  getChain(entityType: string, entityId: string): any[] {
    // Basic implementation that just gets direct ancestors and descendants for now
    // A full recursive CTE would be needed for deep lineage
    return [
      ...this.getAncestors(entityType, entityId),
      ...this.getDescendants(entityType, entityId)
    ];
  }
};
