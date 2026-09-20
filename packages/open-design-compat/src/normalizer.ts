export class Normalizer {
  normalizeFormat(odFormat: any): any {
    if (!odFormat) return {};
    
    // Normalize Open Design object format to DesignOS standard format
    return {
      id: odFormat.id || 'unknown',
      name: odFormat.name || 'Unknown',
      version: odFormat.version || '0.0.0',
      description: odFormat.description || '',
      designosCompatible: true,
      original: odFormat
    };
  }
}
