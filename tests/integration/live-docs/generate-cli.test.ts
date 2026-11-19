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
 * `--workspace` and `--config` are taken from it, though npm runs the script in
 * this checkout, which the cold run of that day found every `--help` calling
 * the current directory; and when none is named, the workspace is the nearest
 * folder at or above it that holds a configuration, else the folder itself.
 *
 * Every command here is a process of its own through tsx, a second or more
 * each, so all of them start together in `beforeAll`, eight at a time, and each
 * case reads what its own run printed: one after another they took about two
 * minutes (2026-11-12).
 */
import { execFile, execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseLiveDoc, renderLiveDoc } from "../../../packages/engine/src/live-docs/document";

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

/**
 * The workspaces the cases run in, made in `beforeAll`. `stand` is a folder a person stands in, holding a repository
 * `mine` and a configuration beside it; `other` is another repository with a configuration of its own and a folder
 * `src/deep` inside it; `bare` has no configuration, nor has any folder above it, and holds a folder `sub`.
 */
const at = { own: "", given: "", mapped: "", boarded: "", unboarded: "", stand: "", other: "", bare: "", unread: "", broken: "", repository: "", noGit: "", orphans: "" };

/**
 * The code paths of the orphans workspace's docs, each written by the engine's own writer: an ordinary file, a file
 * whose name begins with a quotation mark, which a writer may write in a quoted form, both present, and one gone.
 * Linux and macOS allow the quotation mark in a name; Windows does not, so the case is skipped there.
 */
