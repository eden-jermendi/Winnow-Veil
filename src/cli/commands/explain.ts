import { registry } from '../../rules/registry.js';

export function handleExplain(args: string[]) {
  const ruleId = args[0];
  if (!ruleId) {
    console.error('Error: explain requires a <ruleId> argument.');
    process.exit(1);
  }

  const rule = registry.getRules().find((r) => r.id === ruleId);
  if (!rule) {
    console.error(`Error: Rule "${ruleId}" not found in registry.`);
    process.exit(1);
  }

  console.log(`\n=== Rule Explanation: ${rule.id} ===`);
  console.log(`Severity:    ${rule.severity}`);
  console.log(`Description: ${rule.description}`);
  console.log(`\nWhy it's dangerous:`);

  if (rule.explanation && rule.explanation.length > 0) {
    rule.explanation.forEach((line) => {
      console.log(`- ${line}`);
    });
  } else {
    console.log(`- This rule flags patterns often associated with supply chain attacks or insecure coding practices.`);
  }

  console.log(`\nHow to safely allowlist:`);
  if (rule.remediation && rule.remediation.length > 0) {
    rule.remediation.forEach((line) => {
      console.log(`- ${line}`);
    });
  } else {
    console.log(`- Currently, allowlisting is planned for MVP 2.`);
    console.log(`- For now, manually verify the dependency usage if this rule is triggered.`);
  }
  console.log(`========================================\n`);
}
