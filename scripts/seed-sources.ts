/**
 * Seed sources into the database from the registry JSON
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  console.log('🌱 Seeding DesignOS source registry...\n');

  const sourcesPath = join(process.cwd(), 'sources', 'registry', 'sources.json');
  const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));

  try {
    const { getDatabase, closeDatabase } = await import('../packages/database/src/index.js');
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO sources (id, name, url, category, tags, access, adapter, capabilities, auth_required, license_notes, priority, freshness_policy, last_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items: any[]) => {
      for (const s of items) {
        stmt.run(
          s.id, s.name, s.url, s.category,
          JSON.stringify(s.tags), s.access, s.adapter,
          JSON.stringify(s.capabilities), s.authRequired ? 1 : 0,
          s.licenseNotes, s.priority, s.freshnessPolicy, s.lastVerified
        );
      }
    });

    insertMany(sources);
    closeDatabase();

    console.log(`  ✓ Seeded ${sources.length} sources into database`);
  } catch (err) {
    console.log(`  ○ Database seeding skipped: ${(err as Error).message}`);
    console.log(`  (Registry file has ${sources.length} sources)`);
  }

  console.log('\n✅ Source seeding complete.');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exitCode = 1;
});
