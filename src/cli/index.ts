/**
 * SafeDep CLI Entry Point
 * Manual argv parsing to keep dependencies to an absolute minimum.
 */

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`
SafeDep - Lightweight dependency risk scanner

Usage:
  safedep <command> [options]

Commands:
  scan      Analyze dependencies for lifecycle script risks and malicious patterns
  hook      Execute as a git hook (pre-commit/pre-push)
  explain   Provide detailed reasoning for a specific risk score (future)

Options:
  --help, -h    Show this help message
    `);
    process.exit(0);
  }

  console.log(`Command "${command}" acknowledged. Implementation follows in Phase 4.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
