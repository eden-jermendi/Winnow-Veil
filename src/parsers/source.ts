import { scanFileLines } from '../utils/file-io.js';
import { HeuristicRule, HeuristicMatch } from '../heuristics/types.js';

/**
 * Scans a source file for patterns using streaming.
 * This is a utility for the engine to execute rules against a file.
 */
export async function scanSourceFile(
  path: string,
  rules: HeuristicRule[]
): Promise<HeuristicMatch[]> {
  const matches: HeuristicMatch[] = [];

  await scanFileLines(path, (line, lineNum) => {
    for (const rule of rules) {
      if (rule.validateLine) {
        const message = rule.validateLine(line, lineNum);
        if (message) {
          matches.push({
            ruleId: rule.id,
            severity: rule.severity,
            message,
            lineNum,
            content: line.trim(),
          });
        }
      }
    }
  });

  return matches;
}
