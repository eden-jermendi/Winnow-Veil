import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Veil Husky Setup Script
 * Automates the installation and configuration of the pre-commit hook.
 */

function setup() {
  console.log('🚀 Initializing Veil Git Hook (Husky)...');

  try {
    // 1. Initialize Husky
    // Use 'npx husky' which is the modern way (v9+)
    execSync('npx husky', { stdio: 'inherit' });

    // 2. Define the hook command
    // We use tsx to run the source directly for local dev convenience, 
    // ensuring the hook always uses the latest code without a manual build.
    const hookCommand = 'npx tsx src/cli/index.ts hook';
    const huskyDir = '.husky';
    const preCommitPath = path.join(huskyDir, 'pre-commit');

    // 3. Create/Update pre-commit hook
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir);
    }

    fs.writeFileSync(preCommitPath, `#!/usr/bin/env sh\n${hookCommand}\n`, { mode: 0o755 });

    console.log('✅ Veil pre-commit hook installed successfully!');
    console.log('ℹ️  The hook will now run automatically on every "git commit".');
  } catch (error) {
    console.error('❌ Failed to setup Husky hook:', error);
    process.exit(1);
  }
}

setup();
