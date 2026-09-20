import fs from 'fs';
import path from 'path';

const registryPath = path.join(process.cwd(), 'sources/registry/sources.json');
const sources = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const total = sources.length;
const deep = sources.filter((s: any) => s.adapter === 'deep').length;
const structured = sources.filter((s: any) => s.adapter === 'structured-browser').length;
const generic = sources.filter((s: any) => s.adapter === 'generic-reference').length;

const statsMd = `**${total} Sources** (${deep} Deep, ${structured} Structured, ${generic} Generic)`;
fs.writeFileSync(path.join(process.cwd(), 'docs/generated/source-stats.md'), statsMd);

let sourcesMd = `# Source Registry\n\nThis document lists all currently validated sources available to DesignOS.\n\nTotal Sources: ${total}\n\n| Source | Category | URL | Adapter | Access |\n|---|---|---|---|---|\n`;

sources.forEach((s: any) => {
  sourcesMd += `| ${s.name} | ${s.category} | [Link](${s.url}) | \`${s.adapter}\` | ${s.access} |\n`;
});

fs.writeFileSync(path.join(process.cwd(), 'docs/sources.md'), sourcesMd);
console.log('Docs generated.');
