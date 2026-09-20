import type { NormalizedPlugin } from './manifest.js';
import { createHash } from 'node:crypto';

export interface PluginSnapshot {
  pluginId: string;
  hash: string;
  timestamp: number;
}

export class SnapshotManager {
  createSnapshot(plugin: NormalizedPlugin): PluginSnapshot {
    const data = JSON.stringify(plugin);
    const hash = createHash('sha256').update(data).digest('hex');
    
    return {
      pluginId: plugin.id,
      hash,
      timestamp: Date.now()
    };
  }
}
