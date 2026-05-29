import { HeuristicRule } from './types.js';
import { LifecycleScriptsRule } from './manifest/lifecycle-scripts.js';
import { SensitiveAPIsRule } from './source/sensitive-apis.js';

export class HeuristicRegistry {
  private rules: Map<string, HeuristicRule> = new Map();

  constructor() {
    this.register(LifecycleScriptsRule);
    this.register(SensitiveAPIsRule);
  }

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
