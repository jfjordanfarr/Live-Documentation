/**
 * What the command line denies when one end of a path holds the other and no path is found, found by the engine
 * review's fourth pass, 2026-11-22. Since the day's rule of nested ends (`endsApart`), the outer end is walked without
 * the inner one, and the answer says so once ("src/ taken without src/lone/"). The sentences that deny a path are
 * written from the ends as asked, though: `--direction both` prints `No file of src/lone/ uses a file of src/` and `No
 * file of src/ uses a file of src/lone/`, and `--direction outbound` prints `No path runs from src/ to src/lone/
 * (outbound), nor the other way.` with no word of the narrowing. Here `src/lone/w.ts` uses `src/lone/z.ts`, a file of
 * both ends, so each sentence is false as written. Two mends of the day meet here: the sentence of the search both
 * ways, mended in the review's second pass, and the rule of nested ends.
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

function inspect(args: string[]): { status: number; output: string; stdout: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", "inspect.ts"), "--workspace", workspace, ...args],
    { cwd: workspace, encoding: "utf8" });
  return { status: result.status ?? 0, output: `${result.stdout}${result.stderr}`, stdout: result.stdout };
}

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "narrowed-denials-"));
  const files: Record<string, string> = {
    "package.json": '{ "name": "narrowed-denials", "private": true }\n',
    "src/a.ts": "export const a = 1;\n",
    "src/lone/z.ts": "export const z = 1;\n",
    "src/lone/w.ts": 'import { z } from "./z";\nexport const w = z;\n'
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

describe("a denial between nested ends", () => {
  it("is not written from the ends as asked when a file of both ends uses another", () => {
    // The fact each sentence denies, by the command line's own neighbours of a file.
    const fact = inspect(["--from", "src/lone/w.ts", "--direction", "outbound", "--json"]);
    const uses = (JSON.parse(fact.stdout) as { neighbours: Array<{ files: Array<{ codePath: string }> }> }).neighbours[0].files.map((file) => file.codePath);
    expect(uses).toEqual(["src/lone/z.ts"]);

    const both = inspect(["--from", "src/lone", "--to", "src", "--direction", "both"]);
    expect(both.output).toContain("No path runs either way.");
    // Seen 2026-11-22: both sentences, each false as written.
    expect(both.output).not.toContain("No file of src/lone/ uses a file of src/,");
    expect(both.output).not.toContain("No file of src/ uses a file of src/lone/,");

    const outbound = inspect(["--from", "src", "--to", "src/lone", "--direction", "outbound"]);
    expect(outbound.status).toBe(1);
    // Seen 2026-11-22: `No path runs from src/ to src/lone/ (outbound), nor the other way.`, with no word of the narrowing.
    expect(outbound.output).toContain("without src/lone/");
  }, 120_000);
});
