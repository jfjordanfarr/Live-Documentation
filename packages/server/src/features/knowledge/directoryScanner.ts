import { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Recursively scans a directory, invoking the callback for each file found.
 * Automatically skips common non-content directories (node_modules, .git, dist, etc.).
 */
export async function scanDirectory(
  root: string,
  onFile: (filePath: string) => Promise<void>
): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(root, entry.name);
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) return;
        await scanDirectory(resolved, onFile);
        return;
      }

      if (entry.isFile()) {
        await onFile(resolved);
      }
    })
  );
}

/**
 * Returns true if a directory name should be excluded from scanning.
 */
export function shouldSkipDir(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower === ".git" ||
    lower === "node_modules" ||
    lower === "dist" ||
    lower === "out" ||
    lower === "build" ||
    lower === "coverage" ||
    lower === ".vscode" ||
    lower === ".idea" ||
    lower === ".history" ||
    lower === ".vscode-test"
  );
}

/**
 * Returns true if a file path should be excluded from indexing based on its full path.
 */
export function shouldSkipPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    /\/\.git\//.test(normalized) ||
    /\/node_modules\//.test(normalized) ||
    /\/(dist|out|build|coverage)\//.test(normalized) ||
    /\/\.vscode(?:-test)?\//.test(normalized)
  );
}

/**
 * Heuristically determines if a file is binary by sampling its first 2KB.
 * Returns true if NUL bytes are found or if >20% of bytes are non-printable.
 */
export async function isLikelyBinaryFile(filePath: string): Promise<boolean> {
  try {
    const fh = await fs.open(filePath, "r");
    const { size } = await fh.stat();
    const sampleSize = Math.min(size, 2048);
    const buf = Buffer.alloc(sampleSize);
    await fh.read(buf, 0, sampleSize, 0);
    await fh.close();

    // Contains NUL byte → binary
    if (buf.includes(0)) return true;

    // If too many non-printable characters, treat as binary.
    // We also allow UTF-8 multi-byte sequences (bytes 0x80-0xF4) so that files
    // containing Unicode characters (box drawings, emoji, etc.) aren't rejected.
    let nonPrintable = 0;
    for (let i = 0; i < sampleSize; i++) {
      const c = buf[i];
      // allow tab(9), lf(10), cr(13), common whitespace, printable ASCII 32-126,
      // and UTF-8 continuation/leading bytes (0x80-0xF4)
      const printable =
        c === 9 ||
        c === 10 ||
        c === 13 ||
        (c >= 32 && c <= 126) ||
        (c >= 0x80 && c <= 0xf4);
      if (!printable) nonPrintable++;
    }
    return nonPrintable / sampleSize > 0.2;
  } catch {
    return false;
  }
}

/**
 * Checks if a file exists at the given path.
 */
export async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}
