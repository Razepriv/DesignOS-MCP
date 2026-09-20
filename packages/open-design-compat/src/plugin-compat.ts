export class PluginCompat {
  normalizeManifest(openDesignJson: any): any {
    return {
      id: openDesignJson.pluginId || openDesignJson.id || 'unknown',
      name: openDesignJson.title || openDesignJson.name || 'Unknown Plugin',
      version: openDesignJson.version || '1.0.0',
      capabilities: openDesignJson.permissions || openDesignJson.capabilities || [],
      compatMode: 'open-design'
    };
  }
}
