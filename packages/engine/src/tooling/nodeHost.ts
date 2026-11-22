/**
 * The Node host's answer to the engine's one question of a file (`FileHost` in `workspaceFiles.ts`): its bytes, and its
 * first bytes, read from the disk by Node. The only module of a scan's path that reads a source file from a disk.
 *
 * @remarks
 * Written 2026-11-22 for the third step of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`): the reads every reader and the generator made of Node for themselves,
 * gathered into the one host that answers them. The generator reads through it unless it is handed another host, as
 * the check that the engine runs in a page hands it one; a reader called with no run's reads (as a reader's own tests
 * call it) reads through it directly (`readSourceReading` in `sourceText.ts`).
 *
 * @module
 */
import { promises as fs } from "node:fs";

import type { FileHost } from "./workspaceFiles";

/** A file's bytes, from the disk. */
export async function readFileBytes(absolutePath: string): Promise<Uint8Array> {
  return fs.readFile(absolutePath);
}

/** The first `bytes` of a file, for the content's say on what the file is; fewer when the file is shorter. */
export async function readFileHead(absolutePath: string, bytes: number): Promise<Uint8Array> {
  const handle = await fs.open(absolutePath, "r");
  try {
    const buffer = new Uint8Array(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** The disk, as Node reads it. */
export const NODE_FILE_HOST: FileHost = { read: readFileBytes, head: readFileHead };
