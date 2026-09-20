/**
 * Audit third-party dependencies
 */
import { readFileSync, existsSync } from 'node:fs';

function main() {
  console.log('🔍 DesignOS Third-Party Audit\n');

  // Check Open Design lock
  const lockPath = 'third-party/open-design.lock.json';
  if (existsSync(lockPath)) {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    console.log(`  Open Design:`);
    console.log(`    Repository: ${lock.repository}`);
    console.log(`    Commit: ${lock.commit}`);
    console.log(`    License: ${lock.license}`);
    console.log(`    Modules: ${lock.modules.join(', ')}`);
    console.log(`    Approved paths: ${lock.approvedPaths.length}`);
    console.log(`    Blocked paths: ${lock.blockedPaths.length}`);
  } else {
    console.log('  ○ No Open Design lock file found');
  }

  console.log('\n✅ Third-party audit complete.');
}

main();
