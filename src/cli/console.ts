import { ScanReport } from '../core/engine.js';
import { HeuristicSeverity } from '../heuristics/types.js';

/**
 * Formats and prints the scan report to the console.
 */
export function printConsoleReport(report: ScanReport, durationMs: number): void {
  console.log(`\n=== SafeDep Scan Report ===`);
  console.log(`Directory: ${report.rootDir}`);
  console.log(`Timestamp: ${report.timestamp}\n`);

  if (report.findings.length === 0) {
    console.log(`✅ No anomalies found in ${report.totalDependenciesScanned} dependencies.`);
  } else {
    report.findings.forEach((finding) => {
      console.log(`📦 Dependency: ${finding.dependencyName} (${finding.version})`);
      
      finding.matches.forEach((match) => {
        const severityColor = getSeverityLabel(match.severity);
        console.log(`  [${severityColor}] ${match.ruleId}`);
        console.log(`    Message: ${match.message}`);
        
        if (match.lineNum) {
          console.log(`    Location: Line ${match.lineNum}`);
          console.log(`    Snippet:  ${match.content}`);
        }
        console.log('');
      });
    });
  }

  const totalAnomalies = report.findings.reduce((acc, f) => acc + f.matches.length, 0);

  console.log(`--- Summary ---`);
  console.log(`Packages Scanned: ${report.totalDependenciesScanned}`);
  console.log(`Anomalies Found:  ${totalAnomalies}`);
  console.log(`Execution Time:   ${durationMs.toFixed(2)}ms`);
  console.log(`===============\n`);
}

function getSeverityLabel(severity: HeuristicSeverity): string {
  switch (severity) {
    case HeuristicSeverity.CRITICAL: return 'CRITICAL';
    case HeuristicSeverity.WARNING:  return 'WARNING';
    case HeuristicSeverity.INFO:     return 'INFO';
    default: return severity;
  }
}
