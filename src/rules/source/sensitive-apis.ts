import { HeuristicRule, HeuristicSeverity } from '../types.js';

export const SensitiveAPIsRule: HeuristicRule = {
  id: 'source-sensitive-apis',
  severity: HeuristicSeverity.CRITICAL,
  description: 'Flags usage of eval() or child_process which are common vectors for code injection.',
  explanation: [
    'eval() allows execution of arbitrary strings as code, enabling injection attacks.',
    'child_process (exec/spawn) allows running shell commands, which can be leveraged for system compromise.'
  ],
  remediation: [
    'Currently, allowlisting is planned for MVP 2.',
    'For now, manually verify the dependency usage if this rule is triggered.'
  ],
  
  validateLine(line: string): string | null {
    if (/\beval\s*\(/.test(line)) {
      return 'Usage of eval() detected.';
    }
    if (/\bchild_process\b/.test(line) || /(?:^|[^.])\b(exec|spawn|fork)\s*\(/.test(line)) {
      return 'Usage of child_process or execution command detected.';
    }
    return null;
  }
};
