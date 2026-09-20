export enum TrustLevel {
  UNTRUSTED = 0,
  LIMITED = 1,
  TRUSTED = 2,
  SYSTEM = 3
}

export class TrustManager {
  private pluginTrust: Map<string, TrustLevel> = new Map();
  
  setTrustLevel(pluginId: string, level: TrustLevel) {
    this.pluginTrust.set(pluginId, level);
  }
  
  getTrustLevel(pluginId: string): TrustLevel {
    return this.pluginTrust.get(pluginId) ?? TrustLevel.UNTRUSTED;
  }
  
  isTrusted(pluginId: string): boolean {
    return this.getTrustLevel(pluginId) >= TrustLevel.TRUSTED;
  }
}
