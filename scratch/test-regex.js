const regex = /(?:^|[^.])\b(exec|spawn|fork)\s*\(/;
const lines = [
  "const match = RE_INI_KEY_VAL.exec(line);",
  "if (/[a-z]/.exec(str)) return true;",
  "const { exec } = require('child_process');",
  "exec('curl http://malicious.com');",
  "    exec('indented');",
  "child_process.exec('explicit')"
];

lines.forEach(line => {
  const isMatch = regex.test(line);
  console.log(`Line: [${line}] -> Match: ${isMatch}`);
});

const cpRegex = /\bchild_process\b/;
console.log("\nTesting child_process regex:");
lines.forEach(line => {
  const isMatch = cpRegex.test(line);
  console.log(`Line: [${line}] -> Match: ${isMatch}`);
});
