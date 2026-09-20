import * as os from 'node:os';
import * as path from 'node:path';

export interface DesignOSConfig {
  home: string;
  dbPath: string;
  maxContextTokens: number;
  maxSources: number;
  semanticCacheThreshold: number;
  embeddingProvider: 'local' | 'openai';
}

export function loadConfig(overrides?: Partial<DesignOSConfig>): DesignOSConfig {
  const home = process.env.DESIGNOS_HOME || path.join(os.homedir(), '.designos');
  
  const defaults: DesignOSConfig = {
    home,
    dbPath: path.join(home, 'designos.db'),
    maxContextTokens: process.env.DESIGNOS_MAX_TOKENS ? parseInt(process.env.DESIGNOS_MAX_TOKENS, 10) : 8192,
    maxSources: process.env.DESIGNOS_MAX_SOURCES ? parseInt(process.env.DESIGNOS_MAX_SOURCES, 10) : 10,
    semanticCacheThreshold: process.env.DESIGNOS_CACHE_THRESHOLD ? parseFloat(process.env.DESIGNOS_CACHE_THRESHOLD) : 0.85,
    embeddingProvider: (process.env.DESIGNOS_EMBEDDING_PROVIDER as 'local' | 'openai') || 'local',
  };

  return { ...defaults, ...overrides };
}