const QUOTED = "\"quoted.ts";
const ORPHAN_SOURCES = ["src/a.ts", ...(process.platform === "win32" ? [] : [QUOTED])];

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
  fs.cpSync(path.join(at.stand, "src"), path.join(at.stand, "mine", "src"), { recursive: true });
  fs.writeFileSync(path.join(at.stand, "standing.json"), JSON.stringify({ root: "docs", baseLayer: "mirror" }), "utf8");
  at.other = makeWorkspace({ root: "docs", baseLayer: "mirror" });
  fs.mkdirSync(path.join(at.other, "src", "deep"));
  fs.writeFileSync(path.join(at.other, "src", "deep", "b.ts"), "export const b = 2;\n", "utf8");
  at.bare = fs.mkdtempSync(path.join(os.tmpdir(), "generate-cli-bare-"));
  workspaces.push(at.bare);
  fs.mkdirSync(path.join(at.bare, "sub"));
  fs.writeFileSync(path.join(at.bare, "top.ts"), "export const top = 0;\n", "utf8");
  fs.writeFileSync(path.join(at.bare, "sub", "c.ts"), "export const c = 3;\n", "utf8");
  // Kinds of file no reader reads, as a .NET Framework repository holds them, in any case, beside a picture, which has nothing to read.
  at.unread = makeWorkspace({});
  for (const name of ["Shop.sln", "src/Legacy.vb", "src/Old.VB", "Database/Install.SqlDataProvider", "logo.png"]) {
    fs.mkdirSync(path.dirname(path.join(at.unread, name)), { recursive: true });
    fs.writeFileSync(path.join(at.unread, name), "x\n", "utf8");
  }
  at.orphans = makeWorkspace({});
  for (const codePath of [...ORPHAN_SOURCES, "src/gone.ts"]) {
    if (codePath !== "src/a.ts" && codePath !== "src/gone.ts") {
      fs.writeFileSync(path.join(at.orphans, codePath), "export const q = 1;\n", "utf8");
    }
    const doc = path.join(at.orphans, ".live-documentation", "source", `${codePath}.md`);
    fs.mkdirSync(path.dirname(doc), { recursive: true });
    fs.writeFileSync(doc, renderLiveDoc({ codePath, layer: 4, archetype: "implementation", entries: [], authored: "### Purpose\nA file.\n\n### Notes\nNone.", symbols: [], dependencies: [] }), "utf8");
  }
  // A configuration cut short, the failure every command meets first.
  at.broken = makeWorkspace({});
  fs.writeFileSync(path.join(at.broken, ".live-docs.config.json"), "{ \"root\": ", "utf8");
  // A repository whose build output a nested ignore file hides, and a folder on the path that holds node and no git, as on
  // a machine where git is not installed or not on the path.
  at.repository = makeWorkspace({});
  execFileSync("git", ["init", "-q"], { cwd: at.repository });
  fs.writeFileSync(path.join(at.repository, "src", ".gitignore"), "bin/\n", "utf8");
  fs.mkdirSync(path.join(at.repository, "src", "bin"));
  fs.writeFileSync(path.join(at.repository, "src", "bin", "App.dll.config"), "<configuration />\n", "utf8");
  at.noGit = fs.mkdtempSync(path.join(os.tmpdir(), "generate-cli-no-git-"));
  workspaces.push(at.noGit);
  fs.symlinkSync(process.execPath, path.join(at.noGit, path.basename(process.execPath)));

  const record = (name: string, script: string, args: string[], env: Record<string, string> = {}) => async (): Promise<Run> => {
    const result = await run(script, args, env);
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
    record("orphans", "find-orphans.ts", ["--workspace", at.orphans]),
    record("generate, a repository", "generate.ts", ["--workspace", at.repository, "--dry-run"]),
    record("generate, a repository without git", "generate.ts", ["--workspace", at.repository, "--dry-run"], { PATH: at.noGit }),
    record("lint, failing", "lint.ts", ["--workspace", at.broken]),
    record("lint, failing, with the stack", "lint.ts", ["--workspace", at.broken, "--stack"]),
    record("generate, mistyped", "generate.ts", ["--workspace", path.join(at.stand, "mien")]),
    record("inspect, mistyped", "inspect.ts", ["--workspace", path.join(at.stand, "mien"), "--reachable"]),
    record("generate, a file", "generate.ts", ["--workspace", path.join(at.stand, "standing.json")]),
    // With no --workspace: this checkout from its root and from a folder in it, read from its committed docs; another
    // repository from its root and from a folder in it; and a folder with no configuration above it.
    recordNpm("npm in the checkout", repoRoot, "live-docs:inspect", ["--from", "scripts/live-docs/cli.ts", "--direction", "inbound"]),
    recordNpm("npm in a folder of the checkout", path.join(repoRoot, "scripts"), "live-docs:inspect", ["--from", "scripts/live-docs/cli.ts", "--direction", "inbound"]),
    recordNpm("npm in another repository", at.other, "live-docs:generate", ["--dry-run"]),
    recordNpm("npm in a folder of another repository", path.join(at.other, "src", "deep"), "live-docs:generate", ["--dry-run"]),
    recordNpm("npm in a folder with no configuration above", path.join(at.bare, "sub"), "live-docs:generate", ["--dry-run"]),
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

  it("is in the workspace, when none is named, that the nearest configuration at or above it names: this checkout from its root or from scripts/", () => {
    for (const name of ["npm in the checkout", "npm in a folder of the checkout"]) {
      const result = ran(name);
      expect(result.status, `${name}: ${result.stderr}`).toBe(0);
      expect(result.stdout, name).toMatch(/^Terminal inbound paths from scripts\/live-docs\/cli\.ts /u);
    }
  });

  it("is in the workspace that the nearest configuration names: another repository from its root or from a folder in it", () => {
    for (const name of ["npm in another repository", "npm in a folder of another repository"]) {
      const result = ran(name);
      expect(result.status, `${name}: ${result.stderr}`).toBe(0);
      expect(result.stdout, name).toContain("Base layer processed 3 file(s) (dry-run)");
      expect(result.stdout, name).toContain("docs/mirror/src/deep/b.ts.md");
    }
    expect(ran("npm in another repository").stdout).not.toContain("the nearest folder above");
    expect(ran("npm in a folder of another repository").stdout).toContain(`[live-docs] Mapping ${at.other}, the nearest folder above ${path.join(at.other, "src", "deep")} that holds a .live-docs.config.json.`);
  });

  it("is the workspace itself when no folder at or above it holds a configuration", () => {
    const result = ran("npm in a folder with no configuration above");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Base layer processed 1 file(s) (dry-run)");
    expect(result.stdout).toContain("Would create 1 Live Doc(s): .live-documentation/source/c.ts.md");
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

describe("what git ignores", () => {
  it("is asked of git in a repository, which leaves the build output a nested ignore file names out", () => {
    const result = ran("generate, a repository");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).not.toContain("bin/App.dll.config");
    expect(`${result.stdout}${result.stderr}`).not.toContain(".gitignore is read");
  });

  it("is said to be read from the workspace's .gitignore alone when git cannot be asked, and what that lets in", () => {
    const result = ran("generate, a repository without git");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("src/bin/App.dll.config");
    expect(result.stderr).toContain(`[live-docs] git could not be asked what it ignores in ${at.repository}`);
    expect(result.stderr).toContain(`only ${path.join(at.repository, ".gitignore")} is read`);
  });

  it("is said to be read from the workspace's .gitignore alone outside a repository", () => {
    const result = ran("generate, unread kinds");
    expect(result.stdout).toContain(`[live-docs] Not in a git repository, so of what to leave out only ${path.join(at.unread, ".gitignore")} and the configuration's exclude are read.`);
  });
});

describe("live-docs:orphans", () => {
  it("reads each doc's source as the doc grammar's reader reads it, and lists only the doc whose source is gone", () => {
    // The reader's answer for each doc, whichever form the writer gave its code path, is what the command must check.
    for (const codePath of ORPHAN_SOURCES) {
      const text = fs.readFileSync(path.join(at.orphans, ".live-documentation", "source", `${codePath}.md`), "utf8");
      expect(parseLiveDoc(text).codePath).toBe(codePath);
    }
    const result = ran("orphans");
    expect(result.status).toBe(1);
    expect(result.stderr).toBe("Found 1 orphan live documentation file(s):\n - .live-documentation/source/src/gone.ts.md (expected code path: src/gone.ts)\n");
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

/** Runs one of the scripts through tsx as the npm scripts do, without waiting on any other, with any variables given set over this process's. */
function run(script: string, args: string[], env: Record<string, string> = {}): Promise<Run> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.resolve(scripts, script), ...args],
      { encoding: "utf8", maxBuffer: 1 << 26, env: { ...process.env, ...env } },
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
