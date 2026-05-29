import { execSync } from 'node:child_process';
import path from 'node:path';

export function checkStagedManifestChanges(): boolean {
  try {
    const stagedFiles = execSync('git diff --staged --name-only', {
      encoding: 'utf-8',
    });
    const manifests = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ];

    return stagedFiles.split('\n').some((file) => {
      const fileName = path.basename(file.trim());
      return manifests.includes(fileName);
    });
  } catch {
    // Fail-secure: default to executing scan protocol if diff reading fails
    throw new Error('Failed to read Git diff status.');
  }
}
