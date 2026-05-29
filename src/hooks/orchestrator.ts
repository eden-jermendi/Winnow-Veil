import { runScanner } from '../core/engine.js';
import { printConsoleReport } from '../cli/console.js';
import { HeuristicSeverity } from '../heuristics/types.js';
import { checkStagedManifestChanges } from './delta.js';

const HOOK_TIMEOUT_MS = 1500;

export async function runPreCommitHook(): Promise<void> {
  try {
    const hasManifestChanges = checkStagedManifestChanges();
    if (!hasManifestChanges) {
      console.log('ℹ️  SafeDep: No dependency manifest changes detected. Skipping scan.');
      process.exit(0);
    }

    console.log('🔍 SafeDep: Staged manifest changes detected. Initializing hook gatekeeper scan...');
  } catch {
    console.warn('⚠️  SafeDep: Failed to read Git diff status. Defaulting to full scan safety protocol.');
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), HOOK_TIMEOUT_MS);
  });

  const scanPromise = (async () => {
    const startTime = performance.now();
    const report = await runScanner(process.cwd(), { includeDevDeps: false });
    const endTime = performance.now();
    return { report, duration: endTime - startTime };
  })();

  try {
    const { report, duration } = await Promise.race([
      scanPromise,
      timeoutPromise,
    ]) as { report: any; duration: number };

    const criticalFindings = report.findings.filter((f: any) =>
      f.matches.some((m: any) => m.severity === HeuristicSeverity.CRITICAL),
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
