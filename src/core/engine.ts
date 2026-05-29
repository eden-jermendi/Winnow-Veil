import path from 'node:path';
import fs from 'node:fs/promises';
import { parsePackageManifest } from './parsers/package.js';
import { scanSourceFile } from './parsers/source.js';
import { registry } from '../heuristics/registry.js';
import { HeuristicMatch } from '../heuristics/types.js';
import { loadConfig } from '../config/loader.js';

export interface ScanOptions {
  includeDevDeps?: boolean;
  allowedPackages?: string[];
}

export interface ScanResult {
  dependencyName: string;
  version: string;
  matches: HeuristicMatch[];
}

export interface ScanReport {
  timestamp: string;
  rootDir: string;
  totalDependenciesScanned: number;
  findings: ScanResult[];
}

const DEFAULT_ALLOWED_PACKAGES = ['husky', 'typescript', '@types/node'];

export async function runScanner(rootDir: string, options: ScanOptions = {}): Promise<ScanReport> {
  const config = loadConfig(rootDir);
  const allowedPackages = [
    ...DEFAULT_ALLOWED_PACKAGES,
    ...(config.allowlist || []),
    ...(options.allowedPackages || [])
  ];
  const rootManifestPath = path.join(rootDir, 'package.json');
  const rootManifest = await parsePackageManifest(rootManifestPath);

  if (!rootManifest) {
    throw new Error(`Could not find or parse package.json at ${rootManifestPath}`);
  }

  const dependencies = {
    ...(rootManifest.dependencies || {}),
    ...(options.includeDevDeps ? (rootManifest.devDependencies || {}) : {}),
  };

  const findings: ScanResult[] = [];
  const depNames = Object.keys(dependencies);

  for (const depName of depNames) {
    if (allowedPackages.includes(depName)) {
      continue;
    }

    const depPath = path.join(rootDir, 'node_modules', depName);
    const depManifestPath = path.join(depPath, 'package.json');
    const depManifest = await parsePackageManifest(depManifestPath);

    if (!depManifest) continue;

    const depMatches: HeuristicMatch[] = [];

    // 1. Run Manifest Rules
    const manifestRules = registry.getManifestRules();
    for (const rule of manifestRules) {
      if (rule.validateManifest) {
        const message = rule.validateManifest(depManifest);
        if (message) {
          depMatches.push({
            ruleId: rule.id,
            severity: rule.severity,
            message,
          });
        }
      }
    }

    // 2. Run Source Rules on Entry Point
    const entryPoint = depManifest.main || depManifest.module || 'index.js';
    const entryPointPath = path.join(depPath, entryPoint);

    try {
      // Check if file exists before scanning
      await fs.access(entryPointPath);
      const sourceRules = registry.getSourceRules();
      const sourceMatches = await scanSourceFile(entryPointPath, sourceRules);
      depMatches.push(...sourceMatches);
    } catch {
      // Entry point might not exist or be a directory (simplification for MVP)
    }

    if (depMatches.length > 0) {
      findings.push({
        dependencyName: depName,
        version: depManifest.version || 'unknown',
        matches: depMatches,
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    rootDir,
    totalDependenciesScanned: depNames.length,
    findings,
  };
}
