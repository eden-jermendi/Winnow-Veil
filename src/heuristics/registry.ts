import { HeuristicRule } from './types.js';

export class HeuristicRegistry {
  private rules: Map<string, HeuristicRule> = new Map();

  register(rule: HeuristicRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Duplicate rule registration: ${rule.id}`);
    }
    this.rules.set(rule.id, rule);
  }

  getRules(): HeuristicRule[] {
    return Array.from(this.rules.values());
  }

  getSourceRules(): HeuristicRule[] {
    return this.getRules().filter(rule => !!rule.validateLine);
  }

  getManifestRules(): HeuristicRule[] {
    return this.getRules().filter(rule => !!rule.validateManifest);
  }
}

// Export a singleton instance
export const registry = new HeuristicRegistry();
