/**
 * DesignOS Release Check
 * Runs all validation gates before release
 */
import { execSync } from 'node:child_process';

interface GateResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: GateResult[] = [];

function runGate(name: string, command: string): void {
  process.stdout.write(`  ⏳ ${name}...`);
  try {
    execSync(command, { stdio: 'pipe', timeout: 120000 });
    results.push({ name, passed: true });
    console.log(` ✓`);
  } catch (err) {
    const details = (err as any).stderr?.toString().slice(0, 200) ?? (err as Error).message;
    results.push({ name, passed: false, details });
    console.log(` ✗`);
  }
}

async function main() {
  console.log('🚢 DesignOS Release Check\n');

  runGate('TypeScript compilation', 'pnpm typecheck');
  runGate('Build', 'pnpm build');
  runGate('Unit tests', 'pnpm test');
  runGate('Source registry validation', 'pnpm designos:sources:validate');

  console.log('\n--- Results ---\n');

  let totalPassed = 0;
  let totalFailed = 0;

  for (const r of results) {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name}`);
    if (!r.passed && r.details) {
      console.log(`     ${r.details.split('\n')[0]}`);
    }
    if (r.passed) totalPassed++;
    else totalFailed++;
  }

  console.log(`\n  Passed: ${totalPassed}/${results.length}`);
  console.log(`  Failed: ${totalFailed}/${results.length}`);

  if (totalFailed > 0) {
    console.log('\n❌ Release check FAILED. Fix issues before pushing.');
    process.exitCode = 1;
  } else {
    console.log('\n✅ Release check PASSED. Ready to push.');
  }
}

main().catch(err => {
  console.error('Release check error:', err);
  process.exitCode = 1;
});
