import type { AgentRuntimeAdapter } from './adapter.js';
import { ClaudeAdapter } from './adapters/claude.js';
import { CursorAdapter } from './adapters/cursor.js';
import { GeminiAdapter } from './adapters/gemini.js';

export class AgentDetector {
  private adapters: AgentRuntimeAdapter[] = [
    new ClaudeAdapter(),
    new CursorAdapter(),
    new GeminiAdapter()
  ];

  async detectAll(): Promise<AgentRuntimeAdapter[]> {
    const available: AgentRuntimeAdapter[] = [];
    for (const adapter of this.adapters) {
      if (await adapter.detect()) {
        available.push(adapter);
      }
    }
    return available;
  }
}
