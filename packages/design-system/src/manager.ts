import { randomUUID } from 'crypto';
import type { Database } from 'better-sqlite3';

export interface DesignSystem {
  id: string;
  name: string;
  source: string;
  tokens: Record<string, any>;
  components: any[];
  createdAt: string;
}

export interface DesignSystemInput {
  name: string;
  tokens: Record<string, any>;
}

export class DesignSystemManager {
  constructor(private db: Database) {
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS design_systems (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT NOT NULL,
        tokens TEXT NOT NULL,
        components TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  async importFromLocal(dir: string): Promise<DesignSystem> {
    // Mock local import parsing
    const ds: DesignSystem = {
      id: randomUUID(),
      name: `Local-${dir.split('/').pop()}`,
      source: `local:${dir}`,
      tokens: { colors: { primary: '#00f' } },
      components: [],
      createdAt: new Date().toISOString()
    };
    this.save(ds);
    return ds;
  }

  async importFromGitHub(repo: string): Promise<DesignSystem> {
    const ds: DesignSystem = {
      id: randomUUID(),
      name: `GitHub-${repo.split('/')[1]}`,
      source: `github:${repo}`,
      tokens: { spacing: { md: '16px' } },
      components: [{ name: 'Button', path: 'src/components/Button.tsx' }],
      createdAt: new Date().toISOString()
    };
    this.save(ds);
    return ds;
  }

  async create(input: DesignSystemInput): Promise<DesignSystem> {
    const ds: DesignSystem = {
      id: randomUUID(),
      name: input.name,
      source: 'manual',
      tokens: input.tokens,
      components: [],
      createdAt: new Date().toISOString()
    };
    this.save(ds);
    return ds;
  }

  async get(id: string): Promise<DesignSystem | null> {
    const row = this.db.prepare('SELECT * FROM design_systems WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRow(row);
  }

  async list(): Promise<DesignSystem[]> {
    const rows = this.db.prepare('SELECT * FROM design_systems ORDER BY created_at DESC').all() as any[];
    return rows.map(this.mapRow);
  }

  async exportTokens(id: string, format: 'css' | 'tailwind' | 'json' | 'figma'): Promise<string> {
    const ds = await this.get(id);
    if (!ds) throw new Error('Design system not found');

    if (format === 'json') {
      return JSON.stringify(ds.tokens, null, 2);
    }
    if (format === 'css') {
      let css = ':root {\n';
      // simple flattening for mock
      for (const [category, values] of Object.entries(ds.tokens)) {
        if (typeof values === 'object') {
          for (const [key, val] of Object.entries(values as Record<string, string>)) {
            css += `  --${category}-${key}: ${val};\n`;
          }
        }
      }
      css += '}\n';
      return css;
    }
    
    return `/* Exported as ${format} */\n// Not implemented mock`;
  }

  private save(ds: DesignSystem) {
    this.db.prepare(
      'INSERT INTO design_systems (id, name, source, tokens, components, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      ds.id,
      ds.name,
      ds.source,
      JSON.stringify(ds.tokens),
      JSON.stringify(ds.components),
      ds.createdAt
    );
  }

  private mapRow(row: any): DesignSystem {
    return {
      id: row.id,
      name: row.name,
      source: row.source,
      tokens: JSON.parse(row.tokens),
      components: JSON.parse(row.components),
      createdAt: row.created_at
    };
  }
}
