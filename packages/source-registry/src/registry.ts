import type { DesignSource } from '@designos/contracts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RegistryStats {
  total: number;
  byAdapter: Record<string, number>;
  byAccess: Record<string, number>;
  byCategory: Record<string, number>;
  duplicateIds: number;
  missingCategories: number;
}

export function loadSourceRegistry(): DesignSource[] {
  try {
    const sourcesPath = join(__dirname, '../../../sources/registry/sources.json');
    const raw = readFileSync(sourcesPath, 'utf8');
    return JSON.parse(raw) as DesignSource[];
  } catch (e) {
    return [];
  }
}

export class SourceRegistry {
  private sources: Map<string, DesignSource>;
  
  constructor(sources?: DesignSource[]) {
    const loaded = sources ?? loadSourceRegistry();
    this.sources = new Map(loaded.map(s => [s.id, s]));
  }
  
  get(id: string): DesignSource | undefined { return this.sources.get(id); }
  getAll(): DesignSource[] { return [...this.sources.values()]; }
  getByCategory(category: string): DesignSource[] { return this.getAll().filter(s => s.category === category); }
  
  getByAdapter(adapter: 'deep' | 'structured-browser' | 'generic-reference'): DesignSource[] { 
    return this.getAll().filter(s => s.adapter === adapter);
  }
  
  getByAccess(access: 'public' | 'freemium' | 'authenticated'): DesignSource[] { 
    return this.getAll().filter(s => s.access === access);
  }
  
  search(query: string): DesignSource[] {
    const terms = query.toLowerCase().split(/\s+/);
    return this.getAll().filter(s => {
      const searchable = `${s.name} ${s.category} ${(s.tags || []).join(' ')}`.toLowerCase();
      return terms.some(t => searchable.includes(t));
    }).sort((a, b) => b.priority - a.priority);
  }
  
  getStats(): RegistryStats {
    const all = this.getAll();
    return {
      total: all.length,
      byAdapter: {
        deep: all.filter(s => s.adapter === 'deep').length,
        'structured-browser': all.filter(s => s.adapter === 'structured-browser').length,
        'generic-reference': all.filter(s => s.adapter === 'generic-reference').length,
      },
      byAccess: {
        public: all.filter(s => s.access === 'public').length,
        freemium: all.filter(s => s.access === 'freemium').length,
        authenticated: all.filter(s => s.access === 'authenticated').length,
      },
      byCategory: Object.fromEntries(
        [...new Set(all.map(s => s.category))].map(c => [c, all.filter(s => s.category === c).length])
      ),
      duplicateIds: all.length - new Set(all.map(s => s.id)).size,
      missingCategories: all.filter(s => !s.category).length,
    };
  }
}
