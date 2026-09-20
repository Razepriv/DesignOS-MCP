import type { AgentRuntimeAdapter } from '../adapter.js';

export class GeminiAdapter implements AgentRuntimeAdapter {
  async detect() { return false; }
  async version() { return 'gemini-unknown'; }
  capabilities() { return ['multimodal']; }
  async start(workdir: string) {}
  async sendPrompt(prompt: string) { return 'Gemini response'; }
  streamEvents(callback: (event: any) => void) {}
  async cancel() {}
}
