import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export interface VaultEntry {
  id: string;
  path: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

export class VaultManager {
  constructor(private vaultDir: string) {}
  
  async initialize(): Promise<void> {
    const dirs = ['sources', 'references', 'components', 'patterns', 'layouts', 'typography', 'colors', 'motion', '3d', 'shaders', 'industries', 'design-systems', 'approved', 'rejected', 'projects'];
    for (const dir of dirs) {
      await mkdir(join(this.vaultDir, dir), { recursive: true });
    }
  }
  
  async createEntry(category: string, frontmatter: Record<string, unknown>, content: string): Promise<VaultEntry> {
    const id = (frontmatter.id as string) ?? `${category}_${randomUUID().slice(0, 8)}`;
    const filename = `${id}.md`;
    const entryPath = join(this.vaultDir, category, filename);
    const yaml = this.toYamlFrontmatter(frontmatter);
    await writeFile(entryPath, `---\n${yaml}---\n\n${content}`, 'utf8');
    return { id, path: entryPath, frontmatter, content };
  }
  
  async getEntry(category: string, id: string): Promise<VaultEntry | null> {
    try {
      const entryPath = join(this.vaultDir, category, `${id}.md`);
      const fileContent = await readFile(entryPath, 'utf8');
      const { frontmatter, content } = this.parseYamlFrontmatter(fileContent);
      return { id, path: entryPath, frontmatter, content };
    } catch {
      return null;
    }
  }
  
  async listEntries(category: string): Promise<VaultEntry[]> {
    try {
      const files = await readdir(join(this.vaultDir, category));
      const entries: VaultEntry[] = [];
      for (const file of files) {
        if (file.endsWith('.md')) {
          const id = file.replace('.md', '');
          const entry = await this.getEntry(category, id);
          if (entry) entries.push(entry);
        }
      }
      return entries;
    } catch {
      return [];
    }
  }
  
  async searchEntries(query: string): Promise<VaultEntry[]> {
    const results: VaultEntry[] = [];
    try {
      const dirs = await readdir(this.vaultDir);
      for (const dir of dirs) {
        try {
          const entries = await this.listEntries(dir);
          for (const entry of entries) {
            if (entry.content.includes(query) || JSON.stringify(entry.frontmatter).includes(query)) {
              results.push(entry);
            }
          }
        } catch {}
      }
    } catch {}
    return results;
  }
  
  async updateEntry(category: string, id: string, updates: Partial<VaultEntry>): Promise<VaultEntry> {
    const existing = await this.getEntry(category, id);
    if (!existing) throw new Error('Entry not found');
    const newFrontmatter = { ...existing.frontmatter, ...updates.frontmatter };
    const newContent = updates.content ?? existing.content;
    return this.createEntry(category, newFrontmatter, newContent);
  }
  
  async deleteEntry(category: string, id: string): Promise<void> {
    const entryPath = join(this.vaultDir, category, `${id}.md`);
    await rm(entryPath, { force: true });
  }
  
  private toYamlFrontmatter(obj: Record<string, unknown>): string {
    return Object.entries(obj).map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(i => `  - ${i}`).join('\n')}`;
      return `${k}: ${v}`;
    }).join('\n') + '\n';
  }
  
  private parseYamlFrontmatter(text: string): { frontmatter: Record<string, unknown>; content: string } {
    const match = text.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
    if (!match) return { frontmatter: {}, content: text };
    
    const fm: Record<string, unknown> = {};
    let currentKey = '';
    let currentArray: string[] = [];
    
    for (const line of match[1].split('\n')) {
      const arrayMatch = line.match(/^\s+-\s+(.+)$/);
      if (arrayMatch && currentKey) {
        currentArray.push(arrayMatch[1]);
        fm[currentKey] = [...currentArray];
      } else {
        const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
        if (kvMatch) {
          currentKey = kvMatch[1];
          const value = kvMatch[2].trim();
          if (value === '') currentArray = [];
          else { fm[currentKey] = value; currentArray = []; }
        }
      }
    }
    return { frontmatter: fm, content: match[2] };
  }
}
