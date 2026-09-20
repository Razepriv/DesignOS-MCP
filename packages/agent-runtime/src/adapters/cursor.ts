import type { AgentRuntimeAdapter } from '../adapter.js';

export class CursorAdapter implements AgentRuntimeAdapter {
  async detect() { return false; }
  async version() { return 'cursor-unknown'; }
  capabilities() { return ['code-edit']; }
  async start(workdir: string) {}
  async sendPrompt(prompt: string) { return 'Cursor response'; }
  streamEvents(callback: (event: any) => void) {}
  async cancel() {}
}
