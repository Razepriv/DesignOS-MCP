/**
 * Source validation script
 * Validates the source registry meets all requirements
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface DesignSource {
  id: string;
  name: string;
  url: string;
  category: string;
  tags: string[];
  access: string;
  adapter: string;
  capabilities: Record<string, boolean>;
  authRequired: boolean;
  licenseNotes: string;
  priority: number;
  freshnessPolicy: string;
  lastVerified: string;
}

const live = process.argv.includes('--live');

function loadSources(): DesignSource[] {
  const sourcesPath = join(process.cwd(), 'sources', 'registry', 'sources.json');
  return JSON.parse(readFileSync(sourcesPath, 'utf8'));
}

function validate(sources: DesignSource[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Total >= 250
  if (sources.length < 250) {
    errors.push(`Source count ${sources.length} < 250 minimum`);
  }

  // No duplicate IDs
  const ids = sources.map(s => s.id);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate ID: ${id}`);
    seen.add(id);
  }

  // No missing categories
  for (const s of sources) {
    if (!s.category) errors.push(`Missing category for: ${s.id}`);
    if (!s.adapter) errors.push(`Missing adapter for: ${s.id}`);
    if (!s.url) errors.push(`Missing URL for: ${s.id}`);
    try { new URL(s.url); } catch { errors.push(`Invalid URL for ${s.id}: ${s.url}`); }
  }

  // Adapter distribution
  const deep = sources.filter(s => s.adapter === 'deep').length;
  const structured = sources.filter(s => s.adapter === 'structured-browser').length;
  const generic = sources.filter(s => s.adapter === 'generic-reference').length;

  if (deep < 25) warnings.push(`Deep adapters: ${deep} (target 25-30)`);
  if (structured < 27) warnings.push(`Structured adapters: ${structured} (target 60-80)`);

  return { errors, warnings };
}

async function main() {
  console.log('📋 DesignOS Source Registry Validation\n');

  const sources = loadSources();
  const { errors, warnings } = validate(sources);

  // Stats
  const deep = sources.filter(s => s.adapter === 'deep').length;
  const structured = sources.filter(s => s.adapter === 'structured-browser').length;
  const generic = sources.filter(s => s.adapter === 'generic-reference').length;
  const pub = sources.filter(s => s.access === 'public').length;
  const freemium = sources.filter(s => s.access === 'freemium').length;
  const auth = sources.filter(s => s.access === 'authenticated').length;

  console.log(`  Sources: ${sources.length}`);
  console.log(`  Deep adapters: ${deep}`);
  console.log(`  Structured adapters: ${structured}`);
  console.log(`  Generic adapters: ${generic}`);
  console.log(`  Public: ${pub}`);
  console.log(`  Freemium: ${freemium}`);
  console.log(`  Authenticated: ${auth}`);
  console.log(`  Duplicate IDs: ${errors.filter(e => e.startsWith('Duplicate')).length}`);
  console.log(`  Missing categories: ${errors.filter(e => e.startsWith('Missing category')).length}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Errors:');
    for (const e of errors) console.log(`  - ${e}`);
    process.exitCode = 1;
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (errors.length === 0) {
    console.log('✅ Source registry validation passed.');
  }

  if (live) {
    console.log('\n🌐 Live URL verification (sampling 10 sources)...\n');
    const sample = sources.sort(() => Math.random() - 0.5).slice(0, 10);
    for (const s of sample) {
      try {
        const resp = await fetch(s.url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        console.log(`  ${resp.ok ? '✓' : '✗'} ${s.id}: ${s.url} (${resp.status})`);
      } catch (err) {
        console.log(`  ✗ ${s.id}: ${s.url} (${(err as Error).message})`);
      }
    }
  }
}

main().catch(err => {
  console.error('Validation failed:', err);
  process.exitCode = 1;
});
