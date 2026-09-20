/**
 * Source statistics script
 * Reports detailed registry statistics
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface DesignSource {
  id: string; name: string; url: string; category: string;
  tags: string[]; access: string; adapter: string;
  capabilities: Record<string, boolean>;
  priority: number;
}

function main() {
  const sourcesPath = join(process.cwd(), 'sources', 'registry', 'sources.json');
  const sources: DesignSource[] = JSON.parse(readFileSync(sourcesPath, 'utf8'));

  console.log('📊 DesignOS Source Registry Statistics\n');
  console.log(`  Total sources: ${sources.length}\n`);

  // By adapter
  const adapters = new Map<string, number>();
  for (const s of sources) adapters.set(s.adapter, (adapters.get(s.adapter) ?? 0) + 1);
  console.log('  By adapter:');
  for (const [adapter, count] of [...adapters.entries()].sort()) {
    console.log(`    ${adapter}: ${count}`);
  }

  // By access
  console.log('');
  const access = new Map<string, number>();
  for (const s of sources) access.set(s.access, (access.get(s.access) ?? 0) + 1);
  console.log('  By access:');
  for (const [a, count] of [...access.entries()].sort()) {
    console.log(`    ${a}: ${count}`);
  }

  // By category
  console.log('');
  const categories = new Map<string, number>();
  for (const s of sources) categories.set(s.category, (categories.get(s.category) ?? 0) + 1);
  console.log('  By category:');
  for (const [cat, count] of [...categories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`);
  }

  // Capabilities
  console.log('');
  const caps = new Map<string, number>();
  for (const s of sources) {
    for (const [key, val] of Object.entries(s.capabilities)) {
      if (val) caps.set(key, (caps.get(key) ?? 0) + 1);
    }
  }
  console.log('  Capabilities coverage:');
  for (const [cap, count] of [...caps.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cap}: ${count} sources`);
  }

  // Top tags
  console.log('');
  const tags = new Map<string, number>();
  for (const s of sources) {
    for (const tag of s.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }
  console.log('  Top 20 tags:');
  const topTags = [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [tag, count] of topTags) {
    console.log(`    ${tag}: ${count}`);
  }

  // Quality checks
  console.log('');
  const ids = sources.map(s => s.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  const noCat = sources.filter(s => !s.category);
  const noAdapter = sources.filter(s => !s.adapter);
  console.log('  Quality:');
  console.log(`    Duplicate IDs: ${dupes.length}`);
  console.log(`    Missing categories: ${noCat.length}`);
  console.log(`    Missing adapters: ${noAdapter.length}`);
}

main();
