import { describe, it, expect } from 'vitest';
import { MockAdapter } from '../src/adapters/mock.js';
import { AgentDetector } from '../src/detector.js';

describe('Agent Runtime', () => {
  it('mock adapter should return response', async () => {
    const mock = new MockAdapter();
    const res = await mock.sendPrompt('hello');
    expect(res).toBe('Mock response to: hello');
  });
});
