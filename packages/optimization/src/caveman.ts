import { randomUUID } from 'node:crypto';

export class CavemanAdapter {
  private available = false;
  private localStore = new Map<string, string>();
  
  constructor(private mcpBin?: string) {
    this.available = Boolean(mcpBin);
  }
  
  isAvailable(): boolean { return this.available; }
  
  async compress(input: string, contentType?: string): Promise<{
    compressed: string;
    recoveryHandle: string;
    tokensBefore: number;
    tokensAfter: number;
    ratio: number;
  }> {
    if (!this.available) return this.fallbackCompress(input);
    
    // Mock MCP implementation
    const recoveryHandle = randomUUID();
    this.localStore.set(recoveryHandle, input);
    const tokensBefore = Math.ceil(input.length / 4);
    const compressed = input.substring(0, input.length / 2); // Mock compression
    const tokensAfter = Math.ceil(compressed.length / 4);
    
    return {
      compressed,
      recoveryHandle,
      tokensBefore,
      tokensAfter,
      ratio: tokensAfter / tokensBefore,
    };
  }
  
  async retrieve(recoveryHandle: string, query?: string): Promise<string> {
    const content = this.localStore.get(recoveryHandle);
    if (!content) throw new Error('Content not found for handle');
    
    if (query) {
      // Mock filtering based on query
      return content.split('\\n').filter(line => line.includes(query)).join('\\n');
    }
    return content;
  }
  
  /** Fallback: progressive summarization when Caveman MCP is unavailable */
  private fallbackCompress(input: string): { compressed: string; recoveryHandle: string; tokensBefore: number; tokensAfter: number; ratio: number } {
    // Progressive summarization: keep first/last paragraphs, summarize middle
    // Store full content locally with a handle
    const recoveryHandle = randomUUID();
    this.localStore.set(recoveryHandle, input);
    
    const paragraphs = input.split('\\n\\n').filter(p => p.trim());
    let compressed = input;
    
    if (paragraphs.length > 2) {
      const first = paragraphs[0];
      const last = paragraphs[paragraphs.length - 1];
      const middle = `... [${paragraphs.length - 2} paragraphs summarized] ...`;
      compressed = `${first}\\n\\n${middle}\\n\\n${last}`;
    }
    
    const tokensBefore = Math.ceil(input.length / 4);
    const tokensAfter = Math.ceil(compressed.length / 4);
    
    return {
      compressed,
      recoveryHandle,
      tokensBefore,
      tokensAfter,
      ratio: tokensBefore > 0 ? tokensAfter / tokensBefore : 1,
    };
  }
}
