export interface DesignSource {
  id: string;
  name: string;
  categories: string[];
  priority: number;
  frameworks?: string[];
  lastUpdated: string;
}

export interface RankedSource extends DesignSource {
  score: number;
}

export function rankSources(query: string, sources: DesignSource[], context?: any): RankedSource[] {
  const q = query.toLowerCase();
  return sources.map(source => {
    let score = 0;
    
    // Semantic/term match
    if (q.includes(source.name.toLowerCase())) score += 10;
    
    source.categories.forEach(cat => {
      if (q.includes(cat.toLowerCase())) score += 5;
    });

    // Priority
    score += source.priority;
    
    return { ...source, score };
  }).sort((a, b) => b.score - a.score);
}
