#!/usr/bin/env node
/**
 * SafeDep CLI Entry Point
 * Manual argv parsing to keep dependencies to an absolute minimum.
 */

import { runScanner } from '../core/engine.js'
import { printConsoleReport } from './console.js'
import { HeuristicSeverity } from '../heuristics/types.js'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { handleScan } from './commands/scan.js'
import { handleExplain } from './commands/explain.js'

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
SafeDep - Lightweight dependency risk scanner

Usage:
  safedep <command> [options]

Commands:
  scan               Analyze dependencies for lifecycle script risks and malicious patterns
  explain <ruleId>   Provide detailed reasoning for a specific risk rule
  hook               Execute as a git hook (pre-commit/pre-push)

Options:
  --include-dev      Include devDependencies in the scan
  --help, -h         Show this help message
    `)
}


async function handleHook() {
  // 1. Delta Check: Check if manifests changed in staged changes
  try {
    const stagedFiles = execSync('git diff --staged --name-only', {
      encoding: 'utf-8',
    })
    const manifests = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ]

    const hasManifestChanges = stagedFiles.split('\n').some((file) => {
      const fileName = path.basename(file.trim())
      return manifests.includes(fileName)
    })

    if (!hasManifestChanges) {
      console.log(
        'ℹ️  SafeDep: No dependency manifest changes detected. Skipping scan.',
      )
      process.exit(0)
    }

    console.log(
      '🔍 SafeDep: Staged manifest changes detected. Initializing hook gatekeeper scan...',
    )
  } catch (err) {
    console.warn(
      '⚠️  SafeDep: Failed to read Git diff status. Defaulting to full scan safety protocol.',
    )
  }

  // 2. Timeout Guardrail: 1.5s limit
  const HOOK_TIMEOUT_MS = 1500

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), HOOK_TIMEOUT_MS)
  })

  const scanPromise = (async () => {
    const startTime = performance.now()
    const report = await runScanner(process.cwd(), { includeDevDeps: false })
    const endTime = performance.now()
    return { report, duration: endTime - startTime }
  })()

  try {
    const { report, duration } = (await Promise.race([
      scanPromise,
      timeoutPromise,
    ])) as { report: any; duration: number }

    const criticalFindings = report.findings.filter((f: any) =>
      f.matches.some((m: any) => m.severity === HeuristicSeverity.CRITICAL),
    )

    if (criticalFindings.length > 0) {
      console.warn(
        '\n⚠️  SafeDep: Critical dependency risks detected in manifest change!',
      )
      printConsoleReport({ ...report, findings: criticalFindings }, duration)
      process.exit(1)
    }

    process.exit(0)
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
      console.warn(
        '\n⚡ SafeDep: Scan timed out (>1.5s). Bypassing to avoid workflow block.',
      )
    }
    // Fail-open for timeout or internal scanner errors during hook
    process.exit(0)
  }
}


main().catch((err) => {
  console.error(err)
  process.exit(1)
})
