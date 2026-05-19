import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import readline from 'node:readline';

/**
 * Constants for safety guardrails
 */
export const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB

/**
 * Checks if a file exceeds the size limit.
 */
export async function isSafeFileSize(path: string, limitBytes = MAX_FILE_SIZE_BYTES): Promise<boolean> {
  try {
    const stats = await fs.stat(path);
    return stats.size <= limitBytes;
  } catch (error) {
    return false;
  }
}

/**
 * Safely reads a small JSON/text file after checking size limits.
 * Best for package.json and lockfiles.
 */
export async function readGuardedFile(path: string): Promise<string | null> {
  if (!(await isSafeFileSize(path))) {
    return null;
  }
  return fs.readFile(path, 'utf-8');
}

/**
 * Streams a file line-by-line using readline and createReadStream.
 * Prevents regex/token splitting across buffer chunks.
 */
export async function scanFileLines(
  path: string,
  onLine: (line: string, lineNum: number) => boolean | void
): Promise<void> {
  if (!(await isSafeFileSize(path))) {
    return;
  }

  const fileStream = createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (onLine(line, lineCount) === true) {
      break;
    }
  }

  rl.close();
  fileStream.destroy();
}
