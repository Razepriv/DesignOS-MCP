/**
 * Open Design validation script
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const home = process.env.DESIGNOS_HOME ?? '.designos';

function main() {
  console.log('🔍 DesignOS Open Design Validation\n');

  // Check lock file
  const lockPath = 'third-party/open-design.lock.json';
  if (!existsSync(lockPath)) {
    console.log('  ✗ Lock file not found');
    process.exitCode = 1;
    return;
  }
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  console.log(`  ✓ Lock file found (commit: ${lock.commit.slice(0, 8)})`);

  // Check compat package
  const compatPkg = 'packages/open-design-compat/package.json';
  if (existsSync(compatPkg)) {
    console.log('  ✓ Compatibility package exists');
  } else {
    console.log('  ✗ Compatibility package missing');
  }

  // Check vendor directory
  const vendorDir = join(home, 'vendor', 'open-design');
  if (existsSync(vendorDir)) {
    console.log('  ✓ Vendor directory exists');
    const reportPath = join(vendorDir, 'sync-report.json');
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      console.log(`  ✓ Sync report found`);
      console.log(`    Last synced: ${lock.syncedAt ?? 'never'}`);
    }
  } else {
    console.log('  ○ Vendor directory not created (run designos:open-design:sync)');
  }

  console.log('\n✅ Open Design validation complete.');
}

main();
