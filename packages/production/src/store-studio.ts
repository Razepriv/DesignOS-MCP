export interface StoreCampaignConfig { platforms: ('ios'|'android')[]; locales: string[]; }
export interface StoreCampaign { id: string; assets: StoreAsset[]; }
export interface StoreAsset { id: string; platform: string; type: 'screenshot' | 'icon' | 'video'; url: string; }
export interface StoreSpec { requiredSizes: { width: number; height: number }[]; }
export interface ValidationResult { valid: boolean; errors: string[]; }

export class StoreStudio {
  generateCampaign(projectId: string, config: StoreCampaignConfig): StoreCampaign {
    const assets: StoreAsset[] = [];
    for (const platform of config.platforms) {
      assets.push({ id: `${platform}-1`, platform, type: 'screenshot', url: `https://store/${platform}/1.png` });
    }
    return { id: `camp-${projectId}`, assets };
  }
  
  validateAgainstSpec(assets: StoreAsset[], spec: StoreSpec): ValidationResult {
    const errors: string[] = [];
    if (assets.length === 0) errors.push('No assets provided');
    return { valid: errors.length === 0, errors };
  }
}
