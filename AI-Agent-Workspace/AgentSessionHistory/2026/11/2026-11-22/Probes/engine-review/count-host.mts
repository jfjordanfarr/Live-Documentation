// Scans a copy of a folder through a host that counts every call it is asked, failures included, and prints each path
// asked more than once or asked and not found. The engine review of 2026-11-22 (README.md beside this file).
//   TMPDIR=<scratch> node --import tsx AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/count-host.mts <folder>
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { generateLiveDocs } from "../../../../../../../packages/generator/src/generator";
import { NODE_FILE_HOST } from "../../../../../../../packages/engine/src/tooling/nodeHost";

const source = process.argv[2];
const work = mkdtempSync(path.join(os.tmpdir(), "count-host-"));
cpSync(source, work, { recursive: true });
const calls = new Map<string, { read: number; failed: number; head: number }>();
const note = (file: string) => calls.get(file) ?? calls.set(file, { read: 0, failed: 0, head: 0 }).get(file)!;
const host = {
  read: async (file: string) => {
    try {
      const bytes = await NODE_FILE_HOST.read(file);
      note(path.relative(work, file)).read++;
      return bytes;
    } catch (error) {
      note(path.relative(work, file)).failed++;
      throw error;
    }
  },
  head: async (file: string, bytes: number) => {
    note(path.relative(work, file)).head++;
    return NODE_FILE_HOST.head(file, bytes);
  }
};
const quiet = { info: () => undefined, warn: () => undefined, error: () => undefined };
await generateLiveDocs({ workspaceRoot: work, host, logger: quiet, now: () => new Date("2026-11-22T00:00:00Z") });
const rows = [...calls].filter(([, c]) => c.read + c.failed + c.head > 1 || c.failed > 0).sort(([a], [b]) => (a < b ? -1 : 1));
console.log(JSON.stringify(Object.fromEntries(rows), null, 1));
rmSync(work, { recursive: true, force: true });
