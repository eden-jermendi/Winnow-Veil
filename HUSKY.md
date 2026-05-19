# Husky Integration Blueprint

To integrate SafeDep into your Git workflow using Husky, follow these steps:

### 1. Install Husky
If you haven't already, install Husky in your project:
```bash
npm install husky --save-dev
npx husky init
```

### 2. Configure Pre-commit Hook
Create or edit `.husky/pre-commit` to include the SafeDep hook command. 

We recommend pointing to the compiled binary for maximum performance:
```bash
# .husky/pre-commit
node dist/src/cli/index.js hook
```

### 3. How it Works
- **Delta Check**: SafeDep will first check if `package.json` or lockfiles have been modified in your staged changes.
- **Fast Exit**: If no manifest files have changed, the hook exits in milliseconds.
- **Scanning**: If manifests *did* change, a scan is triggered.
- **Blocking**: If `CRITICAL` findings are discovered, the commit is blocked and the report is displayed.
- **Timeout**: If the scan takes longer than 1.5s, it will automatically bypass (fail-open) to ensure your workflow isn't stalled.
