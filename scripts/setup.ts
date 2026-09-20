import { mkdir, copyFile, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const full = process.argv.includes('--full');
const withOpenDesign = process.argv.includes('--with-open-design');
const home = process.env.DESIGNOS_HOME ?? '.designos';

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const c = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    c.on('exit', code => code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`)));
    c.on('error', reject);
  });
}

async function exists(path: string): boolean {
  try { await access(path); return true; } catch { return false; }
}

async function main() {
  console.log('🚀 DesignOS Setup\n');

  // 1. Create DesignOS home directories
  const dirs = [
    'projects', 'cache', 'artifacts', 'vault', 'indexes', 'captures',
    'sandboxes', 'vendor', 'exports', 'vault/sources', 'vault/references',
    'vault/components', 'vault/patterns', 'vault/layouts', 'vault/typography',
    'vault/colors', 'vault/motion', 'vault/3d', 'vault/shaders',
    'vault/industries', 'vault/design-systems', 'vault/approved',
    'vault/rejected', 'vault/projects',
  ];
  for (const dir of dirs) {
    await mkdir(join(home, dir), { recursive: true });
  }
  console.log(`  ✓ DesignOS home initialized at ${home}`);

  // 2. Initialize database
  try {
    const { getDatabase, closeDatabase } = await import('../packages/database/src/index.js');
    const dbPath = join(home, 'designos.db');
    const db = getDatabase(dbPath);
    closeDatabase();
    console.log(`  ✓ Database initialized at ${dbPath}`);
  } catch (err) {
    console.log(`  ○ Database initialization skipped (run after pnpm install): ${(err as Error).message}`);
  }

  // 3. Validate source registry
  try {
    const { readFileSync } = await import('node:fs');
    const sources = JSON.parse(readFileSync('sources/registry/sources.json', 'utf8'));
    console.log(`  ✓ Source registry: ${sources.length} sources loaded`);
  } catch {
    console.log('  ○ Source registry not found (will be created)');
  }

  // 4. Create .env if not exists
  if (!await exists('.env')) {
    await copyFile('.env.example', '.env');
    console.log('  ✓ Created .env from .env.example');
  } else {
    console.log('  ✓ .env already exists');
  }

  // 5. Full setup (optional tools)
  if (full) {
    console.log('\n  Installing optional tools...\n');

    try {
      await run('pnpm', ['exec', 'playwright', 'install', 'chromium']);
      console.log('  ✓ Playwright Chromium installed');
    } catch {
      console.log('  ○ Playwright Chromium install skipped');
    }

    try {
      await run('pnpm', ['exec', 'vercel', '--version']);
      console.log('  ✓ Vercel CLI available');
    } catch {
      console.log('  ○ Vercel CLI not available');
    }
  }

  // 6. Open Design sync (optional)
  if (withOpenDesign) {
    console.log('\n  Syncing Open Design upstream...\n');
    try {
      await run('tsx', ['scripts/sync-open-design.ts']);
      console.log('  ✓ Open Design synced');
    } catch {
      console.log('  ○ Open Design sync skipped');
    }
  }

  console.log('\n✅ DesignOS setup complete.');
  console.log('   Run: pnpm designos:doctor');
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exitCode = 1;
});
