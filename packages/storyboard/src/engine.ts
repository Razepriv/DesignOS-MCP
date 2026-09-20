import { randomUUID } from 'crypto';

export interface Storyboard { id: string; projectId: string; title: string; createdAt: string; }
export interface StoryboardSceneInput { purpose: string; content: string; copy: string; hierarchy: string; layout: string; references: string; assets: string; motion: { timing: string; easing: string }; interaction: string; scrollTrigger: string; responsive: { desktop: string; tablet: string; mobile: string }; reducedMotionFallback: string; implementationNotes: string; }
export interface StoryboardScene extends StoryboardSceneInput { id: string; storyboardId: string; orderIndex: number; }
export interface MotionSpec { storyboardId: string; scenes: any[]; }
export interface StoryboardApproval { storyboardJson: object; storyboardMd: string; motionSpec: MotionSpec; implementationBrief: string; }

export class StoryboardEngine {
  constructor(private db: any) {
    this.initDb();
  }
  
  private initDb() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS storyboards (id TEXT PRIMARY KEY, projectId TEXT, title TEXT, createdAt TEXT);
      CREATE TABLE IF NOT EXISTS storyboard_scenes (id TEXT PRIMARY KEY, storyboardId TEXT, data JSON, orderIndex INTEGER);
    `);
  }

  create(projectId: string, title: string = 'New Storyboard'): Storyboard { 
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO storyboards (id, projectId, title, createdAt) VALUES (?, ?, ?, ?)');
    stmt.run(id, projectId, title, createdAt);
    return { id, projectId, title, createdAt };
  }
  
  get(id: string): Storyboard | null { 
    const stmt = this.db.prepare('SELECT * FROM storyboards WHERE id = ?');
    const row = stmt.get(id);
    return row ? (row as Storyboard) : null;
  }
  
  addScene(storyboardId: string, scene: StoryboardSceneInput): StoryboardScene { 
    const id = randomUUID();
    const countStmt = this.db.prepare('SELECT COUNT(*) as cnt FROM storyboard_scenes WHERE storyboardId = ?');
    const { cnt } = countStmt.get(storyboardId);
    
    const stmt = this.db.prepare('INSERT INTO storyboard_scenes (id, storyboardId, data, orderIndex) VALUES (?, ?, ?, ?)');
    stmt.run(id, storyboardId, JSON.stringify(scene), cnt);
    return { id, storyboardId, orderIndex: cnt, ...scene };
  }
  
  updateScene(sceneId: string, updates: Partial<StoryboardSceneInput>): void { 
    const stmt = this.db.prepare('SELECT data FROM storyboard_scenes WHERE id = ?');
    const row = stmt.get(sceneId);
    if (!row) return;
    const data = JSON.parse(row.data);
    const newData = { ...data, ...updates };
    const updateStmt = this.db.prepare('UPDATE storyboard_scenes SET data = ? WHERE id = ?');
    updateStmt.run(JSON.stringify(newData), sceneId);
  }
  
  reorderScenes(storyboardId: string, sceneIds: string[]): void { 
    const stmt = this.db.prepare('UPDATE storyboard_scenes SET orderIndex = ? WHERE id = ? AND storyboardId = ?');
    const tx = this.db.transaction((ids: string[]) => {
      ids.forEach((id, idx) => stmt.run(idx, id, storyboardId));
    });
    tx(sceneIds);
  }
  
  approve(storyboardId: string): StoryboardApproval {
    const scenesStmt = this.db.prepare('SELECT data FROM storyboard_scenes WHERE storyboardId = ? ORDER BY orderIndex');
    const scenes = scenesStmt.all(storyboardId).map((row: any) => JSON.parse(row.data));
    
    return {
      storyboardJson: { id: storyboardId, scenes },
      storyboardMd: '# Storyboard\nApproved storyboard markdown.',
      motionSpec: { storyboardId, scenes: scenes.map((s: any) => s.motion) },
      implementationBrief: this.generateImplementationBrief(storyboardId)
    };
  }
  
  generateMotionSpec(storyboardId: string): MotionSpec { 
    const scenesStmt = this.db.prepare('SELECT data FROM storyboard_scenes WHERE storyboardId = ? ORDER BY orderIndex');
    const scenes = scenesStmt.all(storyboardId).map((row: any) => JSON.parse(row.data));
    return { storyboardId, scenes: scenes.map((s: any) => s.motion) };
  }
  
  generateImplementationBrief(storyboardId: string): string { 
    return `# Implementation Brief for Storyboard ${storyboardId}\nImplement scenes in order.`;
  }
}
