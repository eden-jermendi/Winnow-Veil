#!/usr/bin/env node
/**
 * Veil CLI Entry Point
 * Manual argv parsing to keep dependencies to an absolute minimum.
 */

import { handleScan } from './commands/scan.js';
import { handleExplain } from './commands/explain.js';
import { handleHook } from './commands/hook.js';

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === '--help' || command === '-h') {
    printHelp()
    process.exit(0)
  }

  switch (command) {
    case 'scan':
      await handleScan(args.slice(1))
      break
    case 'explain':
      handleExplain(args.slice(1))
      break
    case 'hook':
      await handleHook()
      break
    default:
      console.error(`Unknown command: ${command}`)
      printHelp()
      process.exit(1)
  }
}

function printHelp() {
  console.log(`
Veil - Lightweight dependency risk scanner

Usage:
  veil <command> [options]

Commands:
  scan               Analyze dependencies for lifecycle script risks and malicious patterns
  explain <ruleId>   Provide detailed reasoning for a specific risk rule
  hook               Execute as a git hook (pre-commit/pre-push)

Options:
  --include-dev      Include devDependencies in the scan
  --help, -h         Show this help message
    `)
}




main().catch((err) => {
  console.error(err)
  process.exit(1)
})
