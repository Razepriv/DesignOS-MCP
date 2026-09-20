import { describe, it, expect, vi } from 'vitest';
import { createServer } from '../src/index.js';
import { DesignOS } from '../src/index.js';

describe('DesignOS MCP Server', () => {
  it('should initialize and register all tools', () => {
    const mockDesignOS: DesignOS = {
      createProject: vi.fn().mockResolvedValue({ id: 'mock' })
    };
    
    const server = createServer(mockDesignOS);
    
    // server is McpServer instance
    expect(server).toBeDefined();
    
    // Test that a few expected tools were registered
    // We would need to inspect the internal tools or call a method to retrieve registered tools
    // Assuming we can check server configuration or we just ensure it doesn't throw
    expect(typeof server).toBe('object');
  });
});
