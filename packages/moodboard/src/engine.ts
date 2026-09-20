import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface Moodboard { id: string; projectId: string; title: string; createdAt: string; }
export interface MoodboardItemInput { source: string; url: string; previewPath: string; reasonSelected: string; designDnaReference: string; intendedUse: string; category: 'brand-feeling' | 'color' | 'typography' | 'composition' | 'hero' | 'navigation' | 'cards' | 'product-ui' | 'imagery' | 'illustration' | '3d' | 'motion' | 'scroll' | 'microinteractions' | 'cta' | 'footer'; }
export interface MoodboardItem extends MoodboardItemInput { id: string; moodboardId: string; status: 'pending' | 'keep' | 'modify' | 'reject'; note?: string; orderIndex: number; }
export interface ApprovedDirection { moodboardId: string; keptItems: MoodboardItem[]; }
export interface RejectedDirection { moodboardId: string; rejectedItems: MoodboardItem[]; }
export interface ApprovalResult { keptItems: MoodboardItem[]; rejectedItems: MoodboardItem[]; brandDirection: string; }

export class MoodboardEngine {
  constructor(private db: any) {
    // db is assumed to be better-sqlite3 or similar compatible interface
    this.initDb();
  }
  
  private initDb() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS moodboards (id TEXT PRIMARY KEY, projectId TEXT, title TEXT, createdAt TEXT);
      CREATE TABLE IF NOT EXISTS moodboard_items (id TEXT PRIMARY KEY, moodboardId TEXT, source TEXT, url TEXT, previewPath TEXT, reasonSelected TEXT, designDnaReference TEXT, intendedUse TEXT, category TEXT, status TEXT, note TEXT, orderIndex INTEGER);
    `);
  }

  create(projectId: string, title: string = 'New Moodboard'): Moodboard { 
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO moodboards (id, projectId, title, createdAt) VALUES (?, ?, ?, ?)');
    stmt.run(id, projectId, title, createdAt);
    return { id, projectId, title, createdAt };
  }
  
  get(id: string): Moodboard | null { 
    const stmt = this.db.prepare('SELECT * FROM moodboards WHERE id = ?');
    const row = stmt.get(id);
    return row ? (row as Moodboard) : null;
  }
  
  getByProject(projectId: string): Moodboard[] { 
    const stmt = this.db.prepare('SELECT * FROM moodboards WHERE projectId = ?');
    return stmt.all(projectId) as Moodboard[];
  }
  
  addItem(moodboardId: string, item: MoodboardItemInput): MoodboardItem { 
    const id = randomUUID();
    const countStmt = this.db.prepare('SELECT COUNT(*) as cnt FROM moodboard_items WHERE moodboardId = ?');
    const { cnt } = countStmt.get(moodboardId);
    
    const stmt = this.db.prepare('INSERT INTO moodboard_items (id, moodboardId, source, url, previewPath, reasonSelected, designDnaReference, intendedUse, category, status, orderIndex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, moodboardId, item.source, item.url, item.previewPath, item.reasonSelected, item.designDnaReference, item.intendedUse, item.category, 'pending', cnt);
    return { id, moodboardId, ...item, status: 'pending', orderIndex: cnt };
  }
  
  updateItemStatus(itemId: string, status: 'keep' | 'modify' | 'reject', note?: string): void { 
    const stmt = this.db.prepare('UPDATE moodboard_items SET status = ?, note = ? WHERE id = ?');
    stmt.run(status, note || null, itemId);
  }
  
  removeItem(itemId: string): void { 
    const stmt = this.db.prepare('DELETE FROM moodboard_items WHERE id = ?');
    stmt.run(itemId);
  }
  
  reorderItems(moodboardId: string, itemIds: string[]): void { 
    const stmt = this.db.prepare('UPDATE moodboard_items SET orderIndex = ? WHERE id = ? AND moodboardId = ?');
    const tx = this.db.transaction((ids: string[]) => {
      ids.forEach((id, idx) => stmt.run(idx, id, moodboardId));
    });
    tx(itemIds);
  }
  
  approve(moodboardId: string): ApprovalResult {
    const itemsStmt = this.db.prepare('SELECT * FROM moodboard_items WHERE moodboardId = ?');
    const items = itemsStmt.all(moodboardId) as MoodboardItem[];
    
    const keptItems = items.filter(i => i.status === 'keep');
    const rejectedItems = items.filter(i => i.status === 'reject');
    
    return { keptItems, rejectedItems, brandDirection: '# Brand Direction\nBased on approved items.' };
  }
  
  generateApprovalArtifacts(moodboardId: string): {
    approvedDirection: ApprovedDirection;
    rejectedDirections: RejectedDirection[];
    brandDirection: string;
  } { 
    const result = this.approve(moodboardId);
    return {
      approvedDirection: { moodboardId, keptItems: result.keptItems },
      rejectedDirections: [{ moodboardId, rejectedItems: result.rejectedItems }],
      brandDirection: result.brandDirection
    };
  }
}
