import type { AgentRuntimeAdapter } from '../adapter.js';

export class MockAdapter implements AgentRuntimeAdapter {
  async detect() { return true; }
  async version() { return '1.0.0'; }
  capabilities() { return ['mock']; }
  async start(workdir: string) {}
  async sendPrompt(prompt: string) { return `Mock response to: ${prompt}`; }
  streamEvents(callback: (event: any) => void) {}
  async cancel() {}
}
