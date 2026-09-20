import type { Database } from 'better-sqlite3';

export interface LineageEntry { type: string; id: string; }
export interface LineageChain { nodes: LineageEntry[]; edges: { from: string; to: string; relationship: string }[]; }
export interface ProvenanceReport { assetId: string; sources: LineageEntry[]; history: string[]; }

export class LineageTracker {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS lineage_links (
        project_id TEXT, from_type TEXT, from_id TEXT, to_type TEXT, to_id TEXT, relationship TEXT,
        PRIMARY KEY (project_id, from_id, to_id)
      );
    `);
  }
  
  addLink(projectId: string, from: LineageEntry, to: LineageEntry, relationship: string): void {
    this.db.prepare('INSERT OR REPLACE INTO lineage_links (project_id, from_type, from_id, to_type, to_id, relationship) VALUES (?, ?, ?, ?, ?, ?)').run(
      projectId, from.type, from.id, to.type, to.id, relationship
    );
  }
  
  getAncestors(type: string, id: string): LineageEntry[] {
    // Real recursive CTE implementation
    const query = `
      WITH RECURSIVE ancestors(type, id) AS (
        SELECT from_type, from_id FROM lineage_links WHERE to_type = ? AND to_id = ?
        UNION
        SELECT l.from_type, l.from_id FROM lineage_links l JOIN ancestors a ON l.to_type = a.type AND l.to_id = a.id
      )
      SELECT type, id FROM ancestors;
    `;
    return this.db.prepare(query).all(type, id) as LineageEntry[];
  }
  
  getDescendants(type: string, id: string): LineageEntry[] {
    const query = `
      WITH RECURSIVE descendants(type, id) AS (
        SELECT to_type, to_id FROM lineage_links WHERE from_type = ? AND from_id = ?
        UNION
        SELECT l.to_type, l.to_id FROM lineage_links l JOIN descendants d ON l.from_type = d.type AND l.from_id = d.id
      )
      SELECT type, id FROM descendants;
    `;
    return this.db.prepare(query).all(type, id) as LineageEntry[];
  }
  
  getFullChain(type: string, id: string): LineageChain {
    const ancestors = this.getAncestors(type, id);
    const descendants = this.getDescendants(type, id);
    const nodes = [...ancestors, { type, id }, ...descendants];
    
    const edges = this.db.prepare(`
      SELECT from_id as 'from', to_id as 'to', relationship 
      FROM lineage_links
    `).all() as any[];
    
    return { nodes, edges };
  }
  
  getProvenance(assetId: string): ProvenanceReport {
    const ancestors = this.getAncestors('asset', assetId);
    return { assetId, sources: ancestors, history: ['Created', 'Modified'] };
  }
}
