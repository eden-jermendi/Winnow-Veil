import { scanFileLines } from '../utils/file-io.js';

export interface SourceMatch {
  lineNum: number;
  content: string;
  ruleId: string;
}

/**
 * Scans a source file for patterns using streaming.
 */
export async function scanSourceFile(
  path: string,
  rules: { id: string; pattern: RegExp }[]
): Promise<SourceMatch[]> {
  const matches: SourceMatch[] = [];

  await scanFileLines(path, (line, lineNum) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        matches.push({
          lineNum,
          content: line.trim(),
          ruleId: rule.id,
        });
      }
    }
  });

  return matches;
}
