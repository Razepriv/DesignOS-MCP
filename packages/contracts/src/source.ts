export type AdapterKind = 'deep' | 'structured-browser' | 'generic-reference';
export type AccessLevel = 'public' | 'freemium' | 'authenticated';
export type FreshnessPolicy = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'manual';

export interface SourceCapabilities {
  search: boolean;
  screenshot: boolean;
  recording: boolean;
  code: boolean;
  registry: boolean;
  components: boolean;
  inspiration: boolean;
}

export interface DesignSource {
  id: string;
  name: string;
  url: string;
  category: string;
  tags: string[];
  access: AccessLevel;
  adapter: AdapterKind;
  capabilities: SourceCapabilities;
  authRequired: boolean;
  licenseNotes: string;
  priority: number;
  freshnessPolicy: FreshnessPolicy;
  lastVerified: string;
}
