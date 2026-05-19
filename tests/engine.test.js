import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { runScanner } from '../src/core/engine.js';
import { HeuristicSeverity } from '../src/heuristics/types.js';
test('Scanning Engine Verification', async (t) => {
    const tmpDir = path.join(process.cwd(), 'tmp-test-workspace');
    // Setup mock workspace
    if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'node_modules/malicious-pkg'), { recursive: true });
    // 1. Root package.json
    const rootPackage = {
        name: 'test-project',
        dependencies: {
            'malicious-pkg': '1.0.0'
        }
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(rootPackage));
    // 2. Malicious package manifest
    const malPackage = {
        name: 'malicious-pkg',
        version: '1.0.0',
        main: 'index.js',
        scripts: {
            postinstall: 'node malicious.js'
        }
    };
    fs.writeFileSync(path.join(tmpDir, 'node_modules/malicious-pkg/package.json'), JSON.stringify(malPackage));
    // 3. Malicious source file
    const malSource = `
    const payload = "calc";
    eval(payload); // Trigger
    console.log("Safe code");
  `;
    fs.writeFileSync(path.join(tmpDir, 'node_modules/malicious-pkg/index.js'), malSource);
    await t.test('should flag malicious package for both manifest and source rules', async () => {
        const report = await runScanner(tmpDir);
        assert.strictEqual(report.totalDependenciesScanned, 1);
        assert.strictEqual(report.findings.length, 1);
        const finding = report.findings[0];
        assert.strictEqual(finding.dependencyName, 'malicious-pkg');
        // Check manifest match
        const manifestMatch = finding.matches.find(m => m.ruleId === 'manifest-lifecycle-scripts');
        assert.ok(manifestMatch, 'Should have manifest-lifecycle-scripts match');
        assert.strictEqual(manifestMatch.severity, HeuristicSeverity.WARNING);
        // Check source match
        const sourceMatch = finding.matches.find(m => m.ruleId === 'source-sensitive-apis');
        assert.ok(sourceMatch, 'Should have source-sensitive-apis match');
        assert.strictEqual(sourceMatch.severity, HeuristicSeverity.CRITICAL);
        assert.strictEqual(sourceMatch.lineNum, 3);
        assert.strictEqual(sourceMatch.content, 'eval(payload); // Trigger');
    });
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
});
