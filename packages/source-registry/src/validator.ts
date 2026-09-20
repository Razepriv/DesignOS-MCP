import type { DesignSource } from '@designos/contracts';

export interface ValidationResult {
  valid: boolean;
  totalSources: number;
  errors: string[];
  warnings: string[];
}

export function validateRegistry(sources: DesignSource[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (sources.length < 250) errors.push(`Source count ${sources.length} < 250 minimum`);
  
  const ids = sources.map(s => s.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) errors.push(`Duplicate IDs: ${[...new Set(dupes)].join(', ')}`);
  
  const noCat = sources.filter(s => !s.category);
  if (noCat.length) errors.push(`${noCat.length} sources missing category`);
  
  const noAdapter = sources.filter(s => !s.adapter);
  if (noAdapter.length) errors.push(`${noAdapter.length} sources missing adapter`);
  
  for (const s of sources) {
    try { new URL(s.url); } catch { errors.push(`Invalid URL for ${s.id}: ${s.url}`); }
  }
  
  const deep = sources.filter(s => s.adapter === 'deep').length;
  const structured = sources.filter(s => s.adapter === 'structured-browser').length;
  if (deep < 25) warnings.push(`Deep adapters: ${deep} (target 25-30)`);
  if (structured < 60) warnings.push(`Structured adapters: ${structured} (target 60-80)`);
  
  return { valid: errors.length === 0, totalSources: sources.length, errors, warnings };
}
