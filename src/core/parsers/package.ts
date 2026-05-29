import { readGuardedFile } from '../utils/file-io.js';

export interface PackageManifest {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

/**
 * Parses package.json manifest with size guardrails.
 */
export async function parsePackageManifest(path: string): Promise<PackageManifest | null> {
  try {
    const content = await readGuardedFile(path);
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}
