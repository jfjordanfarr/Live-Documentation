import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isBuiltin } from "node:module";
import { devNull, tmpdir } from "node:os";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";

import { checkoutOf, HISTORY_FOLDERS, installationDifference, keyedLockEntries, keysTheLens, LOCK_ROOTS, lockIdentity, SUMMARY_ENTRIES, SUMMARY_MODULES } from "./generatorIdentity";
import { summarizingEnvironment, summarizingFlags } from "./regenerate";
import { treeOptions } from "./summarizeChange";

const repository = path.resolve(__dirname, "..", "..", "..", "..");

/** The repository-relative path of a file a source file imports, of any kind, when it is one of this repository's files. */
function resolveImport(from: string, specifier: string): string | undefined {
  let base: string;
  if (specifier.startsWith(".")) {
    base = path.posix.join(path.posix.dirname(from), specifier);
  } else {
    const aliased = /^@live-documentation\/(engine|generator|explorer)\/(.+)$/u.exec(specifier);
    if (!aliased) return undefined;
    base = `packages/${aliased[1]}/src/${aliased[2]}`;
  }
  for (const candidate of [`${base}.ts`, `${base}/index.ts`, base]) {
    try {
      readFileSync(path.join(repository, candidate));
      return candidate;
    } catch {
      // Not this one.
    }
  }
  throw new Error(`${from} imports ${specifier}, which resolves to no file`);
}

/** What a source file imports that leaves something at run time, and the imports it makes that cannot be followed. */
interface Imports {
  specifiers: string[];
  /** Each `import()` or `require()` whose argument is not a string literal, by the text of its call. */
  unfollowed: string[];
}

/**
 * The modules a source file imports that leave something at run time, read by the TypeScript parser: an `import type`,
 * an `export type` or an import whose every name is a type leaves nothing, and is elided. `import x = require()` is
 * read as the `require` it compiles to; a dynamic import or a `require` of a computed name cannot be followed and is
 * named.
 */
function runtimeImports(file: string, text = readFileSync(path.join(repository, file), "utf8")): Imports {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const imports: Imports = { specifiers: [], unfollowed: [] };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const elided =
        clause !== undefined &&
        (clause.isTypeOnly ||
          (clause.name === undefined && clause.namedBindings !== undefined && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every((element) => element.isTypeOnly)));
      if (!elided) imports.specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly && ts.isExternalModuleReference(node.moduleReference)) {
      const expression = node.moduleReference.expression;
      if (ts.isStringLiteral(expression)) imports.specifiers.push(expression.text);
      else imports.unfollowed.push(node.getText(source));
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier) && !node.isTypeOnly) {
      imports.specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const [argument] = node.arguments;
      if (argument !== undefined && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))) imports.specifiers.push(argument.text);
      else imports.unfollowed.push(node.getText(source));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return imports;
}

/** Every file of this repository a source file reaches at run time, itself included, and the imports met that cannot be followed. */
function runtimeClosure(entries: readonly string[]): { reached: Set<string>; unfollowed: string[] } {
  const reached = new Set<string>();
  const unfollowed: string[] = [];
  const pending = [...entries];
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (reached.has(file)) continue;
    reached.add(file);
    // A JSON file or any other that is not TypeScript is reached, keyed or not, and imports nothing of its own.
    if (!file.endsWith(".ts")) continue;
    const imports = runtimeImports(file);
    unfollowed.push(...imports.unfollowed.map((call) => `${file}: ${call}`));
    for (const specifier of imports.specifiers) {
      const resolved = resolveImport(file, specifier);
      if (resolved !== undefined) pending.push(resolved);
    }
  }
  return { reached, unfollowed };
}

/** The TypeScript modules of the history folders, tests aside. */
function historyModules(): string[] {
  return HISTORY_FOLDERS.flatMap((folder) =>
    readdirSync(path.join(repository, folder))
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .map((name) => `${folder}${name}`)
  );
}

/**
 * Whether a module does something on a summary's behalf that its imports into the summarizing process cannot show: it
 * starts a process, which is how the summarizing process is started and given its task and environment, or it
 * implements the version control, which writes the commit's tree the process reads.
 */
