import { HeuristicRule, HeuristicSeverity } from '../types.js';

export const SensitiveAPIsRule: HeuristicRule = {
  id: 'source-sensitive-apis',
  severity: HeuristicSeverity.CRITICAL,
  description: 'Flags usage of eval() or child_process which are common vectors for code injection.',
  
  validateLine(line: string): string | null {
    if (/eval\s*\(/.test(line)) {
      return 'Usage of eval() detected.';
    }
    if (/child_process/.test(line) || /exec\s*\(/.test(line) || /spawn\s*\(/.test(line)) {
      return 'Usage of child_process or execution command detected.';
    }
    return null;
  }
};
