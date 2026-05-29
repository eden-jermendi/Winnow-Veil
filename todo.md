# Veil & Winnow Development Progress

## Important Guardrails!

- Never delete or move the `#!/usr/bin/env node` shebang from the absolute top of `src/cli/index.ts`.
- Ensure `/src/core` remains strictly headless: no direct `console.log` statements, `process.exit()`, or write actions.

## Phase 1 — Project Initialization & Core (COMPLETE)

- [x] Initialize `package.json` with minimal dependencies (zero external packages).
- [x] Configure `tsconfig.json` (NodeNext/ESNext).
- [x] Establish high-speed, zero-dependency streaming file readers in `/src/core/utils/file-io.ts`.
- [x] Implement robust file size guardrails (500KB cap) to prevent memory allocation spikes.

## Phase 2 — Winnow Static Analysis Engine (COMPLETE)

- [x] Implement core static analysis scheduling engine (`src/core/engine.ts`).
- [x] Establish extensible Rules Registry model under `src/rules/`.
- [x] Implement MVP Rules:
  - `manifest-lifecycle-scripts`: Flags preinstall/postinstall execution vectors.
  - `source-sensitive-apis`: Pinpoints dynamic evaluation (`eval()`) and system executions (`child_process`).
- [x] Create Native Test Harness suites (`tests/engine.test.ts`) utilizing mock workspaces.

## Phase 3 — Veil CLI & Subcommands decoupling (COMPLETE)

- [x] Create thin CLI wrapper routing shell inputs to subcommands under `src/cli/commands/`:
  - `scan.ts`: Standard development and production analysis scans.
  - `explain.ts`: Dynamic rule descriptions and remediation steps fetched programmatically.
  - `hook.ts`: Standard pre-commit hook runner.
- [x] Relocate Console Reporter formats to `src/cli/console.ts`.
- [x] Remove all side-effects and console prints from core scanning routines.

## Phase 4 — High-Speed Pre-Commit Hook Decoupling (COMPLETE)

- [x] Move delta checking logic (`src/hooks/delta.ts`) to run scans only when manifest files are staged.
- [x] Decouple pre-commit orchestration and timeout boundaries (`src/hooks/orchestrator.ts`) using a strict 1.5-second fail-open wrapper.
- [x] Refactor Husky setup logic (`scripts/setup-hook.ts`) to compile and link the `veil hook` command natively.

## Phase 5 — WinnowCI GitHub Action (COMPLETE)

- [x] Establish the `/ci` directory at the project root.
- [x] Implement a native composite GitHub Action (`ci/action.yml`) to invoke Veil scan parameters in cloud pipelines.
- [x] Replace legacy workflows with `.github/workflows/winnow-ci.yml` targeting PR and pushes to `main`.

## Phase 6 — Rebranding & Configuration Schema (COMPLETE)

- [x] Rename configuration logic and interfaces to support `veil.json` (`src/config/loader.ts`, `src/config/types.ts`).
- [x] Rebrand metadata, binary links, and workspace scripts in `package.json` under `veil-cli`.
- [x] Rebuild whole-repo imports to support `/rules/` namespace structure instead of heuristics.
- [x] Overwrite documentation with the brand-new systems README.

---

## 🚀 Next Steps & Testing Roadmap

### 1. Stress Testing & Personal Verification (TODO)
- [ ] **Hook Performance Verification**: Verify pre-commit hooks in active workspaces with multiple staged changes, checking execution is consistently under 25ms.
- [ ] **Timeout Testing**: Intentionally delay disk I/O to ensure the 1.5s timeout logic triggers fail-open boundaries correctly without locking commit pipelines.
- [ ] **Workflow Validation**: Deploy the branch PR to verify the composite action `uses: ./ci` runs successfully and flags warnings in headless runners.

### 2. Configuration & Allowlist Refinement (TODO)
- [ ] **Dynamic Allowlist Overrides**: Test loader parsing logic using custom overrides inside local `veil.json` manifests.
- [ ] **Dynamic Rule Levels**: Implement custom rule severity configurations (WARNING, CRITICAL, INFO) driven by the JSON config.

### 3. Future Conceptual Expansion: Unveil (TODO)
- [ ] **Dependency Graph Extraction**: Gather dependency relationship links.
- [ ] **Interactive Visualizations**: Conceptualize CLI-based trees or HTML-based dependency flow models to uncover hidden lifecycle execution paths.

### 4. Secure npm Trusted Publishing (OIDC) (HIGH PRIORITY - TODO)
- [ ] **Revoke Bypass Token**: Delete the temporary granular token from npm and remove `NPM_TOKEN` from GitHub secrets (achieving maximum security).
- [ ] **Configure Trusted Publisher**: Bind `winnow-veil` to `eden-jermendi/Winnow-Veil` on npm via **Account Settings** -> **Publishing** -> **Trusted Publishing**.
- [ ] **Deploy OIDC Workflow**: Update `.github/workflows/npm-publish.yml` to request OIDC `id-token` write permissions and publish using `npm publish --provenance --access public`.

