# Veil 🛡️

Veil is an ultra-fast, zero-dependency dependency inspection and security CLI. Powered by the **Winnow** static analysis engine, it monitors npm dependencies at install, pre-commit, and CI boundaries to block supply chain attacks in milliseconds.

Unlike vulnerability scanners that query historical CVE databases, Veil parses actual dependency manifests and scans source code streams to intercept zero-day attacks, malicious lifecycle scripts, and code obfuscation patterns before they execute.

```
                  ┌─────────────────────────────────────┐
                  │              Veil CLI               │
                  │   (scan / hook / explain / diff)    │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │            Winnow Engine            │
                  │       (Static Analysis core)        │
                  └──────────────────┬──────────────────┘
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
┌─────────────────────────┐                     ┌─────────────────────────┐
│     Rules Registry      │                     │     WinnowCI Layer      │
│  (Heuristic Checkers)   │                     │    (GitHub Actions)     │
└─────────────────────────┘                     └─────────────────────────┘
```

---

## Why Veil?

1. **Active Analysis vs. Passive Querying**: Traditional audits look for matched version numbers in historical databases. Veil inspects the actual files inside `node_modules` dynamically, detecting modern malicious vectors.
2. **Sub-20ms Execution Speed**: Written from the ground up with zero external dependencies and manual command parsing. Veil executes local pre-commit gates in milliseconds, keeping development pipelines fast.
3. **Safe Streaming Architecture**: Uses Node's native `readline` and chunked read streams. Restricts parsing memory footprints and guarantees a maximum file scan threshold (500KB) to prevent resource exhaustion.
4. **Fail-Safe Gatekeeping**: Local pre-commit hook runs on a 1.5-second hard time cap, falling back open if bounds are exceeded to prevent local blocking, while the cloud CI layer enforces strict verification boundaries.

---

## Architecture Specification

Veil is divided into three distinct modules:

*   **Winnow (Core Engine)**: A headless, pure static analysis library. It has no process exit side-effects, no global logs, and takes input files, streams their contents, and outputs raw structured JSON security scan reports.
*   **Veil (CLI)**: A lightweight, developer-focused interface wrapper. Parses CLI flags, manages formatting (Console, JSON, SARIF), handles process exit codes, and provides local setup systems.
*   **WinnowCI (GitHub Action)**: CI validation layer that consumes Winnow results to block high-risk PR merges, emit SARIF reports, and attach inline PR file security reviews.

---

## Core Detection Heuristics

Veil targets supply-chain injection categories using standard structural patterns:

*   **`manifest-lifecycle-scripts` [Severity: WARNING]**: Pinpoints packages using highly suspicious hooks (e.g., `preinstall`, `postinstall`, or `preuninstall`) to execute arbitrary shell scripts or run unverified binaries.
*   **`source-sensitive-apis` [Severity: CRITICAL]**: Pinpoints high-risk dynamic evaluations (`eval()`) and system-level execution pipelines (`child_process`, `exec`, `spawn`, `fork`) residing in dependency runtime footprints.

---

## Configuration

Control system behavior globally or locally inside a `veil.json` file placed at your project root:

```json
{
  "allowlist": [
    "husky",
    "typescript",
    "@types/node"
  ],
  "rules": {
    "manifest-lifecycle-scripts": {
      "enabled": true,
      "severity": "HIGH"
    },
    "source-sensitive-apis": {
      "enabled": true,
      "severity": "CRITICAL"
    }
  }
}
```

---

## Installation & CLI Usage

### Local CLI Installation

To simulate local CLI development and register the binary link:

```bash
npm run build
npm link
```

### Command Reference

#### 1. Analyze Dependencies
Scan direct package dependencies against the heuristics engine.

```bash
# Scan production packages
veil scan

# Scan production and development packages
veil scan --include-dev
```

#### 2. Local Git Hook Protection
Configure Veil as a high-speed pre-commit git gatekeeper. If the change includes a manifest alteration, Veil executes in under 20ms. If a `CRITICAL` vulnerability is detected, the commit is safely blocked.

```bash
# Register git commit hook
veil hook --install
```

#### 3. Inspect Heuristics
View detailed technical rationale and security context for a specific detection rule.

```bash
veil explain source-sensitive-apis
```

---

## Continuous Integration (WinnowCI)

Integrate WinnowCI directly into your Github Actions workflow file (e.g., `.github/workflows/security.yml`):

```yaml
name: Dependency Threat Guard

on:
  pull_request:
    branches: [ main ]

jobs:
  verify-dependencies:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Run Winnow Security Scanner
        uses: winnow-security/winnow-ci@v1
        with:
          include-dev: false
          strict-mode: true
```
