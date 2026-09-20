import type { AgentRuntimeAdapter } from '../adapter.js';
import { execSync } from 'node:child_process';

export class ClaudeAdapter implements AgentRuntimeAdapter {
  async detect() {
    try {
      execSync('claude --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
  async version() { return 'claude-code-unknown'; }
  capabilities() { return ['tools', 'vision']; }
  async start(workdir: string) {}
  async sendPrompt(prompt: string) { return 'Claude response'; }
  streamEvents(callback: (event: any) => void) {}
  async cancel() {}
}
