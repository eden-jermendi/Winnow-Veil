/**
 * SafeDep CLI Entry Point
 * Manual argv parsing to keep dependencies to an absolute minimum.
 */

import { runScanner } from '../core/engine.js';
import { registry } from '../heuristics/registry.js';
import { printConsoleReport } from '../reporter/console.js';
import { HeuristicSeverity } from '../heuristics/types.js';
import { execSync } from 'node:child_process';
import path from 'node:path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case 'scan':
      await handleScan(args.slice(1));
      break;
    case 'explain':
      handleExplain(args.slice(1));
      break;
    case 'hook':
      await handleHook();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
SafeDep - Lightweight dependency risk scanner

Usage:
  safedep <command> [options]

Commands:
  scan               Analyze dependencies for lifecycle script risks and malicious patterns
  explain <ruleId>   Provide detailed reasoning for a specific risk rule
  hook               Execute as a git hook (pre-commit/pre-push)

Options:
  --include-dev      Include devDependencies in the scan
  --help, -h         Show this help message
    `);
}

async function handleScan(options: string[]) {
  const includeDevDeps = options.includes('--include-dev');
  
  const startTime = performance.now();
  try {
    const report = await runScanner(process.cwd(), { includeDevDeps });
    const endTime = performance.now();
    
    printConsoleReport(report, endTime - startTime);

    const hasCritical = report.findings.some(f => 
      f.matches.some(m => m.severity === HeuristicSeverity.CRITICAL)
    );

    if (hasCritical) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err: any) {
    console.error(`Scan failed: ${err.message}`);
    process.exit(1);
  }
}

async function handleHook() {
  // 1. Delta Check: Check if manifests changed in staged changes
  try {
    const stagedFiles = execSync('git diff --staged --name-only', { encoding: 'utf-8' });
    const manifests = ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    
    const hasManifestChanges = stagedFiles.split('\n').some(file => {
      const fileName = path.basename(file.trim());
      return manifests.includes(fileName);
    });

    if (!hasManifestChanges) {
      console.log('ℹ️  SafeDep: No dependency manifest changes detected. Skipping scan.');
      process.exit(0);
    }

    console.log('🔍 SafeDep: Staged manifest changes detected. Initializing hook gatekeeper scan...');
  } catch (err) {
    console.warn('⚠️  SafeDep: Failed to read Git diff status. Defaulting to full scan safety protocol.');
  }

  // 2. Timeout Guardrail: 1.5s limit
  const HOOK_TIMEOUT_MS = 1500;
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), HOOK_TIMEOUT_MS);
  });

  const scanPromise = (async () => {
    const startTime = performance.now();
    const report = await runScanner(process.cwd(), { includeDevDeps: false });
    const endTime = performance.now();
    return { report, duration: endTime - startTime };
  })();

  try {
    const { report, duration } = await Promise.race([scanPromise, timeoutPromise]) as { report: any, duration: number };
    
    const criticalFindings = report.findings.filter((f: any) => 
      f.matches.some((m: any) => m.severity === HeuristicSeverity.CRITICAL)
    );

    if (criticalFindings.length > 0) {
      console.warn('\n⚠️  SafeDep: Critical dependency risks detected in manifest change!');
      printConsoleReport({ ...report, findings: criticalFindings }, duration);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
      console.warn('\n⚡ SafeDep: Scan timed out (>1.5s). Bypassing to avoid workflow block.');
    }
    // Fail-open for timeout or internal scanner errors during hook
    process.exit(0);
  }
}

function handleExplain(args: string[]) {
  const ruleId = args[0];
  if (!ruleId) {
    console.error('Error: explain requires a <ruleId> argument.');
    process.exit(1);
  }

  const rule = registry.getRules().find(r => r.id === ruleId);
  if (!rule) {
    console.error(`Error: Rule "${ruleId}" not found in registry.`);
    process.exit(1);
  }

  console.log(`\n=== Rule Explanation: ${rule.id} ===`);
  console.log(`Severity:    ${rule.severity}`);
  console.log(`Description: ${rule.description}`);
  console.log(`\nWhy it's dangerous:`);
  
  if (rule.id === 'manifest-lifecycle-scripts') {
    console.log(`- These scripts (preinstall/postinstall) run automatically when a package is installed.`);
    console.log(`- They are frequently used by malicious actors to download second-stage payloads or steal environment variables.`);
  } else if (rule.id === 'source-sensitive-apis') {
    console.log(`- eval() allows execution of arbitrary strings as code, enabling injection attacks.`);
    console.log(`- child_process (exec/spawn) allows running shell commands, which can be leveraged for system compromise.`);
  } else {
    console.log(`- This rule flags patterns often associated with supply chain attacks or insecure coding practices.`);
  }

  console.log(`\nHow to safely allowlist:`);
  console.log(`- Currently, allowlisting is planned for MVP 2.`);
  console.log(`- For now, manually verify the dependency usage if this rule is triggered.`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