function actsForASummary(text: string): boolean {
  return (
    /["'](?:node:)?(?:child_process|worker_threads)["']/u.test(text) ||
    /(?<![.\w$])(?:execFileAsync|execFile|execFileSync|spawn|spawnSync|fork|exec|execSync)\s*\(/u.test(text) ||
    /\bimplements\s+VersionControl\b/u.test(text)
  );
}

/**
 * The modules of the history folders that start processes for another reason than a summary, each with why it is not
 * keyed: a module joins this list only by a reviewed reason.
 */
const ACTING_UNKEYED: Record<string, string> = {
  "packages/generator/src/history/generatorIdentity.ts": "computes the key itself; its git calls read this tool's checkout, never a commit's tree",
  // Since 2026-11-20, in place of writing the head's whole tree for the check.
  "packages/generator/src/history/headCheck.ts":
    "reads the Live Docs committed at the head from git's object store for the check at the head, after every summary is made; nothing it reads reaches a summary"
};

/** The names of an interface's members, read by the TypeScript parser. */
function membersOf(file: string, name: string): string[] {
  const source = ts.createSourceFile(file, readFileSync(path.join(repository, file), "utf8"), ts.ScriptTarget.Latest, true);
  const found = source.statements.find((statement): statement is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(statement) && statement.name.text === name);
  if (found === undefined) throw new Error(`${file} declares no interface ${name}`);
  return found.members.map((member) => (member.name && ts.isIdentifier(member.name) ? member.name.text : member.getText(source)));
}

/**
 * What the command, which is not keyed, hands to the keyed code that makes a summary, each with why it cannot change
 * what a summary says unkeyed: a new member fails the guard until it is shown not to reach a summary, or joins the key.
 */
const HANDED_TO_REGENERATION: Record<string, string> = {
  // Since 2026-11-20, when the workers began to write their own trees, in place of the command's version control.
  store: "the git directory of the repository whose changes are summarized, each named by its id, which each worker hands every call of the keyed tree writer by GIT_DIR",
  configuration: "the lens's configuration, which is half of the key itself",
  lens: "the key itself, written into each summary",
  cacheFolder: "where summaries and texts are written, never what they say",
  keepIndex: "whether the full index is kept beside a summary, which the summary does not name",
  jobs: "how many commits are regenerated at once",
  // Since the review's fourth round, 2026-11-20.
  memory: "when a worker is replaced, after which its next commit's tree is written anew, the same tree as one brought forward (history-tree-forward.test.ts)",
  startWorker: "a test's stand-in for the pool's own keyed starter; the command hands none",
  deadline: "when to start no further commit",
  scratch: "where the trees are written and what a signal removes; summaries name workspace-relative paths only",
  progress: "where progress lines go"
};

/** What the keyed command side hands the summarizing process, each with what decides it. */
const HANDED_TO_SUMMARY: Record<string, string> = {
  tree: "the commit's tree, written by the keyed version control",
  configuration: "the configuration a summary is made under (`summarizedConfiguration`), which the key holds whole",
  lens: "the key",
  commit: "the commit summarized",
  summaryPath: "where the summary goes",
  textStore: "where the texts go",
  indexPath: "where the full index goes, when kept",
  // A limit, written down in the decision: what a disk cannot hold depends on the disk, which the key does not hold.
  unwritten: "the entries the keyed tree writer left out, as the disk it wrote to answered"
};

describe("the lens's key", () => {
  // Read once: parsing the closure's hundred-odd modules takes seconds on a loaded machine.
  let summaries: ReturnType<typeof runtimeClosure> | undefined;
  const summaryClosure = (): ReturnType<typeof runtimeClosure> => (summaries ??= runtimeClosure(SUMMARY_ENTRIES));

  it("is made of every file the summarizing process runs, and every file the command runs on its behalf", () => {
    const { reached } = summaryClosure();
    expect(reached.size).toBeGreaterThan(20);
    const unkeyed = [...reached].filter((file) => !keysTheLens(file));
    // A file the summaries depend on and the key leaves out would let the cache serve a summary another generator made.
    expect(unkeyed).toEqual([]);
    const reachedHistory = [...reached].filter((file) => HISTORY_FOLDERS.some((folder) => file.startsWith(folder)));
    expect(reachedHistory.filter((file) => !SUMMARY_MODULES.includes(file))).toEqual([]);
  });

  it("keys every module of the history folders that starts a process or writes a commit's tree, which no import shows", () => {
    const acting = historyModules().filter((file) => actsForASummary(readFileSync(path.join(repository, file), "utf8")));
    expect(acting.sort()).toEqual([
      "packages/engine/src/live-docs/history/git.ts",
      "packages/generator/src/history/generatorIdentity.ts",
      "packages/generator/src/history/headCheck.ts",
      "packages/generator/src/history/regenerate.ts",
      // Since 2026-11-19 it asks the tree's own listing which linked documents stand.
      "packages/generator/src/history/summarizeChange.ts"
    ]);
    expect(acting.filter((file) => !keysTheLens(file) && ACTING_UNKEYED[file] === undefined)).toEqual([]);
    // Every summary module is reached by import from the summarizing process or the command's side of it, or acts so.
    expect(SUMMARY_MODULES.filter((file) => !summaryClosure().reached.has(file) && !acting.includes(file))).toEqual([]);
  });

  it("would have found the command's tree and environment outside the key, as they stood before this rule", () => {
    // As `computeHistory.ts` read until 2026-11-19: it started the summarizing process with the tree's environment.
    expect(actsForASummary(`import { fork, type ChildProcess } from "node:child_process";\nconst child = fork(worker, [task], { env });`)).toBe(true);
    expect(actsForASummary(`class GitRepository implements VersionControl {}`)).toBe(true);
    expect(actsForASummary(`import type { VersionControl } from "./versionControl";`)).toBe(false);
    expect(keysTheLens("packages/generator/src/history/computeHistory.ts")).toBe(false);
    // A process started without importing `child_process` by name, through a dynamic import, a require or a helper.
    expect(actsForASummary(`const { fork } = await import("node:child_process");`)).toBe(true);
    expect(actsForASummary(`const cp = require("child_process");`)).toBe(true);
    expect(actsForASummary(`await execFileAsync("git", ["ls-tree", change], options);`)).toBe(true);
  });

  it("carries the heap limit a person sets through NODE_OPTIONS to the summarizing process, and nothing else of NODE_OPTIONS", () => {
    // How a person raises the heap through `npm run` (the review's second pass, finding 6).
    expect(summarizingEnvironment({ PATH: "/usr/bin", NODE_OPTIONS: "--max-old-space-size=8192" })).toEqual({ PATH: "/usr/bin", NODE_OPTIONS: "--max-old-space-size=8192" });
    expect(summarizingEnvironment({ NODE_OPTIONS: "--require evil.js --max_old_space_size=4096 --stack-size=9000" })).toEqual({ NODE_OPTIONS: "--max_old_space_size=4096" });
    expect(summarizingEnvironment({ NODE_OPTIONS: "--max-old-space-size 2048" })).toEqual({ NODE_OPTIONS: "--max-old-space-size=2048" });
    expect(summarizingEnvironment({ NODE_OPTIONS: "--max-old-space-size=1024 --max-old-space-size=3072" })).toEqual({ NODE_OPTIONS: "--max-old-space-size=3072" });
    expect(summarizingEnvironment({ NODE_OPTIONS: "--conditions=dev" })).toEqual({});
  });

  it("gives the summarizing process a named environment, and nothing else of the person's", () => {
    const given = summarizingEnvironment({ PATH: "/usr/bin", TMPDIR: "/tmp", TSX_TSCONFIG_PATH: "./tsconfig.base.json", NODE_OPTIONS: "--require evil.js", GIT_DIR: "/elsewhere", LANG: "tr_TR.UTF-8", HOME: "/home/ada" });
    expect(given).toEqual({ PATH: "/usr/bin", TMPDIR: "/tmp", TSX_TSCONFIG_PATH: "./tsconfig.base.json" });
    // A worker is started with that environment, never the command's whole one, and sets each tree's own only while it
    // summarizes in that tree (since 2026-11-20; `history-workers.test.ts` holds a worker's later changes to a fresh
    // process's summaries of them, which a stale index would change).
    const regenerate = readFileSync(path.join(repository, "packages/generator/src/history/regenerate.ts"), "utf8");
    expect(regenerate).toMatch(/fork\(worker, \["--worker", context\.store, folder\], \{[^}]*env: summarizingEnvironment\(process\.env\),/u);
    expect(regenerate).not.toMatch(/env:\s*(?:\{\s*\.\.\.process\.env|process\.env)/u);
    const worker = readFileSync(path.join(repository, "packages/generator/src/history/summarizeChange.ts"), "utf8");
    expect(worker).toMatch(/const \{ environment \} = tree;\s*Object\.assign\(process\.env, environment\);\s*try \{[^]*?await summarizeChange\([^]*?\} finally \{\s*for \(const name of Object\.keys\(environment\)\) delete process\.env\[name\];/u);
  });

  it("hands the summarizing process the configuration the key holds, made by one function", () => {
    const regenerate = readFileSync(path.join(repository, "packages/generator/src/history/regenerate.ts"), "utf8");
    expect(regenerate).toContain("configuration: summarizedConfiguration(context.configuration),");
    const worker = readFileSync(path.join(repository, "packages/generator/src/history/summarizeChange.ts"), "utf8");
    // The worker makes nothing of its own of the configuration it is handed.
    expect(worker).not.toMatch(/bundleExclude:\s*\[\]/u);
    const lens = readFileSync(path.join(repository, "packages/engine/src/live-docs/history/lens.ts"), "utf8");
    expect(lens).toContain("configuration: summarizedConfiguration(configuration)");
  });

  it("starts the summarizing process with node flags of its own, never the command's", () => {
    // `fork` passes the command's `process.execArgv` unless told otherwise (the fourth review of 2026-11-19).
    const regenerate = readFileSync(path.join(repository, "packages/generator/src/history/regenerate.ts"), "utf8");
    expect(regenerate).toMatch(/fork\(worker, \["--worker", context\.store, folder\], \{[^}]*execArgv: summarizingFlags\(worker\)/u);
    expect(summarizingFlags("/x/summarizeChange.js")).toEqual([]);
    const flags = summarizingFlags("/x/summarizeChange.ts");
    expect(flags).toHaveLength(2);
    expect(flags[0]).toBe("--import");
    expect(flags[1]).toMatch(/^file:\/\/.*\/tsx\//u);
  });

  it("passes the command's heap limit to the summarizing process, and no other flag of the command's", () => {
    const given = ["--conditions=dev", "--max-old-space-size=8192", "--stack-size=4000", "--require", "/x/preflight.cjs"];
    expect(summarizingFlags("/x/summarizeChange.js", given)).toEqual(["--max-old-space-size=8192"]);
    expect(summarizingFlags("/x/summarizeChange.js", ["--max-old-space-size", "4096"])).toEqual(["--max-old-space-size=4096"]);
    expect(summarizingFlags("/x/summarizeChange.js", ["--max-old-space-size=1024", "--max_old_space_size=2048"])).toEqual(["--max_old_space_size=2048"]);
    expect(summarizingFlags("/x/summarizeChange.js", ["--stack-size=4000"])).toEqual([]);
    expect(summarizingFlags("/x/summarizeChange.ts", ["--max-old-space-size=8192"]).slice(2)).toEqual(["--max-old-space-size=8192"]);
  });

  it("empties in a commit's tree only an excluded image, font or recording, outside the docs root, by discovery's reading of the root", () => {
    const options = treeOptions({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, root: "./docs/../site/", exclude: ["archive/**", "site/**", "**/*.png"] }, "/work/tree");
    const contentless = options.contentless!;
    expect(contentless("assets/logo.png")).toBe(true);
    expect(contentless("archive/2026/clip.webm")).toBe(true);
    // Any other excluded file is whole: a reader may open what another file names, a C include of a `.def` say.
    expect(contentless("archive/2026/day.record.md")).toBe(false);
    expect(contentless("archive/gen/table.def")).toBe(false);
    expect(contentless("archive/generated/api.ts")).toBe(false);
    expect(contentless("src/logo.svg")).toBe(false);
    // The generator reads and rewrites the docs root whatever `exclude` says; the root is read as discovery reads it.
    expect(options.docsRoot).toBe("site");
    expect(contentless("site/logo.png")).toBe(false);
    expect(treeOptions(DEFAULT_LIVE_DOCUMENTATION_CONFIG, "/work/tree").contentless!("anything/at/all.png")).toBe(false);
  });

  it("holds what the command hands to the code that makes a summary to members each shown not to change it unkeyed", () => {
    // A member added to either, an environment say, fails here until it is shown not to reach a summary or joins the key.
    expect(membersOf("packages/generator/src/history/regenerate.ts", "RegenerationContext").sort()).toEqual(Object.keys(HANDED_TO_REGENERATION).sort());
    expect(membersOf("packages/generator/src/history/summarizeChange.ts", "SummaryTask").sort()).toEqual(Object.keys(HANDED_TO_SUMMARY).sort());
    // The command calls the keyed side by that context alone.
    const command = readFileSync(path.join(repository, "packages/generator/src/history/computeHistory.ts"), "utf8");
    expect(command).not.toMatch(/\bfork\s*\(|\bspawn\s*\(|summarizeChange/u);
  });

  it("meets no import it cannot follow on the way", () => {
    // A computed `import()` or `require()` could load a file no rule names; none may stand where the summaries are decided.
    expect(summaryClosure().unfollowed).toEqual([]);
  });

  it("follows every way a module is loaded, and names what it cannot follow", () => {
    const imports = runtimeImports(
      "packages/engine/src/live-docs/history/probe.ts",
      [
        `import data from "./data.json";`,
        `import legacy = require("./legacy");`,
        `import type { T } from "./types";`,
        `const later = import("./later");`,
        `const name = "./computed";`,
        `const computed = require(name);`
      ].join("\n")
    );
    expect(imports.specifiers).toEqual(["./data.json", "./legacy", "./later"]);
    expect(imports.unfollowed).toEqual(["require(name)"]);
  });

  it("finds an import the summarizing process would make of a module the key leaves out", () => {
    // The check above must be able to fail: the sequence's codec, reached from the sequence, is a module the key leaves out.
    expect(keysTheLens("packages/engine/src/live-docs/history/codec.ts")).toBe(false);
    expect(runtimeClosure(["packages/engine/src/live-docs/history/sequence.ts"]).reached).toContain("packages/engine/src/live-docs/history/codec.ts");
  });

  it("leaves out the tests and the history modules that decide nothing of a summary, and keeps every other file of the two packages", () => {
    expect(keysTheLens("packages/engine/src/live-docs/graph.ts")).toBe(true);
    expect(keysTheLens("packages/engine/package.json")).toBe(true);
    expect(keysTheLens("packages/generator/src/generator.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/history/summary.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/history/git.ts")).toBe(true);
    expect(keysTheLens("packages/generator/src/history/summarizeChange.ts")).toBe(true);
    expect(keysTheLens("packages/generator/src/history/regenerate.ts")).toBe(true);
    // Data in a history folder, which a module may import or read at run time, is keyed whoever reads it.
    expect(keysTheLens("packages/engine/src/live-docs/history/table.json")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/graph.test.ts")).toBe(false);
    expect(keysTheLens("packages/engine/src/live-docs/history/queries.ts")).toBe(false);
    expect(keysTheLens("packages/generator/src/history/computeHistory.ts")).toBe(false);
    expect(keysTheLens("packages/generator/src/history/headCheck.ts")).toBe(false);
    expect(keysTheLens("packages/explorer/src/client/index.ts")).toBe(false);
  });
});

type LockPackages = Record<string, Record<string, unknown>>;

/** This repository's lock as committed at a commit. */
function committedLock(commit: string): string {
  return execFileSync("git", ["-C", repository, "show", `${commit}:package-lock.json`], { encoding: "utf8", maxBuffer: 1 << 28 });
}

/** The working lock with `change` made to its `packages` map, as text. */
function changedLock(change: (packages: LockPackages) => void): string {
  const lock = JSON.parse(readFileSync(path.join(repository, "package-lock.json"), "utf8")) as { packages: LockPackages };
  change(lock.packages);
  return JSON.stringify(lock, null, 2);
}

/** The package a bare specifier names: its scope and name, or its first segment. */
function packageOf(specifier: string): string {
  const segments = specifier.split("/");
  return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

/**
 * Each package the code of the two packages loads, tests aside, by an import or by `require.resolve`, that its own
 * manifest does not declare and `roots` does not name from its folder: a package found only because npm hoists it.
 */
function undeclaredImports(roots: ReadonlyArray<{ from: string; name: string }>): string[] {
  const found: string[] = [];
  for (const folder of ["packages/engine", "packages/generator"]) {
    const manifest = JSON.parse(readFileSync(path.join(repository, folder, "package.json"), "utf8")) as { name: string; dependencies?: Record<string, string>; optionalDependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
    const declared = new Set([manifest.name, ...Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies }), ...roots.filter((root) => root.from === folder).map((root) => root.name)]);
    const files = readdirSync(path.join(repository, folder, "src"), { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
      .map((file) => `${folder}/src/${file.split(path.sep).join("/")}`);
    for (const file of files) {
      const text = readFileSync(path.join(repository, file), "utf8");
      const resolved = [...text.matchAll(/require\.resolve\(\s*["'`]([^"'`]+)["'`]/gu)].map((match) => match[1]);
      for (const specifier of [...runtimeImports(file, text).specifiers, ...resolved]) {
        if (specifier.startsWith(".") || isBuiltin(specifier)) continue;
        const name = packageOf(specifier);
        // The workspaces' own aliases, which the base configuration's paths resolve to their sources.
        if (name === "@live-documentation/engine" && folder === "packages/engine") continue;
        if (!declared.has(name)) found.push(`${file} loads ${name}`);
      }
    }
  }
  return [...new Set(found)].sort();
}

describe("the lock's half of the lens's key", () => {
  it("did not move when the browser tests' Playwright was pinned to another version", () => {
    // The pin of 2026-11-20 (b5e8d8226): the lock's bytes changed, and until this rule the whole history was rebuilt.
    const before = committedLock("b5e8d8226~1");
    const after = committedLock("b5e8d8226");
    expect(after).not.toBe(before);
    expect(lockIdentity(after)).toBe(lockIdentity(before));
  });

  it("moves with the compiler, the tree-sitter runtime, the bundled grammars, and an integrity alone", () => {
    const today = lockIdentity(changedLock(() => undefined));
    const moved = (change: (packages: LockPackages) => void): string => lockIdentity(changedLock(change));
    expect(moved((packages) => void (packages["node_modules/typescript"].version = "5.9.4"))).not.toBe(today);
    expect(moved((packages) => void (packages["node_modules/web-tree-sitter"].version = "0.27.1"))).not.toBe(today);
    // The grammars this repository does not build itself come in one package of WebAssembly files.
    expect(moved((packages) => void (packages["node_modules/@vscode/tree-sitter-wasm"].version = "0.3.1"))).not.toBe(today);
    expect(moved((packages) => void (packages["node_modules/glob"].integrity = "sha512-another"))).not.toBe(today);
    // The launcher, which no manifest of the two packages declares.
    expect(moved((packages) => void (packages["node_modules/tsx"].resolved = "https://registry.example/tsx.tgz"))).not.toBe(today);
  });

  it("does not move with a package no summary loads, nor with what of a keyed entry decides no installed byte", () => {
    const today = lockIdentity(changedLock(() => undefined));
    const moved = (change: (packages: LockPackages) => void): string => lockIdentity(changedLock(change));
    expect(moved((packages) => void (packages["node_modules/playwright-core"].version = "9.9.9"))).toBe(today);
    expect(moved((packages) => void (packages["node_modules/eslint"] = { version: "0.0.1" }))).toBe(today);
    expect(moved((packages) => void (packages["node_modules/typescript"].dev = true))).toBe(today);
    expect(moved((packages) => void (packages["node_modules/typescript"].license = "MIT"))).toBe(today);
    expect(moved((packages) => void (packages[""].devDependencies = {}))).toBe(today);
  });

  it("keeps an identity of its own for an absent lock, and refuses a lock it cannot read", () => {
    expect(lockIdentity(null)).toBe("absent");
    expect(lockIdentity(null)).not.toBe(lockIdentity(changedLock(() => undefined)));
    expect(() => lockIdentity(JSON.stringify({ lockfileVersion: 1, dependencies: {} }))).toThrow(/no packages map/u);
  });

  it("finds a package where Node finds it: a nested entry for the package that holds it, the hoisted one for the rest", () => {
    const packages = {
      "packages/w": { dependencies: { a: "^1", c: "^1" } },
      "node_modules/a": { version: "1.0.0", dependencies: { b: "^2" } },
      "node_modules/a/node_modules/b": { version: "2.0.0" },
      "node_modules/b": { version: "3.0.0" },
      "node_modules/c": { version: "1.0.0", dependencies: { b: "^3" } },
      "node_modules/d": { version: "1.0.0" }
    };
    expect([...keyedLockEntries(packages, ["packages/w"], []).keys()].sort()).toEqual(["node_modules/a", "node_modules/a/node_modules/b", "node_modules/b", "node_modules/c", "packages/w"]);
    const onlyA = { ...packages, "packages/w": { dependencies: { a: "^1" } } };
    expect([...keyedLockEntries(onlyA, ["packages/w"], []).keys()].sort()).toEqual(["node_modules/a", "node_modules/a/node_modules/b", "packages/w"]);
    // A scoped package's nested entry wins over the hoisted one for the package that holds it.
    const scoped = { "packages/w": { dependencies: { "@s/a": "^1" } }, "node_modules/@s/a": { dependencies: { b: "^2" } }, "node_modules/@s/a/node_modules/b": { version: "2.0.0" }, "node_modules/b": { version: "3.0.0" } };
    expect([...keyedLockEntries(scoped, ["packages/w"], []).keys()].sort()).toEqual(["node_modules/@s/a", "node_modules/@s/a/node_modules/b", "packages/w"]);
    // A root is found from the folder it names, nearest first.
    const rooted = { "packages/w": {}, "packages/w/node_modules/t": { version: "1.0.0" }, "node_modules/t": { version: "2.0.0" } };
    expect([...keyedLockEntries(rooted, ["packages/w"], [{ from: "packages/w", name: "t" }]).keys()].sort()).toEqual(["packages/w", "packages/w/node_modules/t"]);
  });

  it("follows a workspace's link into the workspace's own entry, and its dependencies from there", () => {
    const packages = {
      "packages/x": { dependencies: { "@s/y": "file:../y" } },
      "node_modules/@s/y": { resolved: "packages/y", link: true },
      "packages/y": { version: "0.0.0", dependencies: { d: "^1" } },
      "packages/y/node_modules/d": { version: "1.0.0" },
      "node_modules/d": { version: "2.0.0" }
    };
    const keyed = keyedLockEntries(packages, ["packages/x", "packages/y"], []);
    expect([...keyed.keys()].sort()).toEqual(["node_modules/@s/y", "packages/x", "packages/y", "packages/y/node_modules/d"]);
    expect(keyed.get("node_modules/@s/y")).toEqual({ resolved: "packages/y", link: true });
  });

  it("refuses a link to a folder whose files the code half does not key", () => {
    // A `file:` folder dependency: npm writes a link and a folder entry with a version, and the folder's files would be
    // keyed by that version alone (the review of 2026-11-20).
    const packages = {
      "packages/x": { dependencies: { z: "file:../../lib/z" } },
      "node_modules/z": { resolved: "lib/z", link: true },
      "lib/z": { version: "1.0.0" }
    };
    expect(() => keyedLockEntries(packages, ["packages/x"], [])).toThrow(/links node_modules\/z to lib\/z, a folder whose files the lens does not key/u);
  });

  it("keys the launcher the command runs under as well as the one its workers run under, where the lock holds two", () => {
    // The command starts under the repository's own tsx (`npm run` puts the top's `node_modules/.bin` on the path) and
    // compiles the command's side of a summary with it; a worker starts under the tsx found from the generator.
    const packages = {
      "packages/engine": {},
      "packages/generator": {},
      "node_modules/glob": { version: "14.0.0" },
      "node_modules/tsx": { version: "4.0.0" },
      "packages/generator/node_modules/tsx": { version: "5.0.0" }
    };
    expect([...keyedLockEntries(packages).keys()].sort()).toEqual(["node_modules/glob", "node_modules/tsx", "packages/engine", "packages/generator", "packages/generator/node_modules/tsx"]);
  });

  it("passes over an optional dependency or a peer the lock does not hold, refuses a missing dependency, and ends at a cycle", () => {
    const packages = {
      "packages/w": { dependencies: { a: "^1" }, optionalDependencies: { fsevents: "^2" }, peerDependencies: { react: "^18" } },
      "node_modules/a": { version: "1.0.0", dependencies: { b: "^1" }, peerDependencies: { w: "*" } },
      "node_modules/b": { version: "1.0.0", dependencies: { a: "^1" } }
    };
    expect([...keyedLockEntries(packages, ["packages/w"], []).keys()].sort()).toEqual(["node_modules/a", "node_modules/b", "packages/w"]);
    const missing = { ...packages, "node_modules/b": { version: "1.0.0", dependencies: { gone: "^1" } } };
    expect(() => keyedLockEntries(missing, ["packages/w"], [])).toThrow(/holds no gone that node_modules\/b can load/u);
    expect(() => keyedLockEntries(packages, ["packages/w"], [{ from: "packages/w", name: "tsx" }])).toThrow(/holds no tsx/u);
  });

  it("finds an installation that is not the lock's where npm recorded what it installed, and only there", () => {
    const lock = readFileSync(path.join(repository, "package-lock.json"), "utf8");
    // npm's record of what it installed, `node_modules/.package-lock.json`: the lock's entries but the top's, as installed.
    const installed = (change: (packages: LockPackages) => void): string => {
      const record = JSON.parse(lock) as { packages: LockPackages };
      delete record.packages[""];
      change(record.packages);
      return JSON.stringify(record);
    };
    expect(installationDifference(lock, installed(() => undefined))).toBeNull();
    // A checkout or a pull without `npm ci`: the compiler installed is behind the lock's.
    expect(installationDifference(lock, installed((packages) => void (packages["node_modules/typescript"].version = "5.8.3")))).toContain("node_modules/typescript");
    expect(installationDifference(lock, installed((packages) => void delete packages["node_modules/web-tree-sitter"]))).toContain("node_modules/web-tree-sitter");
    // Another platform's binary, optional, is not installed here, and a package no summary loads is not asked about.
    expect(installationDifference(lock, installed((packages) => void delete packages["node_modules/@esbuild/win32-x64"]))).toBeNull();
    expect(installationDifference(lock, installed((packages) => void (packages["node_modules/playwright-core"].version = "1.0.0")))).toBeNull();
    // Where npm left no record, nothing is checked.
    expect(installationDifference(lock, null)).toBeNull();
    // This repository as it stands.
    expect(installationDifference(lock, readFileSync(path.join(repository, "node_modules", ".package-lock.json"), "utf8"))).toBeNull();
  });

  it("carries the installation and the working lock into the key's modified half, only where they differ in keyed entries", async () => {
    // A repository of the test's own making, laid out as this one: the two packages, a committed lock with a few keyed
    // entries and one no summary loads, and npm's record of the installation beside it.
    const top = mkdtempSync(path.join(tmpdir(), "lens-checkout-"));
    try {
      const environment = { ...process.env, GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
      const run = (...args: string[]): void => void execFileSync("git", args, { cwd: top, env: environment, stdio: "ignore" });
      const lock = {
        name: "fixture",
        lockfileVersion: 3,
        packages: {
          "": { name: "fixture", workspaces: ["packages/engine", "packages/generator"], devDependencies: { eslint: "^10.0.0", tsx: "^4.0.0" } },
          "packages/engine": { name: "@fixture/engine", version: "0.0.0", dependencies: { glob: "^14.0.0", typescript: "^5.0.0" } },
          "packages/generator": { name: "@fixture/generator", version: "0.0.0" },
          "node_modules/glob": { version: "14.0.6", resolved: "https://registry.example/glob-14.0.6.tgz", integrity: "sha512-glob" },
          "node_modules/typescript": { version: "5.9.3", resolved: "https://registry.example/typescript-5.9.3.tgz", integrity: "sha512-typescript" },
          "node_modules/tsx": { version: "4.23.15", resolved: "https://registry.example/tsx-4.23.15.tgz", integrity: "sha512-tsx", dev: true },
          "node_modules/eslint": { version: "10.15.0", resolved: "https://registry.example/eslint-10.15.0.tgz", integrity: "sha512-eslint", dev: true }
        }
      };
      const write = (file: string, text: string): void => {
        mkdirSync(path.dirname(path.join(top, file)), { recursive: true });
        writeFileSync(path.join(top, file), text);
      };
      const record = (change: (packages: LockPackages) => void = () => undefined): void => {
        const installed = JSON.parse(JSON.stringify(lock)) as { packages: LockPackages };
        delete installed.packages[""];
        change(installed.packages);
        write("node_modules/.package-lock.json", JSON.stringify(installed, null, 2));
      };
      const workingLock = (change: (packages: LockPackages) => void): void => {
        const changed = JSON.parse(JSON.stringify(lock)) as { packages: LockPackages };
        change(changed.packages);
        write("package-lock.json", JSON.stringify(changed, null, 2));
      };
      write("packages/engine/src/index.ts", "export const engine = 1;\n");
      write("packages/generator/src/index.ts", "export const generator = 1;\n");
      write("tsconfig.base.json", "{}\n");
      write("package-lock.json", JSON.stringify(lock, null, 2));
      write(".gitignore", "node_modules/\n");
      run("init", "--quiet", "-b", "main");
      run("add", "--all");
      run("commit", "--quiet", "-m", "A checkout");
      const modified = async (): Promise<string | null> => (await checkoutOf(path.join(top, "packages", "generator"), keysTheLens))!.modified;

      record();
      expect(await modified()).toBeNull();
      // An installation a pull left behind: the compiler installed at another version than the lock's.
      record((packages) => void (packages["node_modules/typescript"].version = "5.8.3"));
      const behind = await modified();
      expect(behind).not.toBeNull();
      // A package no summary loads installed at another version is not asked about.
      record((packages) => void (packages["node_modules/eslint"].version = "9.0.0"));
      expect(await modified()).toBeNull();
      // Where npm left no record, nothing is checked.
      rmSync(path.join(top, "node_modules"), { recursive: true });
      expect(await modified()).toBeNull();

      // The working lock against the committed one: a change inside the keyed set counts, one outside it does not.
      workingLock((packages) => void (packages["node_modules/eslint"].version = "10.16.0"));
      expect(await modified()).toBeNull();
      workingLock((packages) => void (packages["node_modules/typescript"].version = "5.9.4"));
      expect(await modified()).not.toBeNull();
    } finally {
      rmSync(top, { recursive: true, force: true });
    }
  });

  it("names as roots every package the two packages load without declaring it", () => {
    expect(undeclaredImports(LOCK_ROOTS)).toEqual([]);
    // The check can fail: the generator's code imports `glob`, which only the engine declares.
    expect(undeclaredImports(LOCK_ROOTS.filter((root) => root.name !== "glob"))).toContain("packages/generator/src/generator.ts loads glob");
    expect(undeclaredImports(LOCK_ROOTS.filter((root) => root.name !== "tsx"))).toContain("packages/generator/src/history/regenerate.ts loads tsx");
  });
});
