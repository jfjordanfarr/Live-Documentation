/**
 * A directory typed at the command line in a case that matches two directories, found by the engine review of
 * 2026-11-22. `inspect` takes a directory as an end "found in any case when not as spelled" (`resolveEnd`), and folds
 * every file's path to match it, so that `src/PAY` in a workspace holding both `src/Pay/` and `src/pay/` stands for the
 * files of both: two directories become one end, and the answer is a path from a file of a directory nobody named, told
 * as `src/PAY/`. Such a workspace is ordinary on Linux, where the scan reads names as written. The answer must not be
 * the union; the honest one says that the name is ambiguous and names both.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { generateLiveDocs } from "../../packages/generator/src/generator";

const repoRoot = path.resolve(__dirname, "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
let workspace = "";

function inspect(args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", "inspect.ts"), "--workspace", workspace, ...args],
    { cwd: workspace, encoding: "utf8" });
  return { status: result.status ?? 0, stdout: result.stdout, stderr: result.stderr };
}

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "case-folded-"));
  const files: Record<string, string> = {
    "package.json": '{ "name": "case-folded", "private": true }\n',
    "src/a.ts": "export const a = 1;\n",
    "src/Pay/p.ts": 'import { a } from "../a";\nexport const p = a;\n',
    "src/PaymentService/s.ts": "export const s = 2;\n",
    "src/pay/q.ts": 'import { s } from "../PaymentService/s";\nexport const q = s;\n'
  };
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(workspace, file)), { recursive: true });
    fs.writeFileSync(path.join(workspace, file), text);
  }
  await generateLiveDocs({ workspaceRoot: workspace, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
}, 120_000);

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

describe("a directory typed in a case two directories share", () => {
  it("is not answered as the files of both: the command says the name is ambiguous, names both, and fails", () => {
    const answer = inspect(["--from", "src/PAY", "--to", "src/PaymentService", "--json"]);
    // Seen 2026-11-22: exit 0 and { "kind": "path", ... "src/pay/q.ts" ... }, a path from a directory not named.
    expect(answer.status).not.toBe(0);
    expect(answer.stderr).toContain("src/Pay");
    expect(answer.stderr).toContain("src/pay");
  }, 60_000);

  it("is answered as the one directory when only one matches, as before", () => {
    const answer = inspect(["--from", "src/PAYMENTSERVICE", "--to", "src/pay", "--direction", "inbound", "--json"]);
    expect(answer.status).toBe(0);
    expect(JSON.parse(answer.stdout).kind).toBe("path");
  }, 60_000);
});
