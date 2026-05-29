import { runPreCommitHook } from '../../hooks/orchestrator.js';

export async function handleHook() {
  await runPreCommitHook();
}
