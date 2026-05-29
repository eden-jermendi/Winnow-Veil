import { HeuristicRule, HeuristicSeverity } from '../types.js';

export const LifecycleScriptsRule: HeuristicRule = {
  id: 'manifest-lifecycle-scripts',
  severity: HeuristicSeverity.WARNING,
  description: 'Flags preinstall or postinstall scripts which can execute arbitrary code on installation.',
  explanation: [
    'These scripts (preinstall/postinstall) run automatically when a package is installed.',
    'They are frequently used by malicious actors to download second-stage payloads or steal environment variables.'
  ],
  remediation: [
    'Currently, allowlisting is planned for MVP 2.',
    'For now, manually verify the dependency usage if this rule is triggered.'
  ],
  
  validateManifest(manifest: any): string | null {
    const scripts = manifest.scripts || {};
    const flags = ['preinstall', 'postinstall'].filter(s => !!scripts[s]);
    
    if (flags.length > 0) {
      return `Found potentially dangerous lifecycle scripts: ${flags.join(', ')}`;
    }
    
    return null;
  }
};
