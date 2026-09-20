import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export class SkillImporter {
  importSkill(skillPath: string): any {
    const mdPath = join(skillPath, 'SKILL.md');
    if (!existsSync(mdPath)) {
      throw new Error(`SKILL.md not found in ${skillPath}`);
    }
    const content = readFileSync(mdPath, 'utf8');
    return {
      skillDefinition: content,
      type: 'functional',
      importedAt: Date.now()
    };
  }
}
