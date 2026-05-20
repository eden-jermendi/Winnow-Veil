export interface SafeDepConfig {
  allowlist?: string[];
  rules?: {
    [ruleId: string]: {
      enabled: boolean;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
  };
}
