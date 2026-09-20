import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

async function ensureDir(dirPath: string): Promise<string> {
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

export async function ensureDesignOSHome(home?: string): Promise<string> {
  const homePath = home || path.join(os.homedir(), '.designos');
  return ensureDir(homePath);
}

export function getProjectDir(home: string, projectId: string): string {
  const dir = path.join(home, 'projects', projectId);
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getVaultDir(home: string): string {
  const dir = path.join(home, 'vault');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getCacheDir(home: string): string {
  const dir = path.join(home, 'cache');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getArtifactsDir(home: string, projectId: string): string {
  const dir = path.join(getProjectDir(home, projectId), 'artifacts');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getCapturesDir(home: string, projectId: string): string {
  const dir = path.join(getProjectDir(home, projectId), 'captures');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getSandboxDir(home: string, projectId: string): string {
  const dir = path.join(getProjectDir(home, projectId), 'sandbox');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getVendorDir(home: string): string {
  const dir = path.join(home, 'vendor');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}

export function getExportDir(home: string, projectId: string): string {
  const dir = path.join(getProjectDir(home, projectId), 'exports');
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
}
