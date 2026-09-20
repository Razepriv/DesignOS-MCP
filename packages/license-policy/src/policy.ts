export type LicenseClassification = 'PERMISSIVE' | 'AUTHORIZED' | 'REFERENCE_ONLY' | 'UNKNOWN' | 'BLOCKED';

export interface LicenseRecord {
  source: string;
  sourceUrl: string;
  license: string;
  classification: LicenseClassification;
  attribution: string;
  redistributionAllowed: boolean;
  modificationAllowed: boolean;
  commercialUseAllowed: boolean;
  requiresNotice: boolean;
}

export class LicensePolicy {
  classify(license: string): LicenseClassification {
    const upper = license.toUpperCase();
    if (['MIT', 'ISC', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'APACHE-2.0', '0BSD', 'UNLICENSE', 'CC0-1.0'].some(l => upper.includes(l))) return 'PERMISSIVE';
    if (['GPL', 'AGPL', 'LGPL'].some(l => upper.includes(l))) return 'REFERENCE_ONLY';
    if (['CC-BY', 'CC-BY-SA', 'MPL'].some(l => upper.includes(l))) return 'AUTHORIZED';
    if (['PROPRIETARY', 'COMMERCIAL', 'ALL-RIGHTS-RESERVED'].some(l => upper.includes(l))) return 'BLOCKED';
    return 'UNKNOWN';
  }
  
  canAutoInstall(classification: LicenseClassification): boolean {
    return classification === 'PERMISSIVE' || classification === 'AUTHORIZED';
  }
  
  createRecord(source: string, sourceUrl: string, license: string): LicenseRecord {
    const classification = this.classify(license);
    return {
      source, sourceUrl, license, classification,
      attribution: '', redistributionAllowed: classification !== 'BLOCKED',
      modificationAllowed: classification === 'PERMISSIVE' || classification === 'AUTHORIZED',
      commercialUseAllowed: classification === 'PERMISSIVE' || classification === 'AUTHORIZED',
      requiresNotice: classification !== 'PERMISSIVE'
    };
  }
}
