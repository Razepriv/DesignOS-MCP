export interface NormalizedPlugin {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  skillContent: string;
}

export function parseManifest(data: any, skillContent: string): NormalizedPlugin {
  if (!data.id || !data.name || !data.version) {
    throw new Error('Invalid manifest: missing required fields (id, name, version)');
  }
  
  return {
    id: data.id,
    name: data.name,
    version: data.version,
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
    skillContent
  };
}
