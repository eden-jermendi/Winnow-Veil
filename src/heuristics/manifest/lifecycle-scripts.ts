import { HeuristicRule, HeuristicSeverity } from '../types.js';

export const LifecycleScriptsRule: HeuristicRule = {
  id: 'manifest-lifecycle-scripts',
  severity: HeuristicSeverity.WARNING,
  description: 'Flags preinstall or postinstall scripts which can execute arbitrary code on installation.',
  
  validateManifest(manifest: any): string | null {
    const scripts = manifest.scripts || {};
    const flags = ['preinstall', 'postinstall'].filter(s => !!scripts[s]);
    
    if (flags.length > 0) {
      return `Found potentially dangerous lifecycle scripts: ${flags.join(', ')}`;
    }
    
    return null;
  }
};
