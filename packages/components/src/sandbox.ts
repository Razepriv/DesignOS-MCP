import * as fs from 'fs/promises';
import * as path from 'path';

export interface InstallResult {
  success: boolean;
  package: string;
  version: string;
  error?: string;
}

export interface InstalledDependency {
  name: string;
  version: string;
}

export class DependencySandbox {
  constructor(private sandboxDir: string) {}
  
  async createSandbox(projectId: string): Promise<string> {
    const projectSandboxDir = path.join(this.sandboxDir, projectId);
    await fs.mkdir(projectSandboxDir, { recursive: true });
    
    // Create a basic package.json
    const pkgJson = {
      name: `sandbox-${projectId}`,
      version: '1.0.0',
      private: true,
      dependencies: {}
    };
    
    await fs.writeFile(
      path.join(projectSandboxDir, 'package.json'), 
      JSON.stringify(pkgJson, null, 2)
    );
    
    return projectSandboxDir;
  }
  
  async installDependency(projectId: string, pkg: string, version: string): Promise<InstallResult> {
    try {
      const projectSandboxDir = path.join(this.sandboxDir, projectId);
      const pkgPath = path.join(projectSandboxDir, 'package.json');
      
      const pkgContent = await fs.readFile(pkgPath, 'utf-8');
      const pkgJson = JSON.parse(pkgContent);
      
      pkgJson.dependencies = pkgJson.dependencies || {};
      pkgJson.dependencies[pkg] = version;
      
      await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2));
      
      // In a real implementation, we would run `npm install` or `pnpm install` here
      // For now, we just update the package.json to mock it
      
      return {
        success: true,
        package: pkg,
        version
      };
    } catch (error: any) {
      return {
        success: false,
        package: pkg,
        version,
        error: error.message
      };
    }
  }
  
  async getInstalledDeps(projectId: string): Promise<InstalledDependency[]> {
    try {
      const pkgPath = path.join(this.sandboxDir, projectId, 'package.json');
      const pkgContent = await fs.readFile(pkgPath, 'utf-8');
      const pkgJson = JSON.parse(pkgContent);
      
      const deps = pkgJson.dependencies || {};
      return Object.entries(deps).map(([name, version]) => ({
        name,
        version: version as string
      }));
    } catch (e) {
      return [];
    }
  }
}
