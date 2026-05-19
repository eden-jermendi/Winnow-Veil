export enum HeuristicSeverity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

export interface HeuristicMatch {
  ruleId: string;
  severity: HeuristicSeverity;
  message: string;
  lineNum?: number;
  content?: string;
}

export interface HeuristicRule {
  id: string;
  severity: HeuristicSeverity;
  description: string;
  
  /**
   * For source file scanning (line-by-line).
   * Returns a match message if triggered, otherwise null.
   */
  validateLine?(line: string, lineNum: number): string | null;

  /**
   * For manifest scanning (package.json).
   * Returns a match message if triggered, otherwise null.
   */
  validateManifest?(manifest: any): string | null;
}
