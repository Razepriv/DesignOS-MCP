import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { parseManifest, type NormalizedPlugin } from './manifest.js';

export class PluginLoader {
  async loadPlugin(pluginDir: string): Promise<NormalizedPlugin> {
    const manifestPath = join(pluginDir, 'designos.json');
    const skillPath = join(pluginDir, 'SKILL.md');
    
    if (!existsSync(manifestPath)) {
      throw new Error(`Missing designos.json in ${pluginDir}`);
    }
    
    const rawManifest = readFileSync(manifestPath, 'utf8');
    const manifestData = JSON.parse(rawManifest);
    
    const skillContent = existsSync(skillPath) ? readFileSync(skillPath, 'utf8') : '';
    
    return parseManifest(manifestData, skillContent);
  }
}
