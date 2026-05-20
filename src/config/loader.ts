import fs from 'node:fs';
import path from 'node:path';
import { SafeDepConfig } from './types.js';

const CONFIG_FILE = 'safedep.json';

export function loadConfig(projectRoot: string): SafeDepConfig {
  const configPath = path.join(projectRoot, CONFIG_FILE);
  
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as SafeDepConfig;
  } catch (error) {
    console.error(`[SafeDep] Error: Failed to parse ${CONFIG_FILE}. Ensure it is valid JSON.`);
    process.exit(1);
  }
}
