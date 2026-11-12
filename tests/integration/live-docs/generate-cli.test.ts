/**
 * The generate CLI over a workspace given by `--workspace`: it reads that
 * workspace's own `.live-docs.config.json` when no `--config` is given, as
 * inspect does, and the file given when one is. Until 2026-10-17 it read
 * neither and wrote the shipped default root, which the history probe of
 * 2026-10-16 found.
 *
 * Beside it, since 2026-11-12, what a newcomer meets first at every command's
 * edge: help on `--help`, and a refused argument said on one line with where the
 * options are listed, after a first visit found the Explorer's builder dying on
 * `--help` with a stack trace; another folder mapped end to end, docs and then
 * the Explorer, by `--workspace`; and the board a configuration names, which the
 * Explorer's build and the board command read when none is given.
 *
 * Every command here is a process of its own through tsx, a second or more
 * each, so all of them start together in `beforeAll`, eight at a time, and each
 * case reads what its own run printed: one after another they took about two
 * minutes (2026-11-12).
 */
import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const scripts = path.join(repoRoot, "scripts", "live-docs");
const workspaces: string[] = [];

/** How many commands run at once. */
const WIDTH = 8;

/** What a command printed, and how it ended. */
interface Run {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Every script a `live-docs:*` npm script runs, by that npm script's name. */
const commands: Array<[string, string]> = [
  ["live-docs:generate", "generate.ts"],
  ["live-docs:lint", "lint.ts"],
  ["live-docs:inspect", "inspect.ts"],
  ["live-docs:history", "history.ts"],
  ["live-docs:board", "board.ts"],
  ["live-docs:visualize", "visualize-static.ts"],
  ["live-docs:visualize:estate", "visualize-sample.ts"],
  ["live-docs:visualize:history-sample", "visualize-history-sample.ts"],
  ["live-docs:orphans", "find-orphans.ts"]
];

/** The smallest board the grammar accepts: one thing, from the workspace's `src`. */
const BOARD = "# Sample board\n\n## Metadata\n- Layer: 3\n\n## Authored\n### Purpose\nA board.\n\n### Notes\nNone.\n\n## Declared\n\n### Things\n\n#### `app`\n- Kind: web\n- From: `src`\n\n### Connections\n_No connections declared_\n";

const MDMD = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

/** The workspaces the cases run in, made in `beforeAll`. */
const at = { own: "", given: "", mapped: "", boarded: "", unboarded: "" };

/** Each case's run, by the case's name. */
const runs = new Map<string, Run>();

function ran(name: string): Run {
  const result = runs.get(name);
  if (!result) throw new Error(`no run named ${name}`);
  return result;
}

beforeAll(async () => {
  at.own = makeWorkspace(MDMD);
  at.given = makeWorkspace(MDMD);
  fs.writeFileSync(path.join(at.given, "other.json"), JSON.stringify({ root: "docs", baseLayer: "mirror" }), "utf8");
  at.mapped = makeWorkspace(MDMD);
  at.boarded = makeWorkspace({ board: "board.md" });
  fs.writeFileSync(path.join(at.boarded, "board.md"), BOARD, "utf8");
  at.unboarded = makeWorkspace({});

  const record = (name: string, script: string, args: string[]) => async (): Promise<Run> => {
    const result = await run(script, args);
    runs.set(name, result);
    return result;
  };
  // The longest first, so that the short ones fill in around them.
  const jobs: Array<() => Promise<unknown>> = [
    async () => {
      if ((await record("mapped generate", "generate.ts", ["--workspace", at.mapped])()).status === 0) {
        await record("mapped visualize", "visualize-static.ts", ["--workspace", at.mapped, "--output", path.join(at.mapped, "explorer")])();
      }
    },
    record("boarded visualize", "visualize-static.ts", ["--workspace", at.boarded, "--output", path.join(at.boarded, "explorer")]),
    record("generate own", "generate.ts", ["--workspace", at.own]),
    record("generate given", "generate.ts", ["--workspace", at.given, "--config", path.join(at.given, "other.json")]),
    record("boarded board", "board.ts", ["--workspace", at.boarded]),
    record("unboarded board", "board.ts", ["--workspace", at.unboarded]),
    record("visualize --output", "visualize-static.ts", ["--output"]),
    ...commands.flatMap(([, script]) => ["--help", "-h", "--no-such-option"].map((flag) => record(`${script} ${flag}`, script, [flag])))
  ];
  await inPool(jobs, WIDTH);
}, 600_000);

afterAll(() => {
  for (const workspace of workspaces.splice(0)) {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

describe("live-docs:generate --workspace", () => {
  it("reads the workspace's own configuration when none is given", () => {
    const result = ran("generate own");
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(at.own, ".mdmd", "layer-4", "src", "a.ts.mdmd.md"))).toBe(true);
    expect(fs.existsSync(path.join(at.own, ".live-documentation"))).toBe(false);
  });

  it("reads the configuration given over the workspace's own", () => {
    const result = ran("generate given");
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(at.given, "docs", "mirror", "src", "a.ts.md"))).toBe(true);
    expect(fs.existsSync(path.join(at.given, ".mdmd"))).toBe(false);
  });
});

