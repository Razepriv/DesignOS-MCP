import { execSync } from 'node:child_process';

export class OpenDesignSync {
  sync(repoUrl: string, commitHash: string, targetDir: string): boolean {
    try {
      execSync(`git clone ${repoUrl} ${targetDir}`);
      execSync(`cd ${targetDir} && git checkout ${commitHash}`);
      return true;
    } catch (e) {
      console.error('Failed to sync Open Design repository', e);
      return false;
    }
  }
}
