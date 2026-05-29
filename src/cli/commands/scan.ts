import { runScanner } from '../../core/engine.js';
import { printConsoleReport } from '../console.js';
import { HeuristicSeverity } from '../../heuristics/types.js';

export async function handleScan(options: string[]) {
  const includeDevDeps = options.includes('--include-dev');

  const startTime = performance.now();
  try {
    const report = await runScanner(process.cwd(), { includeDevDeps });
    const endTime = performance.now();

    printConsoleReport(report, endTime - startTime);

    const hasCritical = report.findings.some((f) =>
      f.matches.some((m) => m.severity === HeuristicSeverity.CRITICAL),
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
