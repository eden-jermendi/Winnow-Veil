# SafeDep 🛡️

A zero-dependency, ultra-fast static analysis CLI utility designed to intercept supply-chain security risks locally and in the cloud.

Unlike traditional tools that only match against pre-existing vulnerability databases (CVEs), **SafeDep actively inspects the structural code patterns of your direct dependencies** in real-time. It detects zero-day risks, malicious lifecycle scripts, and sensitive API usage before the code can ever execute on your machine.

---

## Why SafeDep?

As a developer, application security shouldn't be an afterthought or a sluggish pipeline bottleneck. Traditional vulnerability databases miss brand-new ("zero-day") threats or custom malicious payloads injected into compromised packages.

SafeDep was built with a **security-first philosophy**:

- **Active Inspection:** It scans the actual source files and manifests of incoming dependencies rather than relying on historical lists.
- **Developer Experience (DX):** Designed to execute in milliseconds so that security loops enhance workflows rather than slowing them down.
- **Extensible Architecture:** Built with an isolated registry pattern, allowing developers to customize rules, adjust strictness, and manage codebase-specific allowlists.

---

## 📸 Technical Demonstration

### Local Git Hook Gatekeeper Mode

_SafeDep intercepting a high-risk package during a local git commit event in under 15 milliseconds._

![SafeDep Terminal Scan Report](https://via.placeholder.com/800x400.png?text=Placeholder:+SafeDep+Terminal+Scan+Output)

---

## 🛠️ The Tech Stack & Architecture

Built purely within the **React & Node.js ecosystem** using strict compilation guardrails:

- **Language:** TypeScript (configured for native `NodeNext` modules).
- **Runtime Environments:** Node.js LTS, macOS, and Ubuntu Linux (CI).
- **Testing:** Native Node.js Test Harness (`node:test`) for zero-overhead test suites.
- **Automation:** Husky (v9+) for local hook interception configuration.

### Performance & Security Guardrails

- **Zero Runtime Dependencies:** Built completely by hand utilizing manual `process.argv` string manipulation to guarantee near-instantaneous CLI boot times.
- **Memory-Safe Streaming:** Utilizes Node's native `readline` and chunked `fs.createReadStream` to scan files line-by-line, protecting system memory when inspecting heavy dependency footprints.
- **Targeted Delta Checks:** Leverages standard Git plumbing (`git diff --staged`) to bypass scans entirely if your project manifest hasn't changed.

---

## 🚀 Features & Implementation

### 1. Multi-Stage Gatekeeping

- **Local Protection (`safedep hook`):** A lightweight gatekeeper built into your local Git system. If a dependency change introduces a `CRITICAL` anomaly, the commit is instantly aborted.
- **Cloud Enforcement (CI):** A GitHub Actions pipeline that clones your code into a headless environment, builds it, and triggers a full baseline scan (`safedep scan --include-dev`) to protect the `main` branch on every Pull Request.

### 2. Heuristics Registry Engine

- **`manifest-lifecycle-scripts`:** Catches risky hooks (e.g., `postinstall` scripts running hidden arbitrary binary executions).
- **`source-sensitive-apis`:** Pinpoints direct obfuscations or risky runtime calls (e.g., hidden `eval()` configurations or suspicious `child_process` execution modules).
- **False Positive Management:** Includes an adjustable configuration bypass system to ensure trusted infrastructure packages (like `typescript` or `husky`) don't break developer flow.

---

## 💻 Local Installation & Usage

### 1. Global Installation (Development Simulation)

Clone this repository locally, compile the source files, and register the binary link:

<pre><code>npm run build
npm link</code></pre>

### 2. Wire Up a Project Gatekeeper

Navigate to any target Node.js codebase on your machine and link the engine:

<pre><code>npm link safedep
npm run setup-hook</code></pre>

### 3. CLI Command Suite

<pre><code># Run a baseline production audit
npx safedep scan

# Run an exhaustive development audit
npx safedep scan --include-dev

# Deep dive into rule definitions
npx safedep explain source-sensitive-apis</code></pre>

---

## 🗺️ Next Steps & Open Source Vision

SafeDep is actively being dogfooded and stress-tested across a variety of personal systems and cohort environments.

Before officially publishing to the public **npm registry**, the roadmap includes:

- [ ] Externalizing configuration profiles into a dedicated local `safedep.json` file.
- [ ] Refining error isolation loops around complex nested package exports.
- [ ] Shipping the public NPM package deployment.
