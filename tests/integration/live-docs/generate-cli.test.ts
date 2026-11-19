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
 * Since 2026-11-19, the folder a person runs a command from: a relative
 * `--workspace` and `--config` are taken from it, and it is the workspace when
 * none is named, though npm runs the script in this checkout, which the cold run
 * of that day found every `--help` calling the current directory.
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

/** The workspaces the cases run in, made in `beforeAll`; `stand` is a folder a person stands in, holding two repositories, `mine` and `theirs`, and a configuration beside them. */
const at = { own: "", given: "", mapped: "", boarded: "", unboarded: "", stand: "", unread: "", broken: "" };

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
  at.stand = makeWorkspace({});
  for (const repository of ["mine", "theirs"]) {
    fs.cpSync(path.join(at.stand, "src"), path.join(at.stand, repository, "src"), { recursive: true });
  }
  fs.writeFileSync(path.join(at.stand, "standing.json"), JSON.stringify({ root: "docs", baseLayer: "mirror" }), "utf8");
  // Kinds of file no reader reads, as a .NET Framework repository holds them, in any case, beside a picture, which has nothing to read.
  at.unread = makeWorkspace({});
  for (const name of ["Shop.sln", "src/Legacy.vb", "src/Old.VB", "Database/Install.SqlDataProvider", "logo.png"]) {
    fs.mkdirSync(path.dirname(path.join(at.unread, name)), { recursive: true });
    fs.writeFileSync(path.join(at.unread, name), "x\n", "utf8");
  }
  // A configuration cut short, the failure every command meets first.
  at.broken = makeWorkspace({});
  fs.writeFileSync(path.join(at.broken, ".live-docs.config.json"), "{ \"root\": ", "utf8");

  const record = (name: string, script: string, args: string[]) => async (): Promise<Run> => {
    const result = await run(script, args);
    runs.set(name, result);
    return result;
  };
  const recordNpm = (name: string, cwd: string, script: string, args: string[]) => async (): Promise<Run> => {
    const result = await runNpm(cwd, script, args);
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
    // The configuration is named first, so that a run that took the paths from this checkout would stop before writing.
    recordNpm("npm from elsewhere", at.stand, "live-docs:generate", ["--config", "standing.json", "--workspace", "mine"]),
    record("generate, unread kinds", "generate.ts", ["--workspace", at.unread, "--dry-run"]),
    record("lint, failing", "lint.ts", ["--workspace", at.broken]),
    record("lint, failing, with the stack", "lint.ts", ["--workspace", at.broken, "--stack"]),
    record("generate, mistyped", "generate.ts", ["--workspace", path.join(at.stand, "mien")]),
    record("inspect, mistyped", "inspect.ts", ["--workspace", path.join(at.stand, "mien"), "--reachable"]),
    record("generate, a file", "generate.ts", ["--workspace", path.join(at.stand, "standing.json")]),
    recordNpm("npm from elsewhere, no workspace", path.join(at.stand, "theirs"), "live-docs:generate", ["--config", path.join("..", "standing.json"), "--dry-run"]),
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

describe("the folder a person runs a command from", () => {
  it("is where a relative --workspace and --config are taken from, though npm runs the script in this checkout", () => {
    const result = ran("npm from elsewhere");
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(at.stand, "mine", "docs", "mirror", "src", "a.ts.md"))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, "mine"))).toBe(false);
  });

  it("is the workspace when none is named", () => {
    const result = ran("npm from elsewhere, no workspace");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Would create 1 Live Doc(s): docs/mirror/src/a.ts.md");
  });
});

describe("a command that fails", () => {
  it("says why on one line and how to see where, and with --stack prints the stack of the failure and of its cause", () => {
    const configuration = path.join(at.broken, ".live-docs.config.json");
    const plain = ran("lint, failing");
    expect(plain.status).toBe(1);
    expect(plain.stderr).toMatch(new RegExp(`^live-docs:lint failed: cannot read the configuration at ${configuration.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}: .+\nTo see where it failed, run the command again with --stack\\.\n$`, "u"));
    const traced = ran("lint, failing, with the stack");
    expect(traced.status).toBe(1);
    expect(traced.stderr).toContain(`live-docs:lint failed: Error: cannot read the configuration at ${configuration}`);
    expect(traced.stderr).toMatch(/\n {4}at .*cli\.ts:\d+/u);
    expect(traced.stderr).toContain("\nCaused by: SyntaxError: ");
  });
});

describe("the kinds of file no reader reads", () => {
  it("are named at the end of generation with their counts, a picture not among them", () => {
    const result = ran("generate, unread kinds");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("[live-docs] Not read, so their docs hold no symbols or links: 2 .vb, 1 .sln, 1 .SqlDataProvider.\n");
  });

  it("are not mentioned when every file has a reader", () => {
    const result = ran("generate own");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).not.toContain("Not read");
  });
});

describe("a --workspace that names no folder", () => {
  it("is refused on one line naming the path looked for, and nothing is made there", () => {
    const mistyped = path.join(at.stand, "mien");
    for (const [name, command] of [["generate, mistyped", "live-docs:generate"], ["inspect, mistyped", "live-docs:inspect"]]) {
      const result = ran(name);
      expect(result.status).toBe(1);
      expect(result.stderr).toBe(`${command}: There is no folder at ${mistyped}; --workspace names the folder to work on. Run "npm run ${command} -- --help" to list the options.\n`);
    }
    expect(fs.existsSync(mistyped)).toBe(false);
  });

  it("is refused when it names a file", () => {
    const result = ran("generate, a file");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`${path.join(at.stand, "standing.json")} is a file; --workspace names the folder to work on.`);
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

/** Runs one of this checkout's npm scripts from another folder, as a person standing in their own repository would: `npm --prefix <checkout> run <script> -- <args>`. */
function runNpm(cwd: string, script: string, args: string[]): Promise<Run> {
  return new Promise((resolve) => {
    execFile(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["--prefix", repoRoot, "run", "--silent", script, "--", ...args],
      { cwd, encoding: "utf8", maxBuffer: 1 << 26, shell: process.platform === "win32" },
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
