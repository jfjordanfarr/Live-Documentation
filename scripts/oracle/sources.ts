/**
 * Ties an oracle's kept record to the files it was made from. A record kept beside a fixture is read without the
 * language's toolchain, so nothing else says whether the fixture still holds what the oracle read: a file added after
 * the record was written would otherwise be graded by no one. The record names each source with a digest of its text,
 * and a test compares those with the fixture's present files, saying which are new, gone or changed.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import path from "node:path";

/** A file's digest as a kept record names it: SHA-256 of its text with its line endings read as `\n`, so that a checkout's own line endings change nothing. */
export function sourceDigest(absolutePath: string): string {
  return createHash("sha256").update(fs.readFileSync(absolutePath, "utf8").replace(/\r\n?/gu, "\n")).digest("hex");
}

/** The digests of a folder's files, by folder-relative path. */
export function sourceDigests(root: string, files: readonly string[]): Record<string, string> {
  return Object.fromEntries([...files].sort().map((file) => [file, sourceDigest(path.join(root, file))]));
}

/** How a folder's present sources differ from those a kept record was made from, file by file; empty when they agree. */
export function sourcesDiffer(present: Record<string, string>, kept: Record<string, string> | undefined): string[] {
  if (!kept) return ["the record names no sources it was made from"];
  const found: string[] = [];
  for (const [file, digest] of Object.entries(present)) {
    if (!(file in kept)) found.push(`${file} is new`);
    else if (kept[file] !== digest) found.push(`${file} has changed`);
  }
  for (const file of Object.keys(kept)) if (!(file in present)) found.push(`${file} is gone`);
  return found.sort();
}
