export class PermissionSystem {
  private allowedCapabilities: Set<string> = new Set();
  
  grant(capability: string) {
    this.allowedCapabilities.add(capability);
  }
  
  revoke(capability: string) {
    this.allowedCapabilities.delete(capability);
  }
  
  check(capability: string): boolean {
    return this.allowedCapabilities.has(capability);
  }
}