describe("every live-docs command's edge", () => {
  it.each(commands)("%s prints its usage on --help and on -h, and exits 0", (name, script) => {
    for (const flag of ["--help", "-h"]) {
      const result = ran(`${script} ${flag}`);
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toMatch(new RegExp(`^Usage: npm run ${name} -- `, "u"));
      expect(result.stderr).toBe("");
    }
  });

  it.each(commands)("%s refuses an unknown option on one line, with where the options are listed and no stack", (name, script) => {
    const result = ran(`${script} --no-such-option`);
    expect(result.status).toBe(1);
    expect(result.stderr).toBe(`${name}: --no-such-option is not an option. Run "npm run ${name} -- --help" to list the options.\n`);
  });

  it("refuses an option whose value is missing, naming the option", () => {
    const result = ran("visualize --output");
    expect(result.status).toBe(1);
    expect(result.stderr).toBe(`live-docs:visualize: --output takes a value. Run "npm run live-docs:visualize -- --help" to list the options.\n`);
  });
});

describe("another folder, mapped end to end", () => {
  it("generates its docs and builds its Explorer by --workspace, each reading that folder's own configuration", () => {
    expect(ran("mapped generate").status).toBe(0);
    const built = ran("mapped visualize");
    expect(built.status, built.stderr).toBe(0);
    const output = path.join(at.mapped, "explorer");
    const data = JSON.parse(fs.readFileSync(path.join(output, "explorer-data.json"), "utf8")) as { graph: { files: Record<string, unknown> }; board?: unknown };
    expect(Object.keys(data.graph.files).sort()).toEqual([".live-docs.config.json", "src/a.ts"]);
    // A configuration that names no board builds without one.
    expect(data.board).toBeUndefined();
    // The build ends by saying how to serve what it wrote, to this machine alone, since a page opened as a file cannot
    // load its data.
    expect(built.stdout).toContain(`npx http-server ${output} -a 127.0.0.1 -p 8766 -c-1`);
  });
});

describe("the board a configuration names", () => {
  it("is the board the Explorer's build carries when none is given", () => {
    const built = ran("boarded visualize");
    expect(built.status, built.stderr).toBe(0);
    const data = JSON.parse(fs.readFileSync(path.join(at.boarded, "explorer", "explorer-data.json"), "utf8")) as { board?: { path: string; text: string } };
    expect(data.board).toEqual({ path: "board.md", text: BOARD });
  });

  it("is the board the board command reads when none is named, and without one the command asks for it on one line", () => {
    const read = ran("boarded board");
    expect(read.status, read.stderr).toBe(0);
    expect(read.stdout.startsWith("Sample board (board.md)\n")).toBe(true);
    const refused = ran("unboarded board");
    expect(refused.status).toBe(1);
    expect(refused.stderr).toBe(`live-docs:board: Name the board file to read; the configuration names none as "board". Run "npm run live-docs:board -- --help" to list the options.\n`);
  });
});

function makeWorkspace(config: Record<string, string>): string {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "generate-cli-"));
  workspaces.push(workspace);
  fs.mkdirSync(path.join(workspace, "src"));
  fs.writeFileSync(path.join(workspace, "src", "a.ts"), "export const a = 1;\n", "utf8");
  fs.writeFileSync(path.join(workspace, ".live-docs.config.json"), JSON.stringify(config), "utf8");
  return workspace;
}

/** Runs one of the scripts through tsx as the npm scripts do, without waiting on any other. */
function run(script: string, args: string[]): Promise<Run> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.resolve(scripts, script), ...args],
      { encoding: "utf8", maxBuffer: 1 << 26 },
      (error, stdout, stderr) => {
        const status = error === null ? 0 : typeof error.code === "number" ? error.code : null;
        resolve({ status, stdout, stderr });
      }
    );
  });
}

/** Runs the jobs at most `width` at a time, in their order. */
async function inPool(jobs: Array<() => Promise<unknown>>, width: number): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(width, jobs.length) }, async () => {
    while (next < jobs.length) {
      const job = jobs[next];
      next += 1;
      await job();
    }
  }));
}
