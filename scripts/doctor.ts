import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

interface Check {
  name: string;
  required: boolean;
  check: () => Promise<boolean>;
}

const home = process.env.DESIGNOS_HOME ?? '.designos';

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const checks: Check[] = [
  {
    name: 'Node >= 20',
    required: true,
    check: async () => Number(process.versions.node.split('.')[0]) >= 20,
  },
  {
    name: 'pnpm available',
    required: true,
    check: async () => commandExists('pnpm'),
  },
  {
    name: 'DesignOS home directory',
    required: true,
    check: async () => {
      try { await access(home); return true; } catch { return false; }
    },
  },
  {
    name: 'SQLite database',
    required: true,
    check: async () => {
      try { await access(join(home, 'designos.db')); return true; } catch { return false; }
    },
  },
  {
    name: 'Design Vault',
    required: true,
    check: async () => {
      try { await access(join(home, 'vault')); return true; } catch { return false; }
    },
  },
  {
    name: 'Source registry (>= 250)',
    required: true,
    check: async () => {
      try {
        const data = JSON.parse(await readFile('sources/registry/sources.json', 'utf8'));
        return Array.isArray(data) && data.length >= 250;
      } catch { return false; }
    },
  },
  {
    name: 'Craft rules',
    required: true,
    check: async () => {
      try { await access('craft'); return true; } catch { return false; }
    },
  },
  {
    name: 'Skills directory',
    required: true,
    check: async () => {
      try { await access('skills/designos/SKILL.md'); return true; } catch { return false; }
    },
  },
  {
    name: 'Playwright / Chromium',
    required: false,
    check: async () => {
      try {
        execSync('npx playwright --version', { stdio: 'ignore' });
        return true;
      } catch { return false; }
    },
  },
  {
    name: 'TinyFish API key',
    required: false,
    check: async () => Boolean(process.env.TINYFISH_API_KEY),
  },
  {
    name: 'Caveman MCP',
    required: false,
    check: async () => Boolean(process.env.CAVEMAN_MCP_BIN),
  },
  {
    name: 'Vercel CLI',
    required: false,
    check: async () => commandExists('vercel'),
  },
  {
    name: 'Vercel token',
    required: false,
    check: async () => Boolean(process.env.VERCEL_TOKEN),
  },
  {
    name: 'FFmpeg',
    required: false,
    check: async () => commandExists('ffmpeg'),
  },
  {
    name: 'Embedding provider',
    required: false,
    check: async () => {
      const provider = process.env.DESIGNOS_EMBEDDING_PROVIDER ?? 'local';
      if (provider === 'openai') return Boolean(process.env.OPENAI_API_KEY);
      return true; // local always available
    },
  },
];

async function main() {
  console.log('🩺 DesignOS Doctor\n');
  let failures = 0;
  let optional = 0;

  for (const { name, required, check } of checks) {
    const ok = await check();
    const icon = ok ? '✓' : required ? '✗' : '○';
    const label = required ? '' : ' (optional)';
    console.log(`  ${icon} ${name}${label}`);
    if (!ok && required) failures++;
    if (!ok && !required) optional++;
  }

  console.log('');
  if (failures > 0) {
    console.log(`❌ ${failures} required check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`✅ All required checks passed.${optional > 0 ? ` ${optional} optional feature(s) not configured.` : ''}`);
  }
}

main().catch(err => {
  console.error('Doctor failed:', err);
  process.exitCode = 1;
});
