import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export class CraftImporter {
  importModule(modulePath: string): any {
    const configPath = join(modulePath, 'craft.json');
    if (!existsSync(configPath)) {
      throw new Error(`craft.json not found in ${modulePath}`);
    }
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return {
      moduleName: config.name,
      components: config.components || [],
      importedAt: Date.now()
    };
  }
}
