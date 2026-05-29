import fs from 'node:fs';
import path from 'node:path';
import { VeilConfig } from './types.js';

const CONFIG_FILE = 'veil.json';

export function loadConfig(projectRoot: string): VeilConfig {
  const configPath = path.join(projectRoot, CONFIG_FILE);
  
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as VeilConfig;
  } catch (error) {
    throw new Error(`Failed to parse ${CONFIG_FILE}. Ensure it is valid JSON.`);
  }
}
